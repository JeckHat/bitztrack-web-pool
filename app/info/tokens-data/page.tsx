import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import TokenPrice from '../../../components/token-price'

export default function Page () {
  return (
    <div className="max-w-4xl w-[min(56rem,100vw)]  mx-auto px-6 py-10">
      <h1 className="text-4xl font-bold text-center mb-8">Token Information</h1>
      <div className="text-center mb-6">
        <p className="text-lg leading-relaxed">
          Current prices and information about COAL and ORE tokens.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>COAL</CardTitle>
          </CardHeader>
          <CardContent>
            <TokenPrice
              tokenId="coal-2"
              iconUrl="/images/coal-logo.png"
              jupiterLink="https://jup.ag/swap/SOL-coal"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ORE</CardTitle>
          </CardHeader>
          <CardContent>
            <TokenPrice
              tokenId="ore"
              iconUrl="/images/ore-logo.png"
              jupiterLink="https://jup.ag/swap/SOL-ORE"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
