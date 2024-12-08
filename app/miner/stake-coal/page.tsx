'use client'

import { useEffect, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { getTokenBalance, stakeToPool } from '@/lib/stakeToPool'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { COAL_MINT_ADDRESS, COAL_TOKEN_DECIMALS } from '../../../lib/constants'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs'
import { useToast } from '../../../hooks/use-toast'

export default function StakingPage () {
  const [amount, setAmount] = useState('')
  const [balance, setBalance] = useState(0)
  const [error, setError] = useState('')
  const wallet = useWallet()
  const [isStaking, setIsStaking] = useState(false)
  const { toast } = useToast()



  useEffect(() => {
    const fetchBalance = async () => {
      if (wallet.publicKey) {
        const userBalance = await getTokenBalance(wallet.publicKey, COAL_MINT_ADDRESS)
        console.log('userBalance', userBalance)
        setBalance(parseFloat(userBalance.toFixed(COAL_TOKEN_DECIMALS)))
      } else {
        setBalance(0)
      }
    }

    fetchBalance()
  }, [wallet.publicKey])

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setAmount(value)

    if (parseFloat(value) > balance) {
      setError('Insufficient balance')
    } else {
      setError('')
    }
  }

  const handleStake = async () => {
    if (!wallet.connected) {
      toast({title: 'Wallet Error', description: 'Please connect your wallet first', variant: 'destructive'})
      return
    }

    if (parseFloat(amount) > balance) {
      toast({title: 'Balance Error', description: 'Insufficient balance, use a valid amount', variant: 'destructive'})
      return
    }

    setIsStaking(true) // Start the loading state

    try {
      await stakeToPool(parseFloat(amount), wallet)
      toast({title: 'Staking successful', description: 'Stake successfully added to the pool!', variant: 'default'})
      const newBalance = await getTokenBalance(wallet.publicKey!, COAL_MINT_ADDRESS)
      setBalance(newBalance)
      setAmount('')
    } catch (error) {
      console.error('Staking failed:', error)
      toast({title: 'Staking failed', description: (error as string).toString(), variant: 'destructive'})
    } finally {
      setIsStaking(false) // End the loading state
    }
  }

  return (
    <div className="max-w-4xl w-[56rem] mx-auto px-6 py-10">
      <h1 className="text-4xl font-bold text-center mb-8">COAL Staking</h1>
      <div className="text-center mb-6">
        <p className="text-lg leading-relaxed">
          Obtain the best rewards by staking your COAL tokens to the pool.
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
            <CardContent></CardContent>
            <CardFooter>
              <Button
                size="lg"
                className="relative"
                onClick={handleStake}
                disabled={!wallet.connected || parseFloat(amount) > balance || parseFloat(amount) <= 0 || isStaking}
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
              <CardContent>
                <p className="mb-4">Staking your COAL directly with the pool gives every miner the benefit of a higher
                  multiplier.</p>
                <div className="bg-muted p-4 rounded-md mb-6">
                  <h3 className="text-lg font-semibold mb-2">How Staking Affects the Pool</h3>
                  <p className="mb-2">When you stake COAL, you&#39;re contributing to the pool&#39;s overall stake. This has two
                    main benefits:</p>
                  <ul className="list-disc list-inside mb-2">
                    <li>It increases the multiplier for <strong>all miners</strong> in the pool, boosting everyone&#39;s
                      rewards.
                    </li>
                    <li>The multiplier can go up to <strong>2x</strong> if our pool becomes the top staker in the entire system.</li>
                  </ul>
                  <p>By staking, you&#39;re not just increasing your own rewards, but helping all miners in the pool!</p>
                </div>
                <div className="mt-4">
                  <Label htmlFor="balance">Available Balance:</Label>
                  <p id="balance" className="text-lg font-semibold">{balance} COAL</p>
                </div>
                <div>
                  <Label htmlFor="amount">Amount to Stake:</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder="Enter amount to stake"
                  />
                  {error && <p className="text-destructive text-sm mt-1">{error}</p>}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  size="lg"
                  className="relative"
                  onClick={handleStake}
                  disabled={!wallet.connected || isNaN(parseFloat(amount)) || parseFloat(amount) > balance || parseFloat(amount) <= 0 || isStaking}
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
