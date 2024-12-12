import { PublicKey } from '@solana/web3.js'

export const COAL_MINT_ADDRESS: PublicKey = new PublicKey(process.env.NEXT_PUBLIC_COAL_MINT ?? '')
export const CHROMIUM_MINT_ADDRESS: PublicKey = new PublicKey(process.env.NEXT_PUBLIC_CHROMIUM_MINT ?? '')
export const ORE_MINT_ADDRESS: PublicKey = new PublicKey(process.env.NEXT_PUBLIC_ORE_MINT ?? '')
export const COAL_SOL_LP_MINT_ADDRESS: PublicKey = new PublicKey(process.env.NEXT_PUBLIC_COAL_SOL_LP_MINT ?? '')
export const COAL_TOKEN_DECIMALS = parseInt(process.env.NEXT_PUBLIC_COAL_DECIMALS ?? '11')

export const POOL_SERVER = process.env.NEXT_PUBLIC_POOL_SERVER ?? ''
