'use client'

import React, { useEffect, useState } from 'react'
import { Card } from '../../../components/ui/card'
import { getCurrentMinersCount, getPoolChallenges } from '../../../lib/poolUtils'
import { toast } from '../../../hooks/use-toast'
import { COAL_TOKEN_DECIMALS } from '../../../lib/constants'

export default function Page () {
  const [minersCount, setMinersCount] = useState('-')
  const [totalPoolHash, setTotalPoolHash] = useState<number>(0)
  const [avgPoolHash, setAvgPoolHash] = useState<number>(0)
  const [bestPoolDifficulty, setBestPoolDifficulty] = useState<number>(0)
  const [avgPoolDifficulty, setAvgPoolDifficulty] = useState<number>(0)
  const [coalEarnings, setCoalEarnings] = useState<number>(0)
  const [oreEarnings, setOreEarnings] = useState<number>(0)

  useEffect(() => {
    getMinersCount()
    getPoolData()
  }, [])

  const getMinersCount = async () => {
    try {
      const [miners] = await Promise.all([
        getCurrentMinersCount()
      ])

      setMinersCount(miners)
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
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <Card
          className="aspect-video flex flex-col justify-center items-center group">
          <h3 className="text-xl font-bold text-center text-gray-600 dark:text-gray-400">Active Miners</h3>
          <p className="text-center text-lg mt-2">
            <strong>{minersCount.toLocaleString()}</strong>
          </p>
        </Card>
        <Card
          className="aspect-video flex flex-col justify-center items-center group">
          <h3 className="text-xl font-bold text-center text-gray-600 dark:text-gray-400">TOTAL Hash/s 24h</h3>
          <p className="text-center text-lg mt-2">
            <strong>{totalPoolHash.toLocaleString()}</strong>
          </p>
          <h3 className="text-xl font-bold text-center text-gray-600 dark:text-gray-400">AVG Hash/s 24h</h3>
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
          <h3 className="text-xl font-bold text-center text-gray-600 dark:text-gray-400">AVG Difficulty 24h</h3>
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
          <h3 className="text-xl font-bold text-center text-gray-600 dark:text-gray-400">ORE Earned 24h</h3>
          <p className="text-center text-lg mt-2">
            <strong>{oreEarnings.toLocaleString()}</strong>
          </p>
        </Card>
      </div>
    </div>
  )
}
