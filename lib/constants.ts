import { PublicKey } from '@solana/web3.js'

export const COAL_MINT_ADDRESS: PublicKey = new PublicKey(process.env.NEXT_PUBLIC_COAL_MINT ?? '');
export const COAL_TOKEN_DECIMALS = parseInt(process.env.NEXT_PUBLIC_COAL_DECIMALS ?? '11');

export const POOL_SERVER = process.env.NEXT_PUBLIC_POOL_SERVER ?? '';
