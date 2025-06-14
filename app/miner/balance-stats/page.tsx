'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RefreshCw } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  getMinerEarningsSubmissions,
} from '@/lib/poolUtils'
import {
  DiamondHandsMultiplier,
  FullMinerBalanceString,
  ReprocessInfoWithDate,
  SubmissionEarningMinerInfo,
  SubmissionWithDate
} from '@/pages/api/apiDataTypes'
import { AutoComplete } from '../../../components/autocomplete'
import { Popover, PopoverTrigger } from '../../../components/ui/popover'
import { Tabs, TabsContent } from '../../../components/ui/tabs'
import ChallengeEarningsTable from '../../../components/challenge-earnings-table'
import bigDecimal from 'js-big-decimal'

const COOLDOWN_DURATION = 60000 // 1 minute in milliseconds

export default function Page () {
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
  }

  const getChallengeEarnings = async (key?: string) => {
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
      const earnings = await getMinerEarningsSubmissions(publicKeyToUse)
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

      // const now = Date.now()
      // setLastFetchTime(now)
      // localStorage.setItem('lastBalanceStatsFetchTime', now.toString())
      // updateRecentAddresses(publicKeyToUse)
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
              <Button onClick={() => getChallengeEarnings()}>
                <RefreshCw className="mr-2 h-4 w-4"/> Fetch Data
              </Button>
            </div>
          </PopoverTrigger>
          {/* <PopoverContent className="w-auto p-2">
            {cooldownRemaining > 0 ? (
              <p>Refresh cooldown: {cooldownRemaining} seconds</p>
            ) : (
              <p>Click to refresh balance</p>
            )}
          </PopoverContent> */}
        </Popover>
      </div>
      <Tabs defaultValue="submissions" className="w-full">
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

