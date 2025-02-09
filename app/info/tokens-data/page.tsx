import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import TokenPrice from '../../../components/token-price'

export default function Page () {
  return (
    <div className="px-6 py-10">
      <h1 className="text-4xl font-bold text-center mb-8">Token Information</h1>
      <div className="text-center mb-6">
        <p className="text-lg leading-relaxed">
          Current prices and information about COAL and ORE tokens.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>
              <a href="https://minechain.gg"
                 target="_blank"
                 className="underline"
                 rel="noopener noreferrer">COAL</a>
            </CardTitle>
            First and only PoW meme coin on Solana<br/>
            Fair distribution, gamified mechanics, mine, craft, forge tools and grow you yield with your guild.
          </CardHeader>
          <CardContent>
            <TokenPrice
              tokenId="coal-2"
              iconUrl="/images/coal-logo.png"
              jupiterLink="https://jup.ag/swap/SOL-E3yUqBNTZxV8ELvW99oRLC7z4ddbJqqR4NphwrMug9zu"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle> <a href="https://ore.supply"
                           target="_blank"
                           className="underline"
                           rel="noopener noreferrer">ORE</a></CardTitle>
            Digital gold on Solana<br/>
            Hard, liquid, secure and easy to mine. Liquidity for onchain commodities. Max supply 5 million tokens.
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
