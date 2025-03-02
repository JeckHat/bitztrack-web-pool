import { BlockhashWithExpiryBlockHeight, PublicKey, PublicKeyInitData, TransactionInstruction } from '@solana/web3.js'
import { getAssociatedTokenAddress } from '@solana/spl-token'
import axios, { AxiosResponse } from 'axios'
import {
  AvgGuildRewards,
  BalanceData,
  BlockhashData,
  ChallengeWithDifficulty,
  DiamondHandsMultiplier,
  FullMinerBalance,
  FullMinerBalanceString,
  ReprocessInfo,
  ReprocessInfoWithDate,
  StakeAndMultipliers,
  StakeAndMultipliersString,
  Submission,
  SubmissionEarningMinerInfo,
  SubmissionEarningMinerInfoApi,
  SubmissionWithDate
} from '../pages/api/apiDataTypes'
import { COAL_TOKEN_DECIMALS, POOL_SERVER } from './constants'
import { parseISO } from 'date-fns'

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const requestCache = new Map<string, Promise<AxiosResponse<any, any>>>()

export async function getTokenBalance (publicKey: PublicKey, mintAddress: PublicKey): Promise<number> {

  const tokenAccount = await getAssociatedTokenAddress(mintAddress, publicKey)
  let response
  const cacheKey = `getTokenBalance-${publicKey.toString()}-${mintAddress.toString()}`
  try {
    let targetCall = requestCache.get(cacheKey)
    if (!targetCall) {
      targetCall = axios.post<BalanceData>('/api/get-balance', { tokenAccount: tokenAccount.toString() })
      requestCache.set(cacheKey, targetCall)
    }
    response = await targetCall
  } catch (err) {
    console.error(err)
    return 0
  }
  requestCache.delete(cacheKey)
  const balance = response.data.balance
  return parseFloat(balance.value.amount) / Math.pow(10, balance.value.decimals)
}

export async function getLatestBlockhash (): Promise<BlockhashWithExpiryBlockHeight | null> {
  let response
  try {
    response = await axios.post<BlockhashData>('/api/get-latest-blockhash', {})
  } catch (err) {
    console.error(err)
    return null
  }
  return response.data.latestBlockhash
}

export async function getServerTimestamp (): Promise<string> {
  const response = await axios.get(`${POOL_SERVER}/timestamp`)
  return response.data
}

export async function getLPStake (publicKey: PublicKey): Promise<number> {
  try {
    const response = await axios.get<number>(`${POOL_SERVER}/miner/guild-stake?pubkey=${publicKey.toString()}`)
    return response.data
  } catch {
    return 0
  }
}

export async function getGuildLpStats (): Promise<AvgGuildRewards> {
  try {
    const response = await axios.get<AvgGuildRewards>(`${POOL_SERVER}/guild/lp-staking-rewards-stats`)
    return response.data
  } catch {
    return {
      last_30d: '0',
      last_7d: '0',
      last_24h: '0'
    }
  }
}

export async function getFeePayerPubkey (): Promise<PublicKey> {
  const response = await axios.get(`${POOL_SERVER}/pool/fee_payer/pubkey`)
  return new PublicKey(response.data)
}

export async function getPoolAuthorityPubkey (): Promise<PublicKey> {
  const response = await axios.get(`${POOL_SERVER}/pool/authority/pubkey`)
  return new PublicKey(response.data)
}

export async function signUpMiner (publicKey: string): Promise<void> {
  const response = await axios.post(`${POOL_SERVER}/v2/signup?miner=${publicKey}`, 'BLANK')
  if (response.data !== 'EXISTS') {
    console.log('Signup transaction failed, please try again.')
  }
}

export async function deserializeInstructionFromJson (jsonInstruction: string) {
  try {
    const parsed = JSON.parse(jsonInstruction)

    // Convert `program_id` to a PublicKey
    const programId = new PublicKey(parsed.program_id)

    // Convert `accounts` to the format expected by Solana
    const keys = parsed.accounts.map((account: {
      pubkey: PublicKeyInitData;
      is_signer: boolean;
      is_writable: boolean
    }) => ({
      pubkey: new PublicKey(account.pubkey),
      isSigner: account.is_signer,
      isWritable: account.is_writable,
    }))

    // Convert `data` to a Buffer
    const data = Buffer.from(parsed.data)

    // Reconstruct the Solana TransactionInstruction
    return new TransactionInstruction({
      programId,
      keys,
      data,
    })
  } catch (error) {
    console.error('Failed to deserialize instruction:', error)
    throw error
  }
}

