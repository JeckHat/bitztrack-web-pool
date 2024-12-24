import { WalletContextState } from '@solana/wallet-adapter-react'
import { COAL_TOKEN_DECIMALS, POOL_WSS_SERVER } from './constants'
import { getServerTimestamp } from './poolUtils'

export type RewardDetails = {
  totalBalance: number;
  totalRewards: number;
  minerSuppliedDifficulty: number;
  minerEarnedRewards: number;
  minerPercentage: number;
};

export type OreBoost = {
  topStake: number;
  totalStake: number;
  stakeMultiplier: number;
  mintAddress: Uint8Array;
  name: string;
};

export type CoalDetails = {
  rewardDetails: RewardDetails;
  topStake: number;
  stakeMultiplier: number;
  guildTotalStake: number;
  guildMultiplier: number;
  toolMultiplier: number;
};

export type OreDetails = {
  rewardDetails: RewardDetails;
  topStake: number;
  stakeMultiplier: number;
  oreBoosts: OreBoost[];
};

export type MinerDetails = {
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
  best_d: Uint8Array,
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
    ws.onopen = () => {
      // console.log('Connected to mining server', event)
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
        // console.log('Sent Ready message')

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

export function deserializeServerMessagePoolSubmissionResult (dataView: DataView, offset: number): ServerMessagePoolSubmissionResult {
  const difficulty = dataView.getUint32(offset, true)
  offset += 4

  // console.log('difficulty -->', difficulty)

  const challenge = new Uint8Array(dataView.buffer, offset, 32)
  offset += 32

  // console.log('challenge -->', challenge)

  const bestNonce = dataView.getBigUint64(offset, true)
  offset += 8

  // console.log('bestNonce -->', bestNonce)

  const activeMiners = dataView.getUint32(offset, true)
  offset += 4

  // console.log('activeMiners -->', activeMiners)

  const coalDetails = deserializeCoalDetails(dataView, offset)
  offset += sizeOfCoalDetails()

  // console.log('coalDetails -->', coalDetails)

  const oreDetails = deserializeOreDetails(dataView, offset)
  offset += sizeOfOreDetails()

  // console.log('oreDetails -->', oreDetails)

  const minerDetails = deserializeMinerDetails(dataView, dataView.byteLength - sizeOfMinerDetails() + 1)

  // console.log('minerDetails -->', minerDetails)

  return {
    difficulty,
    challenge,
    bestNonce,
    activeMiners,
    coalDetails,
    oreDetails,
    minerDetails,
  }
}

function deserializeRewardDetails (dataView: DataView, offset: number): RewardDetails {
  const totalBalance = dataView.getFloat64(offset, true)
  // console.log('totalBalance', totalBalance)
  offset += 8
  const totalRewards = dataView.getFloat64(offset, true)
  // console.log('totalRewards', totalRewards)
  offset += 8
  const minerSuppliedDifficulty = dataView.getUint32(offset, true)
  // console.log('minerSuppliedDifficulty', minerSuppliedDifficulty)
  offset += 4
  const minerEarnedRewards = dataView.getFloat64(offset, true)
  // console.log('minerEarnedRewards', minerEarnedRewards)
  offset += 8
  const minerPercentage = dataView.getFloat64(offset, true)
  // console.log('minerPercentage', minerPercentage)
  offset += 8

  return {
    totalBalance,
    totalRewards,
    minerSuppliedDifficulty,
    minerEarnedRewards,
    minerPercentage,
  }
}

function deserializeCoalDetails (dataView: DataView, offset: number): CoalDetails {
  const rewardDetails = deserializeRewardDetails(dataView, offset)
  offset += sizeOfRewardDetails()

  // console.log('rewardDetails', rewardDetails)

  const topStake = dataView.getFloat64(offset, true)
  // console.log('topStake', topStake)
  offset += 8
  const stakeMultiplier = dataView.getFloat64(offset, true)
  // console.log('stakeMultiplier', stakeMultiplier)
  offset += 8
  const guildTotalStake = dataView.getFloat64(offset, true)
  // console.log('guildTotalStake', guildTotalStake)
  offset += 8
  const guildMultiplier = dataView.getFloat64(offset, true)
  // console.log('guildMultiplier', guildMultiplier)
  offset += 8
  const toolMultiplier = dataView.getFloat64(offset, true)
  // console.log('toolMultiplier', toolMultiplier)
  offset += 8

  return {
    rewardDetails,
    topStake,
    stakeMultiplier,
    guildTotalStake,
    guildMultiplier,
    toolMultiplier,
  }
}

function deserializeOreBoost (dataView: DataView, offset: number): OreBoost {
  const topStake = dataView.getFloat64(offset, true)
  offset += 8
  const totalStake = dataView.getFloat64(offset, true)
  offset += 8
  const stakeMultiplier = dataView.getFloat64(offset, true)
  offset += 8

  const mintAddress = new Uint8Array(dataView.buffer, offset, 32)
  offset += 32

  // For now, we'll skip the name as it's an empty string in the server data
  // If you need to include it later, you can add the necessary deserialization here

  return {
    topStake,
    totalStake,
    stakeMultiplier,
    mintAddress,
    name: '', // Set to empty string as per server data
  }
}

function deserializeOreDetails (dataView: DataView, offset: number): OreDetails {
  const rewardDetails = deserializeRewardDetails(dataView, offset)
  offset += sizeOfRewardDetails()

  const topStake = dataView.getFloat64(offset, true)
  // console.log('topStake', topStake)
  offset += 8
  const stakeMultiplier = dataView.getFloat64(offset, true)
  // console.log('stakeMultiplier', stakeMultiplier)
  offset += 8

  const oreBoosts: OreBoost[] = []
  for (let i = 0; i < 3; i++) {
    const oreBoost = deserializeOreBoost(dataView, offset)
    oreBoosts.push(oreBoost)
    offset += sizeOfOreBoost()
    // console.log(`OreBoost ${i}:`, oreBoost)
  }

  return {
    rewardDetails,
    topStake,
    stakeMultiplier,
    oreBoosts,
  }
}

function deserializeMinerDetails (dataView: DataView, offset: number): MinerDetails {
  const totalChromium = Number(dataView.getFloat64(offset, true)) / Math.pow(10, COAL_TOKEN_DECIMALS)
  // console.log('totalChromium', totalChromium)
  offset += 8
  const totalCoal = Number(dataView.getFloat64(offset, true)) / Math.pow(10, COAL_TOKEN_DECIMALS)
  // console.log('totalCoal', totalCoal)
  offset += 8
  const totalOre = Number(dataView.getFloat64(offset, true)) / Math.pow(10, COAL_TOKEN_DECIMALS)
  // console.log('totalOre', totalOre)
  offset += 8

  const guildAddress = new Uint8Array(dataView.buffer, offset, 32)
  offset += 32
  const minerAddress = new Uint8Array(dataView.buffer, offset, 32)

  // console.log('guildAddress addy ->', (new PublicKey(guildAddress)).toString())
  // console.log('miner addy ->', (new PublicKey(minerAddress)).toString())

  return {
    totalChromium,
    totalCoal,
    totalOre,
    guildAddress,
    minerAddress,
  }
}

export function sizeOfRewardDetails (): number {
  return 8 * 4 + 4 // 4 float64 (8 bytes each) + 1 uint32 (4 bytes)
}

export function sizeOfCoalDetails (): number {
  return sizeOfRewardDetails() + 8 * 5 // RewardDetails + 5 float64 (8 bytes each)
}

export function sizeOfOreBoost (): number {
  return 8 * 3 + 32 + 10// 3 float64 (8 bytes each) + 32 bytes for mintAddress
  // Note: We're not including any bytes for the name, as it's currently an empty string
}

export function sizeOfOreDetails (): number {
  return sizeOfRewardDetails() + 8 * 2 + sizeOfOreBoost() * 3
  // RewardDetails + 2 float64 (topStake and stakeMultiplier) + 3 OreBoosts
}

export function sizeOfMinerDetails (): number {
  return 8 * 3 + 32 + 32 // 3 float64 (8 bytes each) + 32 bytes for guildAddress + 32 bytes for minerAddress
}
