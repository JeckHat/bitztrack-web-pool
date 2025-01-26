'use client'

import { Card, CardContent } from '../../../components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { getPoolStakeAndMultipliers } from '../../../lib/poolUtils'
import { StakeAndMultipliersString } from '../../../pages/api/apiDataTypes'
import { useRouter, useSearchParams } from 'next/navigation'

export default function Page () {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState('features')

  const [poolStakeAndMultipliers, setPoolStakeAndMultipliers] = useState<StakeAndMultipliersString | null>(null)

  useEffect(() => {
    if (!poolStakeAndMultipliers) {
      fetchPoolStakeAndMultipliers()
    }
  }, [poolStakeAndMultipliers])

  useEffect(() => {
    const tab = searchParams?.get('tab')
    if (tab && ['features', 'extra', 'structure', 'transparency'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [])

  const fetchPoolStakeAndMultipliers = async () => {
    try {
      const response = await getPoolStakeAndMultipliers()
      setPoolStakeAndMultipliers(response)
    } catch (error) {
      console.error('Failed to fetch pool stake and multipliers:', error)
    }
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    router.push(`?tab=${value}`, { scroll: false })
  }

  return (
    <div className="max-w-4xl w-[min(56rem,100vw)] mx-auto px-6 py-10">
      <h1 className="text-4xl font-bold text-center mb-8">The Pool</h1>
      <div className="text-center mb-6">
        <p className="text-lg leading-relaxed">
          Everything you need to know about how the pool is handling COAL and ORE and CHROMIUM mining.
        </p>
        <p>And what gives us a <strong>{poolStakeAndMultipliers?.total_coal_multiplier ?? '-'}x</strong> multiplier on
          each mining transaction.</p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-col-1 sm:grid-cols-4 h-fit">
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="extra">Extra tokens</TabsTrigger>
          <TabsTrigger value="structure">Structure</TabsTrigger>
          <TabsTrigger value="transparency">Transparency</TabsTrigger>
        </TabsList>

        <TabsContent value="features">
          <Card>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2">
                <li>Mine <strong>COAL, ORE, and other tokens</strong> at the same time</li>
                <li>Easy to setup <strong>hotwallet</strong> or mine with a <strong>public key</strong> only</li>
                <li>Mine with the same key from multiple devices</li>
                <li>Option to use a different wallet for withdrawals</li>
                <li>Pickaxe-boosted rewards for all miners
                  of <strong>{poolStakeAndMultipliers?.tool_multiplier ?? '-'}x</strong></li>
                <li>Guild membership benefits and boost
                  of <strong>{poolStakeAndMultipliers?.guild_multiplier ?? '-'}x</strong></li>
                <li>Stake multiplier of <strong>{poolStakeAndMultipliers?.coal_multiplier ?? '-'}x</strong></li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="extra">
          <Card>
            <CardContent>
              <h3 className="text-xl font-semibold mb-4">Diamond Hands System 💎</h3>
              <p className="mb-4">
                The Diamond Hands system is a reward mechanism designed to incentivize long-term commitment and
                consistent mining. The rewards comes directly from the pool treasury.
              </p>
              <ul className="list-disc pl-5 space-y-2 mb-4">
                <li>Diamond Hands is reprocessed and <strong>distributed every 7 days on sunday</strong></li>
                <li>Mine consistently to maintain strong weekly performance</li>
                <li>Resist the urge to claim your tokens for at least one week</li>
                <li>Continue mining and holding for up to 4 weeks to maximize your rewards</li>
                <li>Enjoy <strong>extra COAL and ORE</strong> rewards when you finally decide to claim</li>
              </ul>
              <p className="italic mb-10">
                Note: The Diamond Hands system is designed to reward patience and commitment. However, you&#39;re always
                free to claim your tokens at any time if needed.
              </p>

              <h3 className="text-xl font-semibold mb-4">CHROMIUM Reprocessing System</h3>
              <p className="mb-4">
                The CHROMIUM reprocessing system is designed to reward miners with additional tokens based on their
                contribution to the pool.
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>CHROMIUM is reprocessed and distributed every 3 days</li>
                <li>Distribution is based on each miner&#39;s active time and hashpower contribution</li>
                <li>Miners can claim CHROMIUM along with other resources</li>
                <li>CHROMIUM can be used for crafting and enhancing mining tools</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="structure">
          <Card>
            <CardContent>
              <h3 className="text-lg font-semibold mb-2">Fees</h3>
              <p>5% COAL and ORE fee from each mined transaction</p>
              <p>5% fee for each reprocessing</p>

              <h3 className="text-lg font-semibold mt-4 mb-2">Signup</h3>
              <p>Free to join (0 cost)</p>

              <h3 className="text-lg font-semibold mt-4 mb-2">Withdrawals</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Minimum COAL withdrawal: 5 COAL</li>
                <li>Minimum ORE withdrawal: 0.05 ORE</li>
                <li>4 COAL deduction if no COAL token account exists</li>
                <li>0.02 ORE deduction if no ORE token account exists</li>
              </ul>

              <h3 className="text-lg font-semibold mt-4 mb-2">Difficulty and Rewards</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>COAL difficulty reward capped at 24 for fair distribution</li>
                <li>ORE rewards not capped, linear distribution based on hashpower</li>
                <li>Minimum difficulty of 12 to accept an answer</li>
              </ul>

              <h3 className="text-lg font-semibold mt-4 mb-2">Chromium Distribution</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Reprocessed and distributed every 3 days</li>
                <li>Based on miner&#39;s active time and hashpower contribution</li>
                <li>Claimable like other resources</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transparency">
          <Card>
            <CardContent>
              <p className="mb-4">The pool is committed to full transparency about handling and fund usage.<br/>All
                pool-related addresses are publicly disclosed and can be verified on-chain.</p>

              <h3 className="text-lg font-semibold mb-2">Pool Addresses</h3>
              <ul className="space-y-2">
                <li><strong>Pool address:</strong> <Link
                  href="https://solscan.io/account/6zbGwDbfwVS3hF8r7Yei8HuwSWm2yb541jUtmAZKhFDM"
                  target="_blank"
                  className="underline text-blue-500 hover:text-blue-700 break-words">6zbGwDbfwVS3hF8r7Yei8HuwSWm2yb541jUtmAZKhFDM
                </Link></li>
                <li><strong>Fee address:</strong> <Link
                  href="https://solscan.io/account/G2JTCdxC3fDK61XVchtX2fo8zHvzYubYkqfmRf3gJ2uS"
                  target="_blank"
                  className="underline text-blue-500 hover:text-blue-700 break-words">G2JTCdxC3fDK61XVchtX2fo8zHvzYubYkqfmRf3gJ2uS
                </Link></li>
                <li><strong>Commission address:</strong> <Link
                  href="https://solscan.io/account/36fkW2RgF6jNqmYpurMfUyHj1mpJw9Cann9AJmdhBbwY"
                  target="_blank"
                  className="underline text-blue-500 hover:text-blue-700 break-words">36fkW2RgF6jNqmYpurMfUyHj1mpJw9Cann9AJmdhBbwY
                </Link></li>
                <li><strong>Guild address:</strong> <Link
                  href="https://solscan.io/account/3EjkgNBpCequ2Pq697kas4LHyzNwp1DhDWMKF1mGKfAk"
                  target="_blank"
                  className="underline text-blue-500 hover:text-blue-700 break-words">3EjkgNBpCequ2Pq697kas4LHyzNwp1DhDWMKF1mGKfAk
                </Link></li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )

}