export async function getPoolStakeAndMultipliers (): Promise<StakeAndMultipliersString> {
  const response = await axios.get<StakeAndMultipliers>(`${POOL_SERVER}/pool/stakes-multipliers`)
  const stakeAndMultipliers = response.data
  const coalMultiplier = parseFloat(stakeAndMultipliers.coal_multiplier.toFixed(2))
  const guildMultiplier = parseFloat(stakeAndMultipliers.guild_multiplier.toFixed(2))
  const toolMultiplier = parseFloat(stakeAndMultipliers.tool_multiplier.toFixed(2))
  const totalCoalMultiplier = parseFloat((coalMultiplier * guildMultiplier * toolMultiplier).toFixed(2))
  return {
    coal_multiplier: coalMultiplier.toString(),
    coal_stake: (stakeAndMultipliers.coal_stake / Math.pow(10, COAL_TOKEN_DECIMALS)).toFixed(2).toString(),
    guild_multiplier: guildMultiplier.toString(),
    guild_stake: (stakeAndMultipliers.guild_stake / Math.pow(10, COAL_TOKEN_DECIMALS)).toFixed(2).toString(),
    tool_multiplier: toolMultiplier.toString(),
    total_coal_multiplier: totalCoalMultiplier.toString(),
    ore_stake: (stakeAndMultipliers.ore_stake / Math.pow(10, COAL_TOKEN_DECIMALS)).toFixed(2).toString(),
  }
}

export async function getMinerRewardsNumeric (publicKey: string): Promise<FullMinerBalance> {
  try {
    const response = await axios.get<FullMinerBalance>(`${POOL_SERVER}/miner/rewards?pubkey=${publicKey}`)
    return response.data
  } catch {
    return { coal: 0, ore: 0, chromium: 0, ingot: 0, wood: 0, sol: 0 }
  }
}

export async function getMinerGuildStakeRewards (publicKey: string): Promise<string> {
  try {
    const response = await axios.get<string>(`${POOL_SERVER}/guild/lp-staking-rewards?pubkey=${publicKey}`)
    return response.data
  } catch {
    return '0'
  }
}

export async function getMinerGuildStakeRewards24h (publicKey: string): Promise<string> {
  try {
    const response = await axios.get<string>(`${POOL_SERVER}/guild/lp-staking-rewards-24h?pubkey=${publicKey}`)
    return response.data
  } catch {
    return '0'
  }
}

export async function getMinerRewards (publicKey: string): Promise<FullMinerBalanceString> {
  const response = await getMinerRewardsNumeric(publicKey)
  return {
    coal: response.coal?.toString() ?? '-',
    ore: response.ore?.toString() ?? '-',
    chromium: response.chromium?.toString() ?? '-',
    ingot: response.ingot?.toString() ?? '-',
    wood: response.wood?.toString() ?? '-',
    sol: response.sol?.toString() ?? '-',
  }
}

export async function getMinerSubmissions (publicKey: string): Promise<SubmissionWithDate[]> {
  try {
    const cacheKey = `getMinerSubmissions-${publicKey}`
    let targetCall = requestCache.get(cacheKey)
    if (!targetCall) {
      targetCall = axios.get<Submission[]>(`${POOL_SERVER}/miner/submissions?pubkey=${publicKey}`)
      requestCache.set(cacheKey, targetCall)
    }
    const response = await targetCall
    requestCache.delete(cacheKey)
    return response.data.map((x: Submission) => {
      const sub: SubmissionWithDate = {
        created_at: parseISO(x.created_at + '.000Z'),
        difficulty: x.difficulty,
        nonce: x.nonce,
      }
      return sub
    })
  } catch {
    return []
  }
}

export async function getLastMinerSubmission (publicKey: string): Promise<SubmissionWithDate> {
  const submissions = await getMinerSubmissions(publicKey)
  return submissions.length > 0 ? submissions[0] : {
    difficulty: 0,
    created_at: new Date(),
    nonce: 0
  }
}

export async function getMinerLastClaim (publicKey: string): Promise<Date | null> {
  try {
    const cacheKey = `getMinerLastClaim-${publicKey}`
    let targetCall = requestCache.get(cacheKey)
    if (!targetCall) {
      targetCall = axios.get<{ created_at: string }>(`${POOL_SERVER}/miner/last-claim?pubkey=${publicKey}`)
      requestCache.set(cacheKey, targetCall)
    }
    const response = await targetCall
    requestCache.delete(cacheKey)
    console.log('last claim:', response.data.created_at)
    if (response.data.created_at) {
      return parseISO(response.data.created_at + '.000Z')
    } else {
      return null
    }
  } catch {
    return null
  }
}

