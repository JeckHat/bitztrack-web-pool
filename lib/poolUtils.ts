import { BlockhashWithExpiryBlockHeight, PublicKey, PublicKeyInitData, TransactionInstruction } from '@solana/web3.js'
import { getAssociatedTokenAddress } from '@solana/spl-token'
import axios from 'axios'
import { BalanceData, BlockhashData } from '../pages/api/apiDataTypes'
import { POOL_SERVER } from './constants'

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
