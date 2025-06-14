'use client'

import { Button } from '../components/ui/button'
import Link from 'next/link'
import { Card } from '../components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { getCurrentMinersCount } from '../lib/poolUtils'
import { toast } from '../hooks/use-toast'

export default function Page () {

  const [minersCount, setMinersCount] = useState('-')

  useEffect(() => {
    getMinersCount()
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

  return (
    <div className="flex flex-1 flex-col gap-6 p-4">
      {/* Hero Section */}
      <Card
        className="py-10 flex-1 bg-cover bg-center relative text-white overflow-hidden"
        // style={{ backgroundImage: 'url(\'/images/background/excalivator_bg_5.png\')' }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-75"></div>
        <div className="container mx-auto px-4 h-full relative">
          <header className="text-center">
            <div className="flex items-center justify-center mb-4">
              <h1 className="text-5xl font-extrabold ">Welcome to the BitzTrack</h1>
            </div>
            <p className="text-xl font-light">Your Gateway to Efficient, Crypto Mining on Eclipse</p>
            <p className="text-xl"><b>{minersCount}</b> miners are connected to the pool. Join the mining revolution!
            </p>
          </header>
        </div>
      </Card>
    </div>
  )
}
