'use client'

import React, { useEffect, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card'
import { Input } from '../../../components/ui/input'
import { Button } from '../../../components/ui/button'
import { getLPStake, getMinerRewards, getTokenBalance } from '../../../lib/poolUtils'
import { COAL_SOL_LP_MINT_ADDRESS } from '../../../lib/constants'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs'
import { MinerBalanceString } from '../../../pages/api/apiDataTypes'
import { RefreshCw } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const COOLDOWN_DURATION = 60000 // 1 minute in milliseconds

export default function Page () {
  const wallet = useWallet()
  const { toast } = useToast()
  const [minerRewards, setMinerRewards] = useState<MinerBalanceString | null>(null)
  const [lpBalance, setLpBalance] = useState({ staked: 0, wallet: 0 })
  const [unstakeAmount, setUnstakeAmount] = useState('')
  const [lastFetchTime, setLastFetchTime] = useState<number | null>(null)
  const [cooldownRemaining, setCooldownRemaining] = useState(0)

  useEffect(() => {
    const storedLastFetchTime = localStorage.getItem('lastClaimRewardsFetchTime')
    if (storedLastFetchTime) {
      const lastFetchTime = parseInt(storedLastFetchTime, 10)
      setLastFetchTime(lastFetchTime)
      const elapsed = Date.now() - lastFetchTime
      if (elapsed < COOLDOWN_DURATION) {
        setCooldownRemaining(Math.ceil((COOLDOWN_DURATION - elapsed) / 1000))
      } else {
        // Only fetch if the cooldown has expired
        if (wallet.publicKey) {
          fetchData()
        }
      }
    } else {
      // If there's no stored fetch time, it's the first fetch
      if (wallet.publicKey) {
        fetchData()
      }
    }
  }, [wallet.publicKey])

  useEffect(() => {
    const storedLastFetchTime = localStorage.getItem('lastClaimRewardsFetchTime')
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
    if (wallet.publicKey) {
      if (cooldownRemaining > 0) {
        toast({
          title: 'Cooldown Active',
          description: `Please wait ${cooldownRemaining} seconds before fetching again.`,
          variant: 'destructive',
        })
        return
      }

      try {
        const [rewardsResponse, lpWalletBalance, lpStakeBalance] = await Promise.all([
          getMinerRewards(wallet.publicKey.toString()),
          getTokenBalance(wallet.publicKey, COAL_SOL_LP_MINT_ADDRESS),
          getLPStake(wallet.publicKey)
        ])

        setMinerRewards(rewardsResponse)
        setLpBalance(prev => ({ ...prev, wallet: lpWalletBalance, staked: lpStakeBalance }))

        const now = Date.now()
        setLastFetchTime(now)
        localStorage.setItem('lastClaimRewardsFetchTime', now.toString())
        setCooldownRemaining(COOLDOWN_DURATION / 1000) // Set cooldown to full duration

        toast({
          title: 'Data Fetched',
          description: 'Claim rewards data has been updated.',
        })
      } catch (error) {
        console.error('Error fetching data:', error)
        toast({
          title: 'Error',
          description: 'Failed to fetch claim rewards data. Please try again.',
          variant: 'destructive',
        })
      }
    }
  }

  const handleClaimMiningRewards = () => {
    // Implement claim mining rewards logic
    console.log('Claiming mining rewards')
  }

  const handleUnstake = () => {
    // Implement unstake logic
    console.log('Unstaking', unstakeAmount)
  }

  const isUnstakeButtonDisabled = () => {
    const amount = parseFloat(unstakeAmount)
    return isNaN(amount) || amount <= 0 || amount > lpBalance.staked
  }

  return (
    <div className="max-w-4xl w-[min(56rem,100vw)] mx-auto px-6 py-10">
      <h1 className="text-4xl font-bold text-center mb-2">Claim Rewards</h1>
      <h4 className="text-sm text-center mb-1">
        <strong>Minimum withdrawal: 5 COAL or 0.05 ORE.</strong>
      </h4>
      <h4 className="text-sm text-center mb-8 italic">
        Note: A one-time fee of 4 COAL or 0.02 ORE applies if you don&#39;t have an existing token account.
      </h4>

      <Tabs defaultValue="mining" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="mining">Mining Rewards</TabsTrigger>
          <TabsTrigger value="unstake">Unstake Guild LP</TabsTrigger>
        </TabsList>

        <TabsContent value="mining">
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center justify-between">
                  Mining Rewards
                  <Button
                    onClick={fetchData}
                    disabled={cooldownRemaining > 0}
                    className="relative"
                  >
                    <RefreshCw className="mr-2 h-4 w-4"/>
                    {cooldownRemaining > 0 ? `Refresh (${cooldownRemaining}s)` : 'Refresh Data'}
                    {cooldownRemaining > 0 && (
                      <div
                        className="absolute bottom-0 left-0 h-1 bg-primary"
                        style={{
                          width: `${((COOLDOWN_DURATION - cooldownRemaining * 1000) / COOLDOWN_DURATION) * 100}%`,
                          transition: 'width 1s linear'
                        }}
                      />
                    )}
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-md mb-6">
                <p className="mb-2">
                  <strong>COAL</strong> and <strong>ORE</strong> rewards are earned every minute while you&#39;re
                  actively mining in the pool. These rewards are distributed when a mining transaction is submitted.
                </p>
                <p>
                  <strong>CHROMIUM</strong> is earned each time the pool reprocesses COAL, provided you&#39;ve been
                  active in the pool during the previous days.
                </p>
              </div>
              <p>COAL: {minerRewards?.coal || '0'}</p>
              <p>ORE: {minerRewards?.ore || '0'}</p>
              <p>CHROMIUM: {minerRewards?.chromium || '0'}</p>
            </CardContent>
            <CardFooter>
              <Button onClick={handleClaimMiningRewards}><strong>CLAIM ALL MINING REWARDS</strong></Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="unstake">
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center justify-between">
                  Unstake Guild LP
                  <Button
                    onClick={fetchData}
                    disabled={cooldownRemaining > 0}
                    className="relative"
                  >
                    <RefreshCw className="mr-2 h-4 w-4"/>
                    {cooldownRemaining > 0 ? `Refresh (${cooldownRemaining}s)` : 'Refresh Data'}
                    {cooldownRemaining > 0 && (
                      <div
                        className="absolute bottom-0 left-0 h-1 bg-primary"
                        style={{
                          width: `${((COOLDOWN_DURATION - cooldownRemaining * 1000) / COOLDOWN_DURATION) * 100}%`,
                          transition: 'width 1s linear'
                        }}
                      />
                    )}
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-md mb-6">
                <p className="mb-2">
                  Guild rewards are calculated based on the amount of LP tokens you have staked.
                </p>
                <p>
                  Reducing or removing your staked LP tokens will proportionally decrease the amount of rewards you can
                  earn. Consider this carefully before unstaking.
                </p>
              </div>
              <p>LP Staked: {lpBalance.staked}</p>
              <p>LP in Wallet: {lpBalance.wallet}</p>
              <Input
                type="number"
                placeholder="Amount to unstake"
                value={unstakeAmount}
                onChange={(e) => setUnstakeAmount(e.target.value)}
                className="mt-4"
              />
            </CardContent>
            <CardFooter>
              <Button onClick={handleUnstake} disabled={isUnstakeButtonDisabled()}><strong>UNSTAKE</strong></Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

{/*<TabsTrigger value="guild">Guild Rewards</TabsTrigger>*/}

{/* <TabsContent value="guild">
          <Card>
            <CardHeader>
              <CardTitle>Guild LP Staking Rewards</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-md mb-6">
                <p className="mb-2">
                  Guild rewards are distributed every few hours to users who provide COAL-SOL LP tokens to the
                  guild.
                </p>
                <p>
                  These rewards accumulate passively - you don&#39;t need to actively mine to earn them. The amount of
                  rewards is proportional to your staked LP tokens.
                </p>
              </div>
              <p>LP Staked: {poolStakeAndMultipliers?.total_lp_staked || '0'}</p>
              <p>Estimated Return per Day: {poolStakeAndMultipliers?.estimated_daily_return || '0'}</p>
              <p>Claimable COAL: {poolStakeAndMultipliers?.claimable_coal || '0'}</p>
            </CardContent>
            <CardFooter>
              <Button onClick={handleClaimGuildRewards}><strong>CLAIM GUILD REWARDS</strong></Button>
            </CardFooter>
          </Card>
        </TabsContent> */
}
