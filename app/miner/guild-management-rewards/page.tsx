'use client'

import React, { useEffect, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card'
import { Input } from '../../../components/ui/input'
import { Button } from '../../../components/ui/button'
import {
  getLPStake,
  getMinerGuildStakeRewards,
  getMinerGuildStakeRewards24h,
  getPoolStakeAndMultipliers,
  getTokenBalance
} from '../../../lib/poolUtils'
import { COAL_SOL_LP_MINT_ADDRESS } from '../../../lib/constants'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs'
import { StakeAndMultipliersString } from '../../../pages/api/apiDataTypes'
import { RefreshCw } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { unstakeFromGuild } from '../../../lib/unstakeFromGuild'
import Link from 'next/link'
import { Label } from '../../../components/ui/label'
import { stakeToGuild } from '../../../lib/stakeToGuild'

const COOLDOWN_DURATION = 60000 // 1 minute in milliseconds

export default function Page () {
  const wallet = useWallet()
  const { toast } = useToast()
  const [guildRewards, setGuildRewards] = useState({ guildRewards: '0', guildRewards24h: '0' })
  const [lpBalance, setLpBalance] = useState({ staked: 0, wallet: 0 })
  const [unstakeAmount, setUnstakeAmount] = useState('')
  const [lastFetchTime, setLastFetchTime] = useState<number | null>(null)
  const [cooldownRemaining, setCooldownRemaining] = useState(0)
  const [isClaiming, setIsClaiming] = useState(false)
  const [poolStakeAndMultipliers, setPoolStakeAndMultipliers] = useState<StakeAndMultipliersString | null>(null)
  const [stakeAmount, setStakeAmount] = useState('')
  const [isStaking, setIsStaking] = useState(false)
  const [selectedTab, setSelectedTab] = useState('rewards')

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
        fetchData()
      }
    } else {
      // If there's no stored fetch time, it's the first fetch
      fetchData()
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
        const [lpWalletBalance, lpStakeBalance, poolStakeData, guildStakeRewards, guildStakeRewards24h] = await Promise.all([
          getTokenBalance(wallet.publicKey, COAL_SOL_LP_MINT_ADDRESS),
          getLPStake(wallet.publicKey),
          getPoolStakeAndMultipliers(),
          getMinerGuildStakeRewards(wallet.publicKey.toString()),
          getMinerGuildStakeRewards24h(wallet.publicKey.toString()),
        ])

        setGuildRewards({ guildRewards: guildStakeRewards, guildRewards24h: guildStakeRewards24h })
        setLpBalance({ wallet: lpWalletBalance, staked: lpStakeBalance })
        setPoolStakeAndMultipliers(poolStakeData)

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
    } else {
      toast({
        title: 'Wallet connection', description: 'Please connect your wallet first', variant: 'destructive'
      })
    }
  }

  const handleUnstake = async () => {
    if (!wallet.connected || !wallet.publicKey) {
      toast({ title: 'Wallet Error', description: 'Please connect your wallet first', variant: 'destructive' })
      return
    }

    if (isUnstakeButtonDisabled()) {
      toast({
        title: 'Insufficient Amount',
        description: `You need to provide an amount to unstake. Please enter a valid amount greater than 0 and less than or equal to your staked LP tokens.`,
        variant: 'destructive',
      })
      return
    }

    setIsClaiming(true) // Start the loading state

    try {
      await unstakeFromGuild(parseFloat(unstakeAmount), wallet)
      toast({ title: 'Unstake successful', description: 'Successfully unstaked from guild!', variant: 'default' })
      fetchData()
    } catch (error) {
      console.error('Unstake failed:', error)
      toast({ title: 'Unstake failed', description: (error as string).toString(), variant: 'destructive' })
    } finally {
      setIsClaiming(false) // End the loading state
    }
  }

  const isUnstakeButtonDisabled = () => {
    const amount = parseFloat(unstakeAmount)
    return !wallet.connected || isNaN(amount) || isNaN(lpBalance.staked) || amount <= 0 || amount > lpBalance.staked || lpBalance.staked <= 0
  }

  const isStakeButtonDisabled = () => {
    const amount = parseFloat(stakeAmount)
    return !wallet.connected || isNaN(amount) || amount > lpBalance.wallet || amount <= 0
  }

  const handleStake = async () => {
    if (!wallet.connected || !wallet.publicKey) {
      toast({ title: 'Wallet Error', description: 'Please connect your wallet first', variant: 'destructive' })
      return
    }

    if (parseFloat(stakeAmount) > lpBalance.wallet) {
      toast({ title: 'Balance Error', description: 'Insufficient balance, use a valid amount', variant: 'destructive' })
      return
    }

    setIsStaking(true) // Start the loading state

    try {
      await stakeToGuild(parseFloat(stakeAmount), wallet)
      //wait for 2 seconds
      await new Promise((resolve) => setTimeout(resolve, 2000))
      toast({ title: 'Staking successful', description: 'Stake successfully added to the guild!', variant: 'default' })
      const [lpWalletBalance, lpStakeBalance] = await Promise.all([
        getTokenBalance(wallet.publicKey, COAL_SOL_LP_MINT_ADDRESS),
        getLPStake(wallet.publicKey),
      ])

      setLpBalance({ wallet: lpWalletBalance, staked: lpStakeBalance })
      setStakeAmount('')
    } catch (error) {
      console.error('Staking failed:', error)
      toast({ title: 'Staking failed', description: (error as string).toString(), variant: 'destructive' })
    } finally {
      setIsStaking(false) // End the loading state
    }
  }

  const renderTitleAndSubtitle = () => {
    switch (selectedTab) {
      case 'rewards':
        return (
          <>
            <h1 className="text-4xl font-bold text-center mb-8">Guild Rewards</h1>
            <div className="text-center mb-6">
              <p className="text-lg leading-relaxed">
                Maximize your LP earning with the Guild system.
              </p>
            </div>
          </>
        )
      case 'stake':
        return (
          <>
            <h1 className="text-4xl font-bold text-center mb-8">Guild Stake</h1>
            <div className="text-center mb-6">
              <p className="text-lg leading-relaxed">
                Stake your LP tokens to the Guild, get multipliers and obtain rewards.
              </p>
              <p className="text-destructive text-sm">Warning: Providing liquidity carries risk because of price
                fluctuations.
                DYOR or ask to one admin for information before using Meteora.</p>
            </div>
          </>
        )
      case 'unstake':
      default:
        return (
          <>
            <h1 className="text-4xl font-bold text-center mb-8">Guild Unstake</h1>
            <div className="text-center mb-6">
              <p className="text-lg leading-relaxed">
                Reclaim you LP tokens.
              </p>
            </div>
          </>
        )
    }
  }

  return (
    <div className="max-w-4xl w-[min(56rem,100vw)] mx-auto px-6 py-10">
      {renderTitleAndSubtitle()}

      <Tabs defaultValue="rewards" className="w-full" onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-col-1 sm:grid-cols-3 h-fit">
          <TabsTrigger value="rewards">Guild Rewards</TabsTrigger>
          <TabsTrigger value="stake">Guild Stake</TabsTrigger>
          <TabsTrigger value="unstake">Guild Unstake</TabsTrigger>
        </TabsList>

        <TabsContent value="rewards">
          <Card>
            <CardHeader>
              <CardTitle>Guild LP Staking Rewards</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-md mb-6">
                <ul className="list-disc list-inside mb-2">
                  <li>
                    Stake your <strong>COAL-SOL LP</strong> tokens in the guild to earn passive rewards.
                  </li>
                  <li>
                    Rewards are distributed automatically every few hours based on your staked amount.
                  </li>
                  <li>
                    Rewards from Excalivator Pool are <strong>automatically</strong> compounded in the pool stake and
                    your miner rewards
                  </li>
                  <li>
                    You don&#39;t need to actively mine to earn these rewards - they accumulate as long as your LP
                    tokens
                    are staked.
                  </li>
                  <li>
                    The Excalivator Mining Pool has <strong>partnered</strong> with GPOOL, creating a guild coalition
                    allowing
                    you to earn
                    additional
                    LP rewards from <strong>both pools</strong>.
                  </li>
                  <li>
                    Visit the <a
                    href="https://dashboard.gpool.cloud/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    GPOOL dashboard
                  </a> to claim your LP staking rewards.
                  </li>
                </ul>
              </div>
              <p className="text-yellow-500 font-semibold">
                The rewards you see here are automatically compounded in your miner rewards balance.<br/>You can see the
                total
                balance in the <Link href="/miner/management-rewards"
                                     className="underline text-blue-500 hover:text-blue-700">Management Page</Link>
              </p>
              <p>LP Staked: {lpBalance.staked || '0'}</p>
              <p>Estimated Daily Return: {guildRewards.guildRewards24h || '0'}</p>
              <p>Total COAL Rewards: {guildRewards.guildRewards || '0'}</p>
            </CardContent>
            <CardFooter>
              {/* Uncomment this button when the claim feature is implemented
      <Button onClick={handleClaimGuildRewards} disabled={true}>
        <strong>CLAIM GUILD REWARDS</strong>
      </Button>
      */}
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="stake">
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span>
                    Stake to the Guild
                    </span>
                    <span>
                    Multiplier: {poolStakeAndMultipliers?.guild_multiplier ?? '-'}x - Total
                    Stake: {poolStakeAndMultipliers?.guild_stake ?? '-'} COAL-SOL
                    </span>
                  </div>
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
                <h3 className="text-lg font-semibold mb-2">Benefits of Staking LP to the Guild</h3>
                <ul className="list-disc list-inside mb-2">
                  <li><strong>0 transactions fees</strong> are required to stake, they are payed by the pool.</li>
                  <li>A small fee to create the guild personal account may be added <strong>the first time</strong> from
                    Solana.
                  </li>
                  <li>Adds a multiplier for <strong>every COAL we mine</strong>, benefiting all miners.</li>
                  <li>Creates <strong>passive returns</strong> for LP stakers from a portion of mining earnings.</li>
                  <li>Staking is <strong>not required</strong> to get the bonus, but provides additional passive
                    rewards.
                  </li>
                </ul>
                <p className="mt-4">
                  You can obtain COAL-SOL LP tokens from <strong>Meteora</strong>.
                  <Link href="https://app.meteora.ag/pools/F6LXJ8CptcmrofbszVHBRsBvVTX2rNWwFbjCARZukzNS"
                        target="_blank"
                        className="underline text-blue-500 hover:text-blue-700 ml-2">
                    Get COAL-SOL LP here
                  </Link>
                </p>
              </div>
              <div className="mt-4">
                <Label htmlFor="balanceLP">Available Balance:</Label>
                <p id="balanceLP" className="text-lg font-semibold">{lpBalance.wallet} COAL-SOL LP</p>
              </div>
              <div>
                <Label htmlFor="amount">Amount to Stake:</Label>
                <Input
                  id="amount"
                  type="number"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  placeholder="Enter amount to stake"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                size="lg"
                className="relative"
                onClick={handleStake}
                disabled={isStakeButtonDisabled() || isStaking}
              >
                {isStaking && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                  </div>
                )}
                <span className={isStaking ? 'opacity-0' : ''}>
                    <strong>STAKE</strong>
                  </span>
              </Button>
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
                    size="lg"
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
                <ul className="list-disc list-inside mb-2">
                  <li><strong>0 transactions fees</strong> are required to claim rewards, they are payed by the pool.
                  </li>
                  <li>
                    <strong>Guild rewards</strong> are calculated based on the amount of LP tokens you have staked.
                  </li>
                  <li>
                    Reducing or removing your staked LP tokens will proportionally <strong>decrease the amount of
                    rewards</strong> you
                    can
                    earn. Consider this carefully before unstaking.
                  </li>
                </ul>
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
              <Button
                size="lg"
                className="relative" onClick={handleUnstake}
                disabled={isUnstakeButtonDisabled() || isClaiming}>
                {isClaiming && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                  </div>
                )}
                <span className={isClaiming ? 'opacity-0' : ''}>
                    <strong>UNSTAKE</strong>
                  </span>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
