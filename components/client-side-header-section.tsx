'use client'

import { WalletButton } from './wallet-button'
import { ModeToggle } from './mode-toggle'

export function ClientSideHeaderSection() {
  return (
    <div className="flex-1 justify-end flex gap-5">
      <WalletButton />
      <ModeToggle />
    </div>
  )
}
