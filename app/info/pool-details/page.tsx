import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs'
import Link from 'next/link'
import React from 'react'

export default function Page () {
  return (
    <div className="max-w-4xl w-[min(56rem,100vw)] mx-auto px-6 py-10">
      <h1 className="text-4xl font-bold text-center mb-8">The Pool</h1>
      <div className="text-center mb-6">
        <p className="text-lg leading-relaxed">
          Everything you need to know about how the pool is handling COAL and ORE and CHROMIUM mining.
        </p>
      </div>

      <Tabs defaultValue="features" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="structure">Structure</TabsTrigger>
          <TabsTrigger value="transparency">Transparency</TabsTrigger>
        </TabsList>

        <TabsContent value="features">
          <Card>
            <CardHeader>
              <CardTitle>Pool Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2">
                <li>Mine <strong>COAL, ORE, CHROMIUM</strong> tokens at the same time</li>
                <li>Easy to setup hotwallet</li>
                <li>Mine with the same key from multiple devices</li>
                <li>Option to use a different wallet for withdrawals</li>
                <li>Pickaxe-boosted rewards for all miners</li>
                <li>Guild membership boost benefits</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="structure">
          <Card>
            <CardHeader>
              <CardTitle>Pool Structure</CardTitle>
            </CardHeader>
            <CardContent>
              <h3 className="text-lg font-semibold mb-2">Fees</h3>
              <p>5% COAL and ORE fee from each mined transaction</p>
              <p>5% CHROMIUM fee for each reprocessing</p>

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
            <CardHeader>
              <CardTitle>Transparency Policy</CardTitle>
            </CardHeader>
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
