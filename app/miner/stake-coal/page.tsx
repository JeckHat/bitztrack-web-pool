'use client'

import React, { useEffect, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { stakeToPool } from '@/lib/stakeToPool'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { COAL_MINT_ADDRESS, COAL_SOL_LP_MINT_ADDRESS, COAL_TOKEN_DECIMALS } from '../../../lib/constants'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs'
import { useToast } from '../../../hooks/use-toast'
import { getPoolStakeAndMultipliers, getTokenBalance } from '../../../lib/poolUtils'
import { stakeToGuild } from '../../../lib/stakeToGuild'
import { RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { StakeAndMultipliersString } from '../../../pages/api/apiDataTypes'

const COOLDOWN_DURATION = 60000 // 1 minute in milliseconds

export default function StakingPage () {
  const [amountCoal, setAmountCoal] = useState('')
  const [balanceCoal, setBalanceCoal] = useState(0)
  const [errorCoal, setErrorCoal] = useState('')
  const [amountLP, setAmountLP] = useState('')
  const [balanceLP, setBalanceLP] = useState(0)
  const [errorLP, setErrorLP] = useState('')
  const wallet = useWallet()
  const [isStaking, setIsStaking] = useState(false)
  const { toast } = useToast()
  const [lastRefreshTime, setLastRefreshTime] = useState<number | null>(null)
  const [cooldownRemaining, setCooldownRemaining] = useState(0)
  const [poolStakeAndMultipliers, setPoolStakeAndMultipliers] = useState<StakeAndMultipliersString | null>(null)

  useEffect(() => {
    const storedLastRefreshTime = localStorage.getItem('lastRefreshTime')
    if (storedLastRefreshTime) {
      const lastRefreshTime = parseInt(storedLastRefreshTime, 10)
      setLastRefreshTime(lastRefreshTime)
      const elapsed = Date.now() - lastRefreshTime
      if (elapsed < COOLDOWN_DURATION) {
        setCooldownRemaining(Math.ceil((COOLDOWN_DURATION - elapsed) / 1000))
      } else {
        // Only fetch if the cooldown has expired
        fetchData()
      }
    } else {
      // If there's no stored refresh time, it's the first fetch
      fetchData()
    }
  }, [wallet.publicKey])

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
    const [userBalanceCoal, userBalanceLP, poolStakeData] = await Promise.all([
      (wallet.publicKey ? getTokenBalance(wallet.publicKey, COAL_MINT_ADDRESS) : 0),
      (wallet.publicKey ? getTokenBalance(wallet.publicKey, COAL_SOL_LP_MINT_ADDRESS) : 0),
      getPoolStakeAndMultipliers()
    ])

    setBalanceCoal(parseFloat(userBalanceCoal.toFixed(COAL_TOKEN_DECIMALS)))
    setBalanceLP(parseFloat(userBalanceLP.toFixed(COAL_TOKEN_DECIMALS)))
    setPoolStakeAndMultipliers(poolStakeData)
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
      localStorage.setItem('lastRefreshTime', now.toString())
      setCooldownRemaining(COOLDOWN_DURATION / 1000) // Set cooldown to full duration

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

  const handleAmountChangeLP = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setAmountLP(value)

    if (parseFloat(value) > balanceLP) {
      setErrorLP('Insufficient balance')
    } else {
      setErrorLP('')
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

  const handleStakeLP = async () => {
    if (!wallet.connected || !wallet.publicKey) {
      toast({ title: 'Wallet Error', description: 'Please connect your wallet first', variant: 'destructive' })
      return
    }

    if (parseFloat(amountLP) > balanceLP) {
      toast({ title: 'Balance Error', description: 'Insufficient balance, use a valid amount', variant: 'destructive' })
      return
    }

    setIsStaking(true) // Start the loading state

    try {
      await stakeToGuild(parseFloat(amountLP), wallet)
      //wait for 2 seconds
      await new Promise((resolve) => setTimeout(resolve, 2000))
      toast({ title: 'Staking successful', description: 'Stake successfully added to the guild!', variant: 'default' })
      const newBalance = await getTokenBalance(wallet.publicKey, COAL_SOL_LP_MINT_ADDRESS)
      setBalanceLP(newBalance)
      setAmountLP('')
    } catch (error) {
      console.error('Staking failed:', error)
      toast({ title: 'Staking failed', description: (error as string).toString(), variant: 'destructive' })
    } finally {
      setIsStaking(false) // End the loading state
    }
  }

  return (
    <div className="max-w-4xl w-[min(56rem,100vw)]  mx-auto px-6 py-10">
      <h1 className="text-4xl font-bold text-center mb-8">COAL Staking</h1>
      <div className="text-center mb-6">
        <p className="text-lg leading-relaxed">
          Obtain the best rewards with the Pool staking system.
        </p>
      </div>

      <Tabs defaultValue="guild" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="guild">Guild</TabsTrigger>
          <TabsTrigger value="pool">Pool</TabsTrigger>
        </TabsList>

        <TabsContent value="guild">
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
                <p id="balanceLP" className="text-lg font-semibold">{balanceLP} COAL-SOL LP</p>
              </div>
              <div>
                <Label htmlFor="amount">Amount to Stake:</Label>
                <Input
                  id="amount"
                  type="number"
                  value={amountLP}
                  onChange={handleAmountChangeLP}
                  placeholder="Enter amount to stake"
                />
                {errorLP && <p className="text-destructive text-sm mt-1">{errorLP}</p>}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                size="lg"
                className="relative"
                onClick={handleStakeLP}
                disabled={!wallet.connected || isNaN(parseFloat(amountLP)) || parseFloat(amountLP) > balanceLP || parseFloat(amountLP) <= 0 || isStaking}
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