export async function getDiamondHandsMultiplier (publicKey: string): Promise<DiamondHandsMultiplier> {
  const lastClaim = await getMinerLastClaim(publicKey)
  if (!lastClaim) {
    return {
      lastClaim: null,
      multiplier: 4,
    }
  } else {
    // check how many weeks have passed from the last claim
    const weeksPassed = Math.floor((new Date().getTime() - lastClaim.getTime()) / (7 * 24 * 60 * 60 * 1000))
    // if 4 weeks have passed, return 4, otherwise return 1
    const multiplier = weeksPassed >= 4 ? 4 : weeksPassed
    return {
      lastClaim,
      multiplier,
    }
  }
}

export async function getPoolChromiumReprocessingInfo (): Promise<ReprocessInfoWithDate> {
  try {
    const cacheKey = `getPoolChromiumReprocessingInfo`
    let targetCall = requestCache.get(cacheKey)
    if (!targetCall) {
      targetCall = axios.get<ReprocessInfo>(`${POOL_SERVER}/pool/reprocess/chromium-info`)
      requestCache.set(cacheKey, targetCall)
    }
    const response = await targetCall
    requestCache.delete(cacheKey)
    return {
      last_reprocess: parseISO(response.data.last_reprocess + '.000Z'),
      next_reprocess: parseISO(response.data.next_reprocess + '.000Z'),
    }
  } catch {
    return {
      last_reprocess: new Date(),
      next_reprocess: new Date(),
    }
  }
}

export async function getPoolDiamondHandsReprocessingInfo (): Promise<ReprocessInfoWithDate> {
  try {
    const cacheKey = `getPoolDiamondHandsReprocessingInfo`
    let targetCall = requestCache.get(cacheKey)
    if (!targetCall) {
      targetCall = axios.get<ReprocessInfo>(`${POOL_SERVER}/pool/reprocess/diamond-hands-info`)
      requestCache.set(cacheKey, targetCall)
    }
    const response = await targetCall
    requestCache.delete(cacheKey)
    return {
      last_reprocess: parseISO(response.data.last_reprocess + '.000Z'),
      next_reprocess: parseISO(response.data.next_reprocess + '.000Z'),
    }
  } catch {
    return {
      last_reprocess: new Date(),
      next_reprocess: new Date(),
    }
  }
}

export async function getPoolOMCReprocessingInfo (): Promise<ReprocessInfoWithDate> {
  try {
    const cacheKey = `getPoolOMCReprocessingInfo`
    let targetCall = requestCache.get(cacheKey)
    if (!targetCall) {
      targetCall = axios.get<ReprocessInfo>(`${POOL_SERVER}/pool/reprocess/omc-info`)
      requestCache.set(cacheKey, targetCall)
    }
    const response = await targetCall
    requestCache.delete(cacheKey)
    return {
      last_reprocess: parseISO(response.data.last_reprocess + '.000Z'),
      next_reprocess: parseISO(response.data.next_reprocess + '.000Z'),
    }
  } catch {
    return {
      last_reprocess: new Date(),
      next_reprocess: new Date(),
    }
  }
}

export async function getLastChromiumReprocessingEarning (publicKey: string): Promise<FullMinerBalanceString> {
  try {
    const cacheKey = `getLastChromiumReprocessingEarning-${publicKey}`
    let targetCall = requestCache.get(cacheKey)
    if (!targetCall) {
      targetCall = axios.get<FullMinerBalance>(`${POOL_SERVER}/miner/reprocess/last-chromium?pubkey=${publicKey}`)
      requestCache.set(cacheKey, targetCall)
    }
    const response = await targetCall
    requestCache.delete(cacheKey)
    return {
      sol: response.data.sol?.toString() ?? '-',
      coal: response.data.coal?.toString() ?? '-',
      ore: response.data.ore?.toString() ?? '-',
      chromium: response.data.chromium?.toString() ?? '-',
      ingot: response.data.ingot?.toString() ?? '-',
      wood: response.data.wood?.toString() ?? '-',
    }
  } catch {
    return {
      sol: '-',
      coal: '-',
      ore: '-',
      chromium: '-',
      ingot: '-',
      wood: '-',
    }
  }
}

