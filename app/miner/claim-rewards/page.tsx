'use client'

import React, { useEffect, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card'
import { Input } from '../../../components/ui/input'
import { Button } from '../../../components/ui/button'
import { getTokenBalance } from '../../../lib/poolUtils'
import {
  CHROMIUM_MINT_ADDRESS,
  COAL_MINT_ADDRESS,
  COAL_SOL_LP_MINT_ADDRESS,
  ORE_MINT_ADDRESS
} from '../../../lib/constants'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs'

export default function Page () {
  const wallet = useWallet()
  const [miningRewards, setMiningRewards] = useState({ coal: 0, ore: 0, chromium: 0 })
  const [guildStake, setGuildStake] = useState({ staked: 0, estimatedReturn: 0, claimable: 0 })
  const [lpBalance, setLpBalance] = useState({ staked: 0, wallet: 0 })
  const [unstakeAmount, setUnstakeAmount] = useState('')

  useEffect(() => {
    if (wallet.publicKey) {
      fetchBalances()
      fetchGuildStake()
    }
  }, [wallet.publicKey])

  const fetchBalances = async () => {
    const coal = await getTokenBalance(wallet.publicKey!, COAL_MINT_ADDRESS)
    const ore = await getTokenBalance(wallet.publicKey!, ORE_MINT_ADDRESS)
    const chromium = await getTokenBalance(wallet.publicKey!, CHROMIUM_MINT_ADDRESS)
    setMiningRewards({ coal, ore, chromium })

    const lpWallet = await getTokenBalance(wallet.publicKey!, COAL_SOL_LP_MINT_ADDRESS)
    setLpBalance(prev => ({ ...prev, wallet: lpWallet }))
  }

  const fetchGuildStake = async () => {
    // const { staked, estimatedReturn, claimable } = await getPoolStakeAndMultipliers()
    // setGuildStake({ staked, estimatedReturn, claimable })
    // setLpBalance(prev => ({ ...prev, staked }))
  }

  const handleClaimMiningRewards = () => {
    // Implement claim mining rewards logic
    console.log('Claiming mining rewards')
  }

  const handleClaimGuildRewards = () => {
    // Implement claim guild rewards logic
    console.log('Claiming guild rewards')
  }

  const handleUnstake = () => {
    // Implement unstake logic
    console.log('Unstaking', unstakeAmount)
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="mining">Mining Rewards</TabsTrigger>
          <TabsTrigger value="guild">Guild Rewards</TabsTrigger>
          <TabsTrigger value="unstake">Unstake Guild LP</TabsTrigger>
        </TabsList>

        <TabsContent value="mining">
          <Card>
            <CardHeader>
              <CardTitle>Mining Rewards</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-md mb-6">
                <p className="mb-2">
                  <strong>COAL</strong> and <strong>ORE</strong> rewards are earned every minute while you&#39;re
                  actively
                  mining in the pool. These rewards are distributed when a mining transaction is submitted.
                </p>
                <p>
                  <strong>CHROMIUM</strong> is earned each time the pool reprocesses COAL, provided you&#39;ve been
                  active
                  in the pool during the previous days.
                </p>
              </div>
              <p>COAL: {miningRewards.coal}</p>
              <p>ORE: {miningRewards.ore}</p>
              <p>CHROMIUM: {miningRewards.chromium}</p>
            </CardContent>
            <CardFooter>
              <Button onClick={handleClaimMiningRewards}><strong>CLAIM ALL MINING REWARDS</strong></Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="guild">
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
              <p>LP Staked: {guildStake.staked}</p>
              <p>Estimated Return per Day: {guildStake.estimatedReturn}</p>
              <p>Claimable COAL: {guildStake.claimable}</p>
            </CardContent>
            <CardFooter>
              <Button onClick={handleClaimGuildRewards}><strong>CLAIM GUILD REWARDS</strong></Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="unstake">
          <Card>
            <CardHeader>
              <CardTitle>Unstake Guild LP</CardTitle>
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
              <Button onClick={handleUnstake}><strong>UNSTAKE</strong></Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
