'use client'

import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import React, { useMemo } from 'react'

export function ClientWalletProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const endpoint = useMemo(() => 'https://api.mainnet-beta.solana.com', [])

  const wallets = useMemo(
    () => [

    ],
    []
  )

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