export async function getLastDiamondHandsReprocessingEarning (publicKey: string): Promise<FullMinerBalanceString> {
  try {
    const cacheKey = `getLastDiamondHandsReprocessingEarning-${publicKey}`
    let targetCall = requestCache.get(cacheKey)
    if (!targetCall) {
      targetCall = axios.get<FullMinerBalance>(`${POOL_SERVER}/miner/reprocess/last-omc?pubkey=${publicKey}`)
      requestCache.set(cacheKey, targetCall)
    }
    const response = await targetCall
    requestCache.delete(cacheKey)
    return {
      sol: response.data.sol?.toString() ?? '-',
      coal: response.data.coal?.toString() ?? '-',
      ore: response.data.ore?.toString() ?? '-',
      chromium: response.data.chromium?.toString() ?? '-',
      ingot: response.data.ingot?.toString() ?? '-',
      wood: response.data.wood?.toString() ?? '-',
    }
  } catch {
    return {
      sol: '-',
      coal: '-',
      ore: '-',
      chromium: '-',
      ingot: '-',
      wood: '-',
    }
  }
}

export async function getLastOMCReprocessingEarning (publicKey: string): Promise<FullMinerBalanceString> {
  try {
    const cacheKey = `getLastOMCReprocessingEarning-${publicKey}`
    let targetCall = requestCache.get(cacheKey)
    if (!targetCall) {
      targetCall = axios.get<FullMinerBalance>(`${POOL_SERVER}/miner/reprocess/last-diamond-hands?pubkey=${publicKey}`)
      requestCache.set(cacheKey, targetCall)
    }
    const response = await targetCall
    requestCache.delete(cacheKey)
    return {
      sol: response.data.sol?.toString() ?? '-',
      coal: response.data.coal?.toString() ?? '-',
      ore: response.data.ore?.toString() ?? '-',
      chromium: response.data.chromium?.toString() ?? '-',
      ingot: response.data.ingot?.toString() ?? '-',
      wood: response.data.wood?.toString() ?? '-',
    }
  } catch {
    return {
      sol: '-',
      coal: '-',
      ore: '-',
      chromium: '-',
      ingot: '-',
      wood: '-',
    }
  }
}

export async function getCurrentMinersCount (): Promise<string> {
  try {
    const response = await axios.get<number>(`${POOL_SERVER}/active-miners`)
    return response.data.toString()
  } catch {
    return '-'
  }
}

export async function getPoolChallenges (): Promise<ChallengeWithDifficulty[]> {
  try {
    const response = await axios.get<ChallengeWithDifficulty[]>(`${POOL_SERVER}/challenges`)
    return response.data
  } catch {
    return []
  }
}

export async function getMinerEarningsSubmissions (pubkey: string, fromDate: Date, toDate: Date): Promise<SubmissionEarningMinerInfo[]> {
  const cacheKey = `getMinerEarningsSubmissions-${pubkey}`
  try {
    console.log('fromDate:', fromDate.toISOString())
    console.log('toDate:', toDate.toISOString())
    let targetCall = requestCache.get(cacheKey)
    if (!targetCall) {
      targetCall = axios.get<SubmissionEarningMinerInfoApi[]>(`${POOL_SERVER}/miner/earnings-submissions?pubkey=${pubkey}&start_time=${Math.round(fromDate.getTime() / 1000)}&end_time=${Math.round(toDate.getTime() / 1000)}`)
      requestCache.set(cacheKey, targetCall)
    }
    const response = await targetCall
    requestCache.delete(cacheKey)
    return response.data.map((x: SubmissionEarningMinerInfoApi) => ({
      minerId: x.miner_id,
      bestChallengeHashpower: x.best_challenge_hashpower,
      bestDifficulty: x.best_difficulty,
      challengeId: x.challenge_id,
      createdAt: parseISO(x.created_at + '.000Z'),
      minerAmountCoal: x.miner_amount_coal,
      minerAmountOre: x.miner_amount_ore,
      minerDifficulty: x.miner_difficulty,
      minerHashpower: x.miner_hashpower,
      pubkey: x.pubkey,
      totalRewardsEarnedCoal: x.total_rewards_earned_coal,
      totalRewardsEarnedOre: x.total_rewards_earned_ore,
    }))
  } catch {
    requestCache.delete(cacheKey)
    return []
  }
}
