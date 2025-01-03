import { BlockhashWithExpiryBlockHeight, PublicKey, PublicKeyInitData, TransactionInstruction } from '@solana/web3.js'
import { getAssociatedTokenAddress } from '@solana/spl-token'
import axios from 'axios'
import {
  BalanceData,
  BlockhashData,
  ChromiumReprocessInfo,
  ChromiumReprocessInfoWithDate,
  MinerBalance,
  MinerBalanceString,
  StakeAndMultipliers,
  StakeAndMultipliersString,
  Submission,
  SubmissionWithDate
} from '../pages/api/apiDataTypes'
import { COAL_TOKEN_DECIMALS, POOL_SERVER } from './constants'
import { parseISO } from 'date-fns'

export async function getTokenBalance (publicKey: PublicKey, mintAddress: PublicKey): Promise<number> {
  const tokenAccount = await getAssociatedTokenAddress(mintAddress, publicKey)
  let response
  try {
    response = await axios.post<BalanceData>('/api/get-balance', { tokenAccount: tokenAccount.toString() })
  } catch (err) {
    console.error(err)
    return 0
  }
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
  if (response.data === 'SUCCESS') {
    console.log('Successfully signed up!')
  } else if (response.data !== 'EXISTS') {
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

export async function getMinerRewardsNumeric (publicKey: string): Promise<MinerBalance> {
  try {
    const response = await axios.get<MinerBalance>(`${POOL_SERVER}/miner/rewards?pubkey=${publicKey}`)
    return response.data
  } catch {
    return { coal: 0, ore: 0, chromium: 0 }
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

export async function getMinerRewards (publicKey: string): Promise<MinerBalanceString> {
  const response = await getMinerRewardsNumeric(publicKey)
  return {
    coal: response.coal?.toString() ?? '-',
    ore: response.ore?.toString() ?? '-',
    chromium: response.chromium?.toString() ?? '-',
  }
}

export async function getMinerSubmissions (publicKey: string): Promise<SubmissionWithDate[]> {
  try {
    const response = await axios.get<Submission[]>(`${POOL_SERVER}/miner/submissions?pubkey=${publicKey}`)
    return response.data.map(x => {
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
  console.log('submissions', submissions)
  return submissions.length > 0 ? submissions[0] : {
    difficulty: 0,
    created_at: new Date(),
    nonce: 0
  }
}

export async function getPoolChromiumReprocessingInfo (): Promise<ChromiumReprocessInfoWithDate> {
  try {
    const response = await axios.get<ChromiumReprocessInfo>(`${POOL_SERVER}/pool/chromium/reprocess-info`)
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
