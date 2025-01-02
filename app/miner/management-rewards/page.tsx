'use client'

import React, { useEffect, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { stakeToPool } from '@/lib/stakeToPool'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { COAL_MINT_ADDRESS, COAL_TOKEN_DECIMALS } from '../../../lib/constants'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs'
import { useToast } from '../../../hooks/use-toast'
import { getMinerRewards, getPoolStakeAndMultipliers, getTokenBalance } from '../../../lib/poolUtils'
import { RefreshCw } from 'lucide-react'
import { MinerBalanceString, StakeAndMultipliersString } from '../../../pages/api/apiDataTypes'
import { claimRewards, MINIMUM_CLAIM_AMOUNT_COAL, MINIMUM_CLAIM_AMOUNT_ORE } from '../../../lib/claimRewards'

const COOLDOWN_DURATION = 60000 // 1 minute in milliseconds

export default function StakingPage () {
  const { toast } = useToast()

  const [amountCoal, setAmountCoal] = useState('')
  const [balanceCoal, setBalanceCoal] = useState(0)
  const [errorCoal, setErrorCoal] = useState('')
  const wallet = useWallet()
  const [isStaking, setIsStaking] = useState(false)
  const [poolStakeAndMultipliers, setPoolStakeAndMultipliers] = useState<StakeAndMultipliersString | null>(null)
  const [selectedTab, setSelectedTab] = useState('miner')
  const [isClaiming, setIsClaiming] = useState(false)
  const [minerRewards, setMinerRewards] = useState<MinerBalanceString | null>(null)
  const [lastRefreshTime, setLastRefreshTime] = useState<number | null>(null)
  const [cooldownRemaining, setCooldownRemaining] = useState(0)

  useEffect(() => {
    const storedLastFetchTime = localStorage.getItem('lastRefreshTimeManagementRewards')
    if (storedLastFetchTime) {
      setLastRefreshTime(parseInt(storedLastFetchTime, 10))
    }
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      if (lastRefreshTime) {
        const elapsed = Date.now() - lastRefreshTime
        if (elapsed < COOLDOWN_DURATION) {
          setCooldownRemaining(Math.ceil((COOLDOWN_DURATION - elapsed) / 1000))
        } else {
          setCooldownRemaining(0)
        }
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [lastRefreshTime])

  useEffect(() => {
    if (!wallet.publicKey) {
      return
    }
    getData()
  }, [wallet.publicKey])

  const getData = async () => {
    const [userBalanceCoal, poolStakeData, minerRewards] = await Promise.all([
      (wallet.publicKey ? getTokenBalance(wallet.publicKey, COAL_MINT_ADDRESS) : 0),
      getPoolStakeAndMultipliers(),
      (wallet.publicKey ? getMinerRewards(wallet.publicKey.toString()) : { coal: '0', ore: '0', chromium: '0' }),
    ])

    setBalanceCoal(parseFloat(userBalanceCoal.toFixed(COAL_TOKEN_DECIMALS)))
    setPoolStakeAndMultipliers(poolStakeData)
    setMinerRewards(minerRewards)
  }

  const fetchData = async () => {
    if (cooldownRemaining > 0) {
      toast({
        title: 'Cooldown Active',
        description: `Please wait ${cooldownRemaining} seconds before fetching again.`,
        variant: 'destructive',
      })
      return
    }

    try {

      await getData()

      const now = Date.now()
      setLastRefreshTime(now)
      localStorage.setItem('lastRefreshTimeManagementRewards', now.toString())

      toast({
        title: 'Data Fetched',
        description: 'Your balance has been updated.',
      })
    } catch (error) {
      console.error('Failed to fetch data:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch data. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleAmountChangeCoal = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setAmountCoal(value)

    if (parseFloat(value) > balanceCoal) {
      setErrorCoal('Insufficient balance')
    } else {
      setErrorCoal('')
    }
  }

  const handleStakeCoal = async () => {
    if (!wallet.connected || !wallet.publicKey) {
      toast({ title: 'Wallet Error', description: 'Please connect your wallet first', variant: 'destructive' })
      return
    }

    if (parseFloat(amountCoal) > balanceCoal) {
      toast({ title: 'Balance Error', description: 'Insufficient balance, use a valid amount', variant: 'destructive' })
      return
    }

    setIsStaking(true) // Start the loading state

    try {
      await stakeToPool(parseFloat(amountCoal), wallet)
      toast({ title: 'Staking successful', description: 'Stake successfully added to the pool!', variant: 'default' })
      const newBalance = await getTokenBalance(wallet.publicKey, COAL_MINT_ADDRESS)
      setBalanceCoal(newBalance)
      setAmountCoal('')
    } catch (error) {
      console.error('Staking failed:', error)
      toast({ title: 'Staking failed', description: (error as string).toString(), variant: 'destructive' })
    } finally {
      setIsStaking(false) // End the loading state
    }
  }

// Add this function to check if rewards meet the minimum requirements
  const meetsMinimumRequirements = () => {
    if (!minerRewards) return false
    const coalRewards = parseFloat(minerRewards.coal)
    const oreRewards = parseFloat(minerRewards.ore)
    return coalRewards >= MINIMUM_CLAIM_AMOUNT_COAL || oreRewards >= MINIMUM_CLAIM_AMOUNT_ORE
  }

  const handleClaimMiningRewards = async () => {
    if (!wallet.connected || !wallet.publicKey) {
      toast({ title: 'Wallet Error', description: 'Please connect your wallet first', variant: 'destructive' })
      return
    }

    if (!meetsMinimumRequirements()) {
      toast({
        title: 'Insufficient Rewards',
        description: `You need at least ${MINIMUM_CLAIM_AMOUNT_COAL} COAL or ${MINIMUM_CLAIM_AMOUNT_ORE} ORE to claim rewards.`,
        variant: 'destructive',
      })
      return
    }

    setIsClaiming(true) // Start the loading state

    try {
      await claimRewards(wallet)
      toast({ title: 'Claim successful', description: 'Successfully queued claim rewards!', variant: 'default' })
    } catch (error) {
      console.error('Claim failed:', error)
      toast({ title: 'Claim failed', description: (error as string).toString(), variant: 'destructive' })
    } finally {
      setIsClaiming(false) // End the loading state
    }
  }

  const renderTitleAndSubtitle = () => {
    switch (selectedTab) {
      case 'miner':
        return (
          <>
            <h1 className="text-4xl font-bold text-center mb-8">Miner Rewards</h1>
            <div className="text-center mb-6">
              <p className="text-lg leading-relaxed">
                Manage your miner rewards and boost your earnings.
              </p>
            </div>
          </>
        )
      case 'pool':
      default:
        return (
          <>
            <h1 className="text-4xl font-bold text-center mb-8">COAL Staking</h1>
            <div className="text-center mb-6">
              <p className="text-lg leading-relaxed">
                Obtain the best rewards with the Pool staking system.
              </p>
            </div>
          </>
        )
    }
  }

  return (
    <div className="max-w-4xl w-[min(56rem,100vw)]  mx-auto px-6 py-10">
      {renderTitleAndSubtitle()}

      <Tabs defaultValue="miner" className="w-full" onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="miner">Miner Rewards</TabsTrigger>
          <TabsTrigger value="pool">Pool Stake</TabsTrigger>
        </TabsList>

        <TabsContent value="miner">
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center justify-between">
                  Mining Rewards
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
                  <li>Unclaimed <strong>COAL</strong> and <strong>ORE</strong> rewards are automatically added to the
                    pool stake
                  </li>
                  <li><strong>COAL</strong> and <strong>ORE</strong> rewards are earned every minute while you&#39;re
                    actively mining in the pool. These rewards are distributed when a mining transaction is submitted.
                  </li>
                  <li><strong>CHROMIUM</strong> is earned each time the pool reprocesses COAL, provided you&#39;ve been
                    active in the pool during the previous days.
                  </li>
                </ul>
              </div>
              <p>COAL: {minerRewards?.coal ?? '0'}</p>
              <p>ORE: {minerRewards?.ore ?? '0'}</p>
              <p>CHROMIUM: {minerRewards?.chromium ?? '0'}</p>
              {!meetsMinimumRequirements() && (
                <p className="text-red-500 mt-2">
                  Minimum withdrawal: {MINIMUM_CLAIM_AMOUNT_COAL} COAL or {MINIMUM_CLAIM_AMOUNT_ORE} ORE. Your current
                  rewards do not meet this minimum.
                </p>
              )}
              {meetsMinimumRequirements() && (
                <div>
                  <p className="text-red-500 mt-2">
                    Please note: It may take up to 10 minutes for your claimed rewards to appear in your wallet as claim
                    are done in batches.
                  </p>
                  <p className="text-red-500 mt-2">
                    For each token account not present in your wallet a deduction from rewards of 4 COAL or 0.02 ORE
                    (depending on
                    what you have available) will be applied.
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                size="lg"
                className="relative" onClick={handleClaimMiningRewards}
                disabled={!meetsMinimumRequirements() || isClaiming}>
                {isClaiming && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                  </div>
                )}
                <span className={isClaiming ? 'opacity-0' : ''}>
                    <strong>CLAIM ALL MINING REWARDS</strong>
                  </span>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="pool">
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span>
                    Stake to the Pool
                    </span>
                    <span>
                    Multiplier: {poolStakeAndMultipliers?.coal_multiplier ?? '-'}x - Total
                    Stake: {poolStakeAndMultipliers?.coal_stake ?? '-'} COAL
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
                <h3 className="text-lg font-semibold mb-2">Benefits of Staking COAL to the Pool</h3>
                <ul className="list-disc list-inside mb-2">
                  <li><strong>0 transactions fees</strong> are required to stake, they are payed by the pool.</li>
                  <li>Adds a multiplier for <strong>every COAL we mine</strong>, benefiting all miners.</li>
                  <li>Helps the Pool to reach and maintain the maximum 2x multiplier to distributes more rewards.</li>
                  <li>Staking is <strong>not required</strong> to get the bonus but helps you and other miners to get
                    more COAL.
                  </li>
                  <li>Staking gets compounded <strong>automatically</strong> inside your miner rewards.
                  </li>
                </ul>
              </div>
              <div className="mt-4">
                <Label htmlFor="balanceCOAL">Available Balance:</Label>
                <p id="balanceCOAL" className="text-lg font-semibold">{balanceCoal} COAL</p>
              </div>
              <div>
                <Label htmlFor="amount">Amount to Stake:</Label>
                <Input
                  id="amount"
                  type="number"
                  value={amountCoal}
                  onChange={handleAmountChangeCoal}
                  placeholder="Enter amount to stake"
                />
                {errorCoal && <p className="text-destructive text-sm mt-1">{errorCoal}</p>}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                size="lg"
                className="relative"
                onClick={handleStakeCoal}
                disabled={!wallet.connected || isNaN(parseFloat(amountCoal)) || parseFloat(amountCoal) > balanceCoal || parseFloat(amountCoal) <= 0 || isStaking}
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
      </Tabs>
    </div>
  )
}
