import { WalletContextState } from '@solana/wallet-adapter-react'
import { POOL_WSS_SERVER } from './constants'
import { getServerTimestamp } from './poolUtils'

type RewardDetails = {
  totalBalance: number;
  totalRewards: number;
  minerSuppliedDifficulty: number;
  minerEarnedRewards: number;
  minerPercentage: number;
};

type CoalDetails = {
  rewardDetails: RewardDetails;
  topStake: number;
  stakeMultiplier: number;
  guildTotalStake: number;
  guildMultiplier: number;
  toolMultiplier: number;
};

type OreBoost = {
  topStake: number;
  totalStake: number;
  stakeMultiplier: number;
  mintAddress: Uint8Array;
  name: string;
};

type OreDetails = {
  rewardDetails: RewardDetails;
  topStake: number;
  stakeMultiplier: number;
  oreBoosts: OreBoost[];
};

type MinerDetails = {
  totalChromium: number;
  totalCoal: number;
  totalOre: number;
  guildAddress: Uint8Array;
  minerAddress: Uint8Array;
};

export type ServerMessagePoolSubmissionResult = {
  difficulty: number;
  challenge: Uint8Array;
  bestNonce: bigint;
  activeMiners: number;
  coalDetails: CoalDetails;
  oreDetails: OreDetails;
  minerDetails: MinerDetails;
};

export type ServerMessage =
  | { type: 'StartMining', challenge: Uint8Array, nonceRange: [bigint, bigint], cutoff: bigint }
  | { type: 'PoolSubmissionResult', data: ServerMessagePoolSubmissionResult };

export type MiningResult = {
  best_difficulty: number,
  best_nonce: bigint,
  total_hashes: bigint
}

export async function getServerWS (
  wallet: WalletContextState): Promise<WebSocket> {
  if (!wallet.publicKey) {
    throw new Error('User wallet is not available')
  }
  if (!wallet.signMessage) {
    throw new Error('User wallet does not support signing messages')
  }
  const timestamp = await getServerTimestamp()
  // await wallet.signMessage(new TextEncoder().encode('Start mining'))

  const wsUrl = new URL(`${POOL_WSS_SERVER}/v2/ws-web`)
  wsUrl.searchParams.append('timestamp', timestamp)
  wsUrl.searchParams.append('pubkey', wallet.publicKey.toString())

  const ws = new WebSocket(wsUrl.toString())

  return new Promise((resolve, reject) => {
    ws.onopen = (event) => {
      console.log('Connected to mining server', event)
      if (!wallet.publicKey) {
        throw new Error('User wallet is not available')
      }
      try {
        // Create and send the "Ready" message
        const now = BigInt(Math.floor(Date.now() / 1000)) // Current time in seconds
        const msg = new Uint8Array(8) // 8 bytes for u64
        for (let i = 0; i < 8; i++) {
          msg[i] = Number((now >> BigInt(8 * i)) & BigInt(255))
        }

        // const signature = await wallet.signMessage(msg)

        const binData = new Uint8Array(1 + 32 + 8
          //+ signature.length
        )
        binData[0] = 0 // First byte is 0
        binData.set(wallet.publicKey.toBytes(), 1) // Next 32 bytes are public key
        binData.set(msg, 33) // Next 8 bytes are the timestamp
        // binData.set(signature, 41) // Rest is the signature

        ws.send(binData)
        console.log('Sent Ready message')

        resolve(ws)
      } catch (error) {
        console.error('Failed to send Ready message:', error)
        reject(error)
      }
    }

    ws.onerror = (error) => {
      reject(error)
    }
  })
}
