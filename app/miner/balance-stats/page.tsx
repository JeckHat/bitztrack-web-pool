'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RefreshCw } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  getDiamondHandsMultiplier,
  getLastChromiumReprocessingEarning,
  getLastDiamondHandsReprocessingEarning,
  getLastMinerSubmission,
  getLastOMCReprocessingEarning,
  getMinerEarningsSubmissions,
  getMinerRewards,
  getPoolChromiumReprocessingInfo,
  getPoolDiamondHandsReprocessingInfo,
  getPoolOMCReprocessingInfo
} from '@/lib/poolUtils'
import {
  DiamondHandsMultiplier,
  FullMinerBalanceString,
  ReprocessInfoWithDate,
  SubmissionEarningMinerInfo,
  SubmissionWithDate
} from '@/pages/api/apiDataTypes'
import { AutoComplete } from '../../../components/autocomplete'
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs'
import ChallengeEarningsTable from '../../../components/challenge-earnings-table'
import bigDecimal from 'js-big-decimal'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'

const COOLDOWN_DURATION = 60000 // 1 minute in milliseconds

export default function Page () {
  const submissionTimeWindoow = [
    {
      label: 'Last 1h',
      value: 1
    },
    {
      label: 'Last 6h',
      value: 6
    },
    {
      label: 'Last 12h',
      value: 12
    },
    {
      label: 'Last 24h',
      value: 24
    }
  ]

  const router = useRouter()
  const [publicKey, setPublicKey] = useState('')
  const [minerRewards, setMinerRewards] = useState<FullMinerBalanceString | null>(null)
  const [minerRewardsReprocessChromium, setMinerRewardsReprocessChromium] = useState<FullMinerBalanceString | null>(null)
  const [minerRewardsDiamondHands, setMinerRewardsDiamondHands] = useState<FullMinerBalanceString | null>(null)
  const [minerRewardsOMC, setMinerRewardsOMC] = useState<FullMinerBalanceString | null>(null)
  const [minerDiamondHandsMultiplier, setMinerDiamondHandsMultiplier] = useState<DiamondHandsMultiplier>({
    lastClaim: null,
    multiplier: 0
  })
  const [lastSubmission, setLastSubmission] = useState<SubmissionWithDate | null>(null)
  const [chromiumDatesInfo, setChromiumDatesInfo] = useState<ReprocessInfoWithDate | null>(null)
  const [diamondHandsDatesInfo, setDiamondHandsDatesInfo] = useState<ReprocessInfoWithDate | null>(null)
  const [OMCDatesInfo, setOMCDatesInfo] = useState<ReprocessInfoWithDate | null>(null)
  const [challengeEarnings, setChallengeEarnings] = useState<SubmissionEarningMinerInfo[]>([])
  const [avgPersonalHash, setAvgPersonalHash] = useState<number>(0)
  const [personalSubmissionsCount, setPersonalSubmissionsCount] = useState<number>(0)
  const [avgPoolHash, setAvgPoolHash] = useState<number>(0)
  const [poolSubmissionsCount, setPoolSubmissionsCount] = useState<number>(0)
  const [lastFetchTime, setLastFetchTime] = useState<number | null>(null)
  const [cooldownRemaining, setCooldownRemaining] = useState(0)
  const { toast } = useToast()
  const [suggestions, setSuggestions] = useState<{ value: string; label: string }[]>([])
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const searchParams = useSearchParams()
  const [loadingRewards, setLoadingRewards] = useState(false)
  const [loadingSubmissions, setLoadingSubmissions] = useState(false)

  useEffect(() => {
    try {
      const storedAddresses = JSON.parse(localStorage.getItem('recentAddresses') || '[]')
      setSuggestions(Array.isArray(storedAddresses) ? storedAddresses : [])
    } catch (error) {
      console.error('Error parsing stored addresses:', error)
      setSuggestions([])
    }

    // Check for 'key' query parameter
    const keyParam = searchParams?.get('key')
    if (keyParam) {
      setPublicKey(keyParam)
      fetchData(keyParam)
    }
  }, [])

  const updateRecentAddresses = (address: string) => {
    const storedAddresses: {
      value: string;
      label: string
    }[] = JSON.parse(localStorage.getItem('recentAddresses') || '[]')
    const updatedAddresses: { value: string; label: string }[] = [{
      label: address,
      value: address
    }, ...storedAddresses.filter((a) => a.value !== address)]
    localStorage.setItem('recentAddresses', JSON.stringify(updatedAddresses))
    setSuggestions(updatedAddresses)
  }

  useEffect(() => {
    const storedLastFetchTime = localStorage.getItem('lastBalanceStatsFetchTime')
    if (storedLastFetchTime) {
      setLastFetchTime(parseInt(storedLastFetchTime, 10))
    }
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      if (lastFetchTime) {
        const elapsed = Date.now() - lastFetchTime
        if (elapsed < COOLDOWN_DURATION) {
          setCooldownRemaining(Math.ceil((COOLDOWN_DURATION - elapsed) / 1000))
        } else {
          setCooldownRemaining(0)
        }
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [lastFetchTime])

  const fetchData = async (key?: string) => {
    const publicKeyToUse = key || publicKey
    if (!publicKeyToUse) {
      toast({
        title: 'Error',
        description: 'Please enter a public key',
        variant: 'destructive',
      })
      return
    }

    if (cooldownRemaining > 0) {
      toast({
        title: 'Cooldown Active',
        description: `Please wait ${cooldownRemaining} seconds before fetching again.`,
        variant: 'destructive',
      })
      return
    }

    router.push(`?key=${publicKeyToUse}`, { scroll: false })

    setLoadingRewards(true)

    try {
      const [rewards, submission, chromiumInfo, chromiumEarning, diamondHandsInfo, diamondHandsEarning, diamondHandsMultiplier, OMCInfo, OMCEarning] = await Promise.all([
        getMinerRewards(publicKeyToUse),
        getLastMinerSubmission(publicKeyToUse),
        getPoolChromiumReprocessingInfo(),
        getLastChromiumReprocessingEarning(publicKeyToUse),
        getPoolDiamondHandsReprocessingInfo(),
        getLastDiamondHandsReprocessingEarning(publicKeyToUse),
        getDiamondHandsMultiplier(publicKeyToUse),
        getPoolOMCReprocessingInfo(),
        getLastOMCReprocessingEarning(publicKeyToUse),
      ])

      setMinerRewards(rewards)
      setLastSubmission(submission)
      setChromiumDatesInfo(chromiumInfo)
      setDiamondHandsDatesInfo(diamondHandsInfo)
      setMinerRewardsReprocessChromium(chromiumEarning)
      setMinerRewardsDiamondHands(diamondHandsEarning)
      setMinerDiamondHandsMultiplier(diamondHandsMultiplier)
      setOMCDatesInfo(OMCInfo)
      setMinerRewardsOMC(OMCEarning)

      const now = Date.now()
      setLastFetchTime(now)
      localStorage.setItem('lastBalanceStatsFetchTime', now.toString())

      updateRecentAddresses(publicKeyToUse)

      toast({
        title: 'Data Fetched',
        description: 'Miner stats have been updated.',
      })
    } catch (error) {
      console.error('Error fetching data:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch miner stats. Please try again.',
        variant: 'destructive',
      })
    }

    setLoadingRewards(false)
  }

  const getChallengeEarnings = async (time: number | string, key?: string) => {
    let targetTime = 0
    if (typeof time === 'string') {
      targetTime = parseInt(time, 10)
    } else {
      targetTime = time
    }
    setChallengeEarnings([])
    setPoolSubmissionsCount(0)
    setPersonalSubmissionsCount(0)
    setAvgPersonalHash(0)
    setAvgPoolHash(0)
    const publicKeyToUse = key || publicKey
    if (!publicKeyToUse) {
      toast({
        title: 'Error',
        description: 'Please enter a public key',
        variant: 'destructive',
      })
      return
    }

    router.push(`?key=${publicKeyToUse}`, { scroll: false })

    setLoadingSubmissions(true)

    try {
      const submissionNow = new Date()
      const submissionHoursAgo = new Date(submissionNow.getTime() - targetTime * 60 * 60 * 1000)

      const earnings = await getMinerEarningsSubmissions(publicKeyToUse, submissionHoursAgo, submissionNow)
      console.log('earnings -->', earnings)
      setChallengeEarnings(earnings)

      const poolSubmissions = new Set(earnings.map(entry => entry.challengeId)).size
      setPoolSubmissionsCount(poolSubmissions)

      // calculate the avg personal and pool hash
      const totalPersonalHash = earnings.reduce((acc, entry) => parseFloat(bigDecimal.add(acc, entry.minerHashpower)), 0)
      if (earnings.length > 0) {
        setAvgPersonalHash(Math.round(parseFloat(bigDecimal.divide(totalPersonalHash, earnings.length))))
      } else {
        setAvgPersonalHash(0)
      }
      setPersonalSubmissionsCount(earnings.length)
      const totalPoolHash = earnings.reduce((acc, entry) => parseFloat(bigDecimal.add(acc, entry.bestChallengeHashpower)), 0)
      if (earnings.length > 0) {
        setAvgPoolHash(Math.round(parseFloat(bigDecimal.divide(totalPoolHash, earnings.length))))
      } else {
        setAvgPoolHash(0)
      }

      const now = Date.now()
      setLastFetchTime(now)
      localStorage.setItem('lastBalanceStatsFetchTime', now.toString())
      updateRecentAddresses(publicKeyToUse)
      toast({
        title: 'Data Fetched',
        description: 'Miner stats have been updated.',
      })
    } catch (error) {
      console.error('Error fetching data:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch miner stats. Please try again.',
        variant: 'destructive',
      })
    }
    setLoadingSubmissions(false)
  }

  return (
    <div className="px-6 py-10">
      <h1 className="text-4xl font-bold text-center mb-8">Miner Info</h1>
      <div className="text-center mb-6">
        <p className="text-lg leading-relaxed">
          Put a public address in the input field to fetch the miner&#39;s balance.
        </p>
      </div>
      <div className="flex mb-4">
        <div className="relative w-full mr-2">
          <AutoComplete selectedValue={publicKey} onSelectedValueChange={setPublicKey} searchValue={publicKey}
                        onSearchValueChange={setPublicKey} items={suggestions}></AutoComplete>
        </div>
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <div
              onMouseEnter={() => setIsPopoverOpen(true)}
              onMouseLeave={() => setIsPopoverOpen(false)}>
              <Button onClick={() => fetchData()} disabled={cooldownRemaining > 0}>
                <RefreshCw className="mr-2 h-4 w-4"/> Fetch Data
              </Button>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2">
            {cooldownRemaining > 0 ? (
              <p>Refresh cooldown: {cooldownRemaining} seconds</p>
            ) : (
              <p>Click to refresh balance</p>
            )}
          </PopoverContent>
        </Popover>
      </div>
      <Tabs defaultValue="rewards" className="w-full">
        <TabsList className="grid w-full grid-col-1 sm:grid-cols-2 h-fit">
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
        </TabsList>
        <TabsContent value="rewards">
          {loadingRewards && (
            <Card>
              <CardHeader>
                <CardTitle>
                  <div className="flex flex-row gap-2 items-center">
                    <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                    <span>Loading...</span>
                  </div>
                </CardTitle>
              </CardHeader>
            </Card>
          )}
          {!publicKey && (
            <Card>
              <CardHeader>
                <CardTitle>Search a public key to see rewards</CardTitle>
              </CardHeader>
            </Card>
          )}
          {minerRewards && (
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>Miner Rewards</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Coal: {minerRewards.coal.toLocaleString()}</p>
                <p>Ore: {minerRewards.ore.toLocaleString()}</p>
                <p>Chromium: {minerRewards.chromium.toLocaleString()}</p>
                <p>Ingot: {minerRewards.ingot.toLocaleString()}</p>
                <p>Wood: {minerRewards.wood.toLocaleString()}</p>
              </CardContent>
            </Card>
          )}

          {lastSubmission && (
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>Last Submission</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Difficulty: {lastSubmission.difficulty}</p>
                <p>Mined at: {lastSubmission.created_at.toLocaleString()}</p>
              </CardContent>
            </Card>
          )}

          {chromiumDatesInfo && (
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>Chromium Reprocessing Info</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Last Reprocess: {chromiumDatesInfo.last_reprocess.toLocaleString()}</p>
                <p>Obtained: {minerRewardsReprocessChromium?.chromium ?? '-'} CHROMIUM</p>
                <p>Next Reprocess: {chromiumDatesInfo.next_reprocess.toLocaleString()}</p>
              </CardContent>
            </Card>
          )}

          {diamondHandsDatesInfo && (
            <Card>
              <CardHeader>
                <CardTitle>Diamond Hands Info</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Last Reprocess: {diamondHandsDatesInfo.last_reprocess.toLocaleString()}</p>
                <p>Main rewards: {minerRewardsDiamondHands?.coal ?? '-'} COAL
                  - {minerRewardsDiamondHands?.ore ?? '-'} ORE</p>
                <p>Extra rewards: {minerRewardsDiamondHands?.ingot ?? '-'} INGOT
                  - {minerRewardsDiamondHands?.wood ?? '-'} WOOD</p>
                <p>Miner multiplier: {minerDiamondHandsMultiplier.multiplier}x</p>
                <p>Last Claim: {minerDiamondHandsMultiplier.lastClaim?.toLocaleString() ?? '-'}</p>
                <p>Next Reprocess: {diamondHandsDatesInfo.next_reprocess.toLocaleString()}</p>
              </CardContent>
            </Card>
          )}
          {OMCDatesInfo && (
            <Card>
              <CardHeader>
                <CardTitle>OMC NFT Reprocess Info</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Last Reprocess: {OMCDatesInfo.last_reprocess.toLocaleString()}</p>
                <p>Main rewards: {minerRewardsOMC?.coal ?? '-'} COAL
                  - {minerRewardsOMC?.ore ?? '-'} ORE</p>
                <p>Extra rewards: {minerRewardsOMC?.ingot ?? '-'} INGOT
                  - {minerRewardsOMC?.wood ?? '-'} WOOD</p>
                <p>Next Reprocess: {OMCDatesInfo.next_reprocess.toLocaleString()}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="submissions">
          {!publicKey && (
            <Card>
              <CardHeader>
                <CardTitle>Search a public key to see rewards</CardTitle>
              </CardHeader>
            </Card>
          )}
          <Card>
            <CardHeader>
              <CardTitle>
                <Select disabled={loadingSubmissions} onValueChange={getChallengeEarnings}>
                  <SelectTrigger className="w-1/2 mb-2">
                    <SelectValue placeholder="Submission time"/>
                  </SelectTrigger>
                  <SelectContent>
                    {submissionTimeWindoow.map(({ label, value }) => (
                      <SelectItem key={value} value={value.toString()}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                Avg Personal
                H/s: {avgPersonalHash.toLocaleString()} on {personalSubmissionsCount.toLocaleString()} submissions <br/>
                Avg Pool
                H/s: {avgPoolHash.toLocaleString()} on {poolSubmissionsCount.toLocaleString()} submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <ChallengeEarningsTable data={challengeEarnings}/>
              {loadingSubmissions && (
                <div className="flex flex-row gap-2 items-center mt-4 ml-4">
                  <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                  <span>Loading...</span>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

