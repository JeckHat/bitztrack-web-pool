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
  getMinerRewards,
  getPoolChromiumReprocessingInfo,
  getPoolDiamondHandsReprocessingInfo
} from '@/lib/poolUtils'
import {
  DiamondHandsMultiplier,
  FullMinerBalanceString,
  MinerBalanceString,
  ReprocessInfoWithDate,
  SubmissionWithDate
} from '@/pages/api/apiDataTypes'
import { AutoComplete } from '../../../components/autocomplete'
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover'

const COOLDOWN_DURATION = 60000 // 1 minute in milliseconds

export default function Page () {
  const router = useRouter()
  const [publicKey, setPublicKey] = useState('')
  const [minerRewards, setMinerRewards] = useState<MinerBalanceString | null>(null)
  const [minerRewardsReprocessChromium, setMinerRewardsReprocessChromium] = useState<FullMinerBalanceString | null>(null)
  const [minerRewardsDiamondHands, setMinerRewardsDiamondHands] = useState<FullMinerBalanceString | null>(null)
  const [minerDiamondHandsMultiplier, setMinerDiamondHandsMultiplier] = useState<DiamondHandsMultiplier>({
    lastClaim: null,
    multiplier: 0
  })
  const [lastSubmission, setLastSubmission] = useState<SubmissionWithDate | null>(null)
  const [chromiumDatesInfo, setChromiumDatesInfo] = useState<ReprocessInfoWithDate | null>(null)
  const [diamondHandsDatesInfo, setDiamondHandsDatesInfo] = useState<ReprocessInfoWithDate | null>(null)
  const [lastFetchTime, setLastFetchTime] = useState<number | null>(null)
  const [cooldownRemaining, setCooldownRemaining] = useState(0)
  const { toast } = useToast()
  const [suggestions, setSuggestions] = useState<{ value: string; label: string }[]>([])
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const searchParams = useSearchParams()

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

    try {
      const [rewards, submission, chromiumInfo, diamondHandsInfo, chromiumEarning, diamondHandsEarning, diamondHandsMultiplier] = await Promise.all([
        getMinerRewards(publicKeyToUse),
        getLastMinerSubmission(publicKeyToUse),
        getPoolChromiumReprocessingInfo(),
        getPoolDiamondHandsReprocessingInfo(),
        getLastChromiumReprocessingEarning(publicKeyToUse),
        getLastDiamondHandsReprocessingEarning(publicKeyToUse),
        getDiamondHandsMultiplier(publicKeyToUse)
      ])

      setMinerRewards(rewards)
      setLastSubmission(submission)
      setChromiumDatesInfo(chromiumInfo)
      setDiamondHandsDatesInfo(diamondHandsInfo)
      setMinerRewardsReprocessChromium(chromiumEarning)
      setMinerRewardsDiamondHands(diamondHandsEarning)
      setMinerDiamondHandsMultiplier(diamondHandsMultiplier)

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
  }

  return (
    <div className="max-w-4xl w-[min(56rem,100vw)]  mx-auto px-6 py-10">
      <h1 className="text-4xl font-bold text-center mb-8">Miner balances</h1>
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
      {minerRewards && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Miner Rewards</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Coal: {minerRewards.coal}</p>
            <p>Ore: {minerRewards.ore}</p>
            <p>Chromium: {minerRewards.chromium}</p>
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
        <Card>
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
            <p>Obtained: {minerRewardsDiamondHands?.coal ?? '-'} COAL - {minerRewardsDiamondHands?.ore ?? '-'} ORE</p>
            <p>Miner multiplier: {minerDiamondHandsMultiplier.multiplier}x</p>
            <p>Last Claim: {minerDiamondHandsMultiplier.lastClaim?.toLocaleString() ?? '-'}</p>
            <p>Next Reprocess: {diamondHandsDatesInfo.next_reprocess.toLocaleString()}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

