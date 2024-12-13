'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RefreshCw } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { getLastMinerSubmission, getMinerRewards, getPoolChromiumReprocessingInfo } from '@/lib/poolUtils'
import { ChromiumReprocessInfoWithDate, MinerBalanceString, SubmissionWithDate } from '@/pages/api/apiDataTypes'
import { AutoComplete } from '../../../components/autocomplete'
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover'

const COOLDOWN_DURATION = 60000 // 1 minute in milliseconds

export default function Page () {
  const [publicKey, setPublicKey] = useState('')
  const [minerRewards, setMinerRewards] = useState<MinerBalanceString | null>(null)
  const [lastSubmission, setLastSubmission] = useState<SubmissionWithDate | null>(null)
  const [chromiumInfo, setChromiumInfo] = useState<ChromiumReprocessInfoWithDate | null>(null)
  const [lastFetchTime, setLastFetchTime] = useState<number | null>(null)
  const [cooldownRemaining, setCooldownRemaining] = useState(0)
  const { toast } = useToast()
  const [suggestions, setSuggestions] = useState<{ value: string; label: string }[]>([])
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  useEffect(() => {
    try {
      const storedAddresses = JSON.parse(localStorage.getItem('recentAddresses') || '[]')
      setSuggestions(Array.isArray(storedAddresses) ? storedAddresses : [])
    } catch (error) {
      console.error('Error parsing stored addresses:', error)
      setSuggestions([])
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

  const fetchData = async () => {
    if (!publicKey) {
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

    try {
      const [rewards, submission, chromium] = await Promise.all([
        getMinerRewards(publicKey),
        getLastMinerSubmission(publicKey),
        getPoolChromiumReprocessingInfo(),
      ])

      setMinerRewards(rewards)
      setLastSubmission(submission)
      setChromiumInfo(chromium)

      const now = Date.now()
      setLastFetchTime(now)
      localStorage.setItem('lastBalanceStatsFetchTime', now.toString())

      updateRecentAddresses(publicKey)

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
      <h1 className="text-2xl font-bold mb-4">Miner Balance and Stats</h1>
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
              <Button onClick={fetchData} disabled={cooldownRemaining > 0}>
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

      {chromiumInfo && (
        <Card>
          <CardHeader>
            <CardTitle>Chromium Reprocessing Info</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Last Reprocess: {chromiumInfo.last_reprocess.toLocaleString()}</p>
            <p>Next Reprocess: {chromiumInfo.next_reprocess.toLocaleString()}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

