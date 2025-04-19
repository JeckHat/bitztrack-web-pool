'use client'

import React, { useEffect, useState } from 'react'
import { Card } from '../../../components/ui/card'
import {
  getAvgMinersCount24,
  getCurrentMinersCount,
  getDifficultyDistribution24,
  getPoolChallenges
} from '../../../lib/poolUtils'
import { toast } from '../../../hooks/use-toast'
import { COAL_TOKEN_DECIMALS } from '../../../lib/constants'
import { DifficultyDistribution } from '../../../pages/api/apiDataTypes'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../../../components/ui/chart'
import { Bar, BarChart, CartesianGrid, Legend, XAxis, YAxis } from 'recharts'

export default function Page () {
  const [minersCount, setMinersCount] = useState('-')
  const [minersCountAvg24h, setMinersCountAvg24h] = useState('-')
  const [difficultiesDistribution, setDifficultiesDistribution] = useState<DifficultyDistribution[]>([])
  const [totalPoolHash, setTotalPoolHash] = useState<number>(0)
  const [avgPoolHash, setAvgPoolHash] = useState<number>(0)
  const [bestPoolDifficulty, setBestPoolDifficulty] = useState<number>(0)
  const [avgPoolDifficulty, setAvgPoolDifficulty] = useState<number>(0)
  const [coalEarnings, setCoalEarnings] = useState<number>(0)
  const [oreEarnings, setOreEarnings] = useState<number>(0)

  useEffect(() => {
    getMinersCount()
    getDifficultyDistribution()
    getPoolData()
  }, [])

  const getMinersCount = async () => {
    try {
      const [miners, miners4h] = await Promise.all([
        getCurrentMinersCount(),
        getAvgMinersCount24()
      ])

      setMinersCount(miners)
      setMinersCountAvg24h(miners4h)
    } catch (error) {
      console.error('Error fetching data:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch miner stats. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const getDifficultyDistribution = async () => {
    try {
      const [difficulties] = await Promise.all([
        getDifficultyDistribution24()
      ])

      setDifficultiesDistribution(difficulties)
    } catch (error) {
      console.error('Error fetching data:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch miner stats. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const getPoolData = async () => {
    try {
      const challenges = await getPoolChallenges()
      console.log('challenges -->', challenges)
      // setPoolChallenges(challenges)

      let totalHash = 0
      let totalDifficulty = 0
      let bestDifficulty = 0
      let coalEarnings = 0
      let oreEarnings = 0

      for (const challenge of challenges) {
        totalHash += challenge.challenge_hashpower
        totalDifficulty += challenge.difficulty
        if (challenge.difficulty > bestDifficulty) {
          bestDifficulty = challenge.difficulty
        }
        coalEarnings += challenge.rewards_earned_coal
        oreEarnings += challenge.rewards_earned_ore
      }
      setTotalPoolHash(totalHash)
      setAvgPoolHash(Math.floor(totalHash / challenges.length))
      setBestPoolDifficulty(bestDifficulty)
      setAvgPoolDifficulty(parseFloat((totalDifficulty / challenges.length).toFixed(2)))
      setCoalEarnings(coalEarnings / Math.pow(10, COAL_TOKEN_DECIMALS))
      setOreEarnings(oreEarnings / Math.pow(10, COAL_TOKEN_DECIMALS))

    } catch (error) {
      console.error('Error fetching data:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch pool stats. Please try again.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="grid auto-rows-min gap-4 md:grid-cols-4">
        <Card
          className="aspect-video flex flex-col justify-center items-center group">
          <h3 className="text-xl font-bold text-center text-gray-600 dark:text-gray-400">Active Miners</h3>
          <p className="text-center text-lg mt-2">
            <strong>{minersCount.toLocaleString()}</strong>
          </p>
          <h3 className="text-xl font-bold text-center text-gray-600 dark:text-gray-400 mt-2">AVG Miners 24h</h3>
          <p className="text-center text-lg mt-2">
            <strong>{minersCountAvg24h.toLocaleString()}</strong>
          </p>
        </Card>
        <Card
          className="aspect-video flex flex-col justify-center items-center group">
          <h3 className="text-xl font-bold text-center text-gray-600 dark:text-gray-400">TOTAL Hash/s 24h</h3>
          <p className="text-center text-lg mt-2">
            <strong>{totalPoolHash.toLocaleString()}</strong>
          </p>
          <h3 className="text-xl font-bold text-center text-gray-600 dark:text-gray-400 mt-2">AVG Hash/s 24h</h3>
          <p className="text-center text-lg mt-2">
            <strong>{avgPoolHash.toLocaleString()}</strong>
          </p>
        </Card>
        <Card
          className="aspect-video flex flex-col justify-center items-center group">
          <h3 className="text-xl font-bold text-center text-gray-600 dark:text-gray-400">BEST Difficulty 24h</h3>
          <p className="text-center text-lg mt-2">
            <strong>{bestPoolDifficulty.toLocaleString()}</strong>
          </p>
          <h3 className="text-xl font-bold text-center text-gray-600 dark:text-gray-400 mt-2">AVG Difficulty 24h</h3>
          <p className="text-center text-lg mt-2">
            <strong>{avgPoolDifficulty.toLocaleString()}</strong>
          </p>
        </Card>
        <Card
          className="aspect-video flex flex-col justify-center items-center group">
          <h3 className="text-xl font-bold text-center text-gray-600 dark:text-gray-400">COAL Earned 24h</h3>
          <p className="text-center text-lg mt-2">
            <strong>{coalEarnings.toLocaleString()}</strong>
          </p>
          <h3 className="text-xl font-bold text-center text-gray-600 dark:text-gray-400 mt-2">ORE Earned 24h</h3>
          <p className="text-center text-lg mt-2">
            <strong>{oreEarnings.toLocaleString()}</strong>
          </p>
        </Card>
      </div>
      <Card className="col-span-3 p-6">
        <h3 className="text-xl font-bold text-center text-gray-600 dark:text-gray-400 mb-4">
          Difficulty Distribution (24h)
        </h3>
        <div className="w-full h-[500px]">
          <ChartContainer
            className="w-full h-full"
            config={{
              difficulty: {
                label: 'Difficulty Level',
                color: 'hsl(var(--primary))'
              }
            }}
          >
            <BarChart
              data={difficultiesDistribution}
              margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
            >
              <CartesianGrid strokeDasharray="3 3"/>
              <XAxis
                dataKey="difficulty"
                label={{ value: 'Difficulty', position: 'insideBottomRight', offset: -10 }}
              />
              <YAxis
                label={{ value: 'Percentage of Miners (%)', angle: -90, position: 'insideLeft' }}
              />
              <ChartTooltip
                content={<ChartTooltipContent/>}
                formatter={(value, name, entry) => {
                  const count = entry.payload.count
                  return [`${value.toFixed(2)}% (${count} miners)`]
                }}
              />
              <Legend/>
              <Bar
                dataKey="percentage"
                name="Miners (%)"
                fill="var(--color-difficulty)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </div>
      </Card>
    </div>
  )
}
