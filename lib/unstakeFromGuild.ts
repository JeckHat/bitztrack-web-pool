import { WalletContextState } from '@solana/wallet-adapter-react'
import { deserializeInstructionFromJson, getFeePayerPubkey, getLatestBlockhash, getLPStake } from './poolUtils'
import { Transaction, TransactionInstruction } from '@solana/web3.js'
import axios, { AxiosError } from 'axios'
import { COAL_SOL_LP_MINT_ADDRESS, COAL_TOKEN_DECIMALS, POOL_SERVER } from './constants'

export async function unstakeFromGuild (
  amount: number,
  wallet: WalletContextState,
) {
  if (!wallet) throw new Error('User wallet is not available')
  const userPublicKey = wallet.publicKey
  if (!userPublicKey) throw new Error('User public key is not available')

  const balance = await getLPStake(userPublicKey)
  const guildUnStakeAmount = amount > balance ? balance : amount

  console.log('guildUnStakeAmount', guildUnStakeAmount)

  const feePayerPubkey = await getFeePayerPubkey()

  const instructions: TransactionInstruction[] = []

  try {
    const checkMemberResponse = await axios.get(`${POOL_SERVER}/guild/check-member?pubkey=${userPublicKey.toString()}`)
    console.log('checkMemberResponse', checkMemberResponse)
    if (checkMemberResponse.status === 404) {
      throw new Error('Error guild member not found')
    } else if (checkMemberResponse.status === 200) {
      throw new Error('Error publickey not in any guild')
    } else if (checkMemberResponse.status === 302) {
      console.log('Member in the guild')
    } else {
      throw new Error('Error while checking member status', checkMemberResponse.data)
    }
  } catch (error) {
    console.log('error', error)
    if (typeof error === 'object' && error instanceof AxiosError && error.status === 302) {
      console.log('Member in the guild')
    } else if (typeof error === 'object' && error instanceof AxiosError && error.status === 404) {
      throw new Error('Error guild member not found')
    } else if (error && (error as AxiosError).response?.data) {
      throw new Error('Error while checking member status - ' + (error as AxiosError).response?.data)
    } else {
      throw new Error('Error while checking member status')
    }
  }

  const guildUnStakeAmountLamports = Math.floor(guildUnStakeAmount * Math.pow(10, COAL_TOKEN_DECIMALS))

  const unStakeInstructionResponse = await axios.get(`${POOL_SERVER}/guild/unstake-instruction?pubkey=${userPublicKey.toString()}&mint=${COAL_SOL_LP_MINT_ADDRESS}&amount=${guildUnStakeAmountLamports}`)
  if (unStakeInstructionResponse.status === 200 || unStakeInstructionResponse.status) {
    const jsonInstruction: string = JSON.stringify(unStakeInstructionResponse.data)
    const instruction = await deserializeInstructionFromJson(jsonInstruction)
    instructions.push(instruction)
  } else {
    throw new Error('Error while creating unstake instruction')
  }

  const latestBlockhash = await getLatestBlockhash()
  if (!latestBlockhash) throw new Error('Failed to get latest block')

  const transaction = new Transaction().add(...instructions)
  transaction.recentBlockhash = latestBlockhash.blockhash
  transaction.feePayer = feePayerPubkey

  if (!wallet.signTransaction) {
    throw new Error('Wallet does not support transaction signing')
  }

  const signedTransaction = await wallet.signTransaction(transaction)
  const serializedTransaction = signedTransaction.serialize({ requireAllSignatures: false })
  const encodedTransaction = Buffer.from(serializedTransaction).toString('base64')

  const response = await axios.post(
    `${POOL_SERVER}/guild/unstake?pubkey=${userPublicKey.toString()}&mint=${COAL_SOL_LP_MINT_ADDRESS.toString()}&amount=${guildUnStakeAmountLamports}`,
    encodedTransaction
  ).catch(error => {
    if (error && (error as AxiosError).response?.data) {
      throw new Error('Error while unstaking from guild - ' + (error as AxiosError).response?.data)
    } else {
      throw new Error('Error while  unstaking from guild')
    }
  })

  if (response.data === 'SUCCESS') {
    console.log('Successfully unstaked from guild!')
  } else {
    throw new Error('Transaction failed:', response.data)
  }
}
