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
import { getTokenBalance } from '../../../lib/poolUtils'
import { stakeToGuild } from '../../../lib/stakeToGuild'
import { RefreshCw } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover'
import Link from 'next/link'

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
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  useEffect(() => {
    const storedLastRefreshTime = localStorage.getItem('lastRefreshTime')
    if (storedLastRefreshTime) {
      setLastRefreshTime(parseInt(storedLastRefreshTime, 10))
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

  const fetchBalance = async () => {
    if (wallet.publicKey) {
      const userBalanceCoal = await getTokenBalance(wallet.publicKey, COAL_MINT_ADDRESS)
      const userBalanceLP = await getTokenBalance(wallet.publicKey, COAL_SOL_LP_MINT_ADDRESS)
      setBalanceCoal(parseFloat(userBalanceCoal.toFixed(COAL_TOKEN_DECIMALS)))
      setBalanceLP(parseFloat(userBalanceLP.toFixed(COAL_TOKEN_DECIMALS)))

      const now = Date.now()
      setLastRefreshTime(now)
      localStorage.setItem('lastRefreshTime', now.toString())
    } else {
      setBalanceCoal(0)
      setBalanceLP(0)
    }
  }

  useEffect(() => {
    fetchBalance()
  }, [wallet.publicKey])

  const handleRefresh = () => {
    if (cooldownRemaining === 0) {
      fetchBalance()
      toast({
        title: 'Balance Refreshed',
        description: 'Your balance has been updated.',
      })
    } else {
      toast({
        title: 'Cooldown Active',
        description: `Please wait ${cooldownRemaining} seconds before refreshing again.`,
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
    <div className="max-w-4xl w-[56rem] mx-auto px-6 py-10">
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
              <CardTitle>Stake to the Guild</CardTitle>
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
              <div className="flex items-end">
                <div className="mt-4">
                  <Label htmlFor="balanceLP">Available Balance:</Label>
                  <p id="balanceLP" className="text-lg font-semibold">{balanceLP} COAL-SOL LP</p>
                </div>
                <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                  <PopoverTrigger asChild>
                    <div
                      onMouseEnter={() => setIsPopoverOpen(true)}
                      onMouseLeave={() => setIsPopoverOpen(false)}>
                      <Button
                        className="-mb-1"
                        size="icon"
                        variant="ghost"
                        onClick={handleRefresh}
                        disabled={cooldownRemaining > 0}
                      >
                        <RefreshCw className={`h-4 w-4 ${cooldownRemaining > 0 ? 'text-muted-foreground' : ''}`}/>
                      </Button>
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-2">
                    {cooldownRemaining > 0 ? (
                      <p>Cooldown: {cooldownRemaining} seconds</p>
                    ) : (
                      <p>Click to refresh balance</p>
                    )}
                  </PopoverContent>
                </Popover>
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
              <CardTitle>Stake to the Pool</CardTitle>
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
              <div className="flex items-end">
                <div className="mt-4">
                  <Label htmlFor="balanceCOAL">Available Balance:</Label>
                  <p id="balanceCOAL" className="text-lg font-semibold">{balanceCoal} COAL</p>
                </div>
                <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                  <PopoverTrigger asChild>
                    <div
                      onMouseEnter={() => setIsPopoverOpen(true)}
                      onMouseLeave={() => setIsPopoverOpen(false)}>
                      <Button
                        className="-mb-1"
                        size="icon"
                        variant="ghost"
                        onClick={handleRefresh}
                        disabled={cooldownRemaining > 0}
                      >
                        <RefreshCw className={`h-4 w-4 ${cooldownRemaining > 0 ? 'text-muted-foreground' : ''}`}/>
                      </Button>
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-2">
                    {cooldownRemaining > 0 ? (
                      <p>Cooldown: {cooldownRemaining} seconds</p>
                    ) : (
                      <p>Click to refresh balance</p>
                    )}
                  </PopoverContent>
                </Popover>
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
