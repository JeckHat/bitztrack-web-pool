'use client'

import React, { useEffect, useState } from 'react'
import { Button } from './ui/button'

interface TokenPriceProps {
  tokenId: string
  iconUrl: string
  jupiterLink: string
}

interface TokenData {
  current_price: number
  price_change_percentage_24h: number
}

const TokenPrice: React.FC<TokenPriceProps> = ({ tokenId, iconUrl, jupiterLink }) => {
  const [tokenData, setTokenData] = useState<TokenData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTokenData = async () => {
      try {
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${tokenId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch token data')
        }
        const data = await response.json()
        setTokenData(data[0])
        setLoading(false)
      } catch {
        setError('Error fetching token data')
        setLoading(false)
      }
    }

    fetchTokenData()
  }, [tokenId])

  if (loading) return <p>Loading...</p>
  if (error) return <p>{error}</p>
  if (!tokenData) return <p>No data available</p>

  return (
    <div className="flex flex-col items-center">
      <div className="p-1 bg-black rounded-full w-16 h-16 transition-transform group-hover:scale-110">
        <img src={iconUrl} alt={`${tokenId} icon`} className="object-contain"/>
      </div>
      <p className="text-2xl font-bold">${tokenData.current_price.toFixed(4)}</p>
      <p className={`text-sm ${tokenData.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
        {tokenData.price_change_percentage_24h.toFixed(2)}% (24h)
      </p>
      <Button className="mt-4" color="green" onClick={() => window.open(jupiterLink, '_blank')}>
        Trade on Jupiter
      </Button>
    </div>
  )
}

export default TokenPrice
