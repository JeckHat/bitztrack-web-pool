import { WalletContextState } from '@solana/wallet-adapter-react'
import { deserializeInstructionFromJson, getFeePayerPubkey, getLatestBlockhash, getTokenBalance } from './poolUtils'
import { Transaction, TransactionInstruction } from '@solana/web3.js'
import axios, { AxiosError } from 'axios'
import { COAL_SOL_LP_MINT_ADDRESS, COAL_TOKEN_DECIMALS, POOL_SERVER } from './constants'

export async function stakeToGuild (
  amount: number,
  wallet: WalletContextState,
) {
  if (!wallet) throw new Error('User wallet is not available')
  const userPublicKey = wallet.publicKey
  if (!userPublicKey) throw new Error('User public key is not available')

  const balance = await getTokenBalance(userPublicKey, COAL_SOL_LP_MINT_ADDRESS)
  const guildStakeAmount = amount > balance ? balance : amount

  console.log('guildStakeAmount', guildStakeAmount)

  const feePayerPubkey = await getFeePayerPubkey()

  const instructions: TransactionInstruction[] = []

  let needsToAddDelegation = false

  try {
    const checkMemberResponse = await axios.get(`${POOL_SERVER}/guild/check-member?pubkey=${userPublicKey.toString()}`)
    console.log('checkMemberResponse', checkMemberResponse)
    if (checkMemberResponse.status === 404) {
      needsToAddDelegation = true
      const newMemberInstructionResponse = await axios.get(`${POOL_SERVER}/guild/new-member-instruction?pubkey=${userPublicKey.toString()}`)
      if (newMemberInstructionResponse.status === 200) {
        const jsonInstruction: string = JSON.stringify(newMemberInstructionResponse.data)
        const instruction = await deserializeInstructionFromJson(jsonInstruction)
        instructions.push(instruction)
      } else {
        throw new Error('Error while creating new member instruction')
      }
    } else if (checkMemberResponse.status === 200) {
      console.log('Member already in the guild but needs delegation')
      needsToAddDelegation = true
    } else if (checkMemberResponse.status === 302) {
      console.log('Member already in the guild but no delegation needed')
    } else {
      throw new Error('Error while checking member status', checkMemberResponse.data)
    }
  } catch (error) {
    console.log('error', error)
    if (typeof error === 'object' && error instanceof AxiosError && error.status === 302) {
      console.log('Member already in the guild')
    } else if (typeof error === 'object' && error instanceof AxiosError && error.status === 404) {
      needsToAddDelegation = true
      console.log('Member without data')
      const newMemberInstructionResponse = await axios.get(`${POOL_SERVER}/guild/new-member-instruction?pubkey=${userPublicKey.toString()}`)
      if (newMemberInstructionResponse.status === 200) {
        const jsonInstruction: string = JSON.stringify(newMemberInstructionResponse.data)
        const instruction = await deserializeInstructionFromJson(jsonInstruction)
        instructions.push(instruction)
      } else {
        throw new Error('Error while creating new member instruction')
      }
    } else if (error && (error as AxiosError).response?.data) {
      throw new Error('Error while checking member status - ' + (error as AxiosError).response?.data)
    } else {
      throw new Error('Error while checking member status')
    }
  }

  if (needsToAddDelegation) {
    const delegateInstructionResponse = await axios.get(`${POOL_SERVER}/guild/delegate-instruction?pubkey=${userPublicKey.toString()}`)
    if (delegateInstructionResponse.status === 200) {
      console.log('delegateInstructionResponse.data', delegateInstructionResponse.data)
      const jsonInstruction: string = JSON.stringify(delegateInstructionResponse.data)
      const instruction = await deserializeInstructionFromJson(jsonInstruction)
      instructions.push(instruction)
    } else {
      throw new Error('Error while creating delegate instruction')
    }
  }

  const guildStakeAmountLamports = Math.floor(guildStakeAmount * Math.pow(10, COAL_TOKEN_DECIMALS))

  const stakeInstructionResponse = await axios.get(`${POOL_SERVER}/guild/stake-instruction?pubkey=${userPublicKey.toString()}&mint=${COAL_SOL_LP_MINT_ADDRESS}&amount=${guildStakeAmountLamports}`)
  if (stakeInstructionResponse.status === 200 || stakeInstructionResponse.status) {
    const jsonInstruction: string = JSON.stringify(stakeInstructionResponse.data)
    const instruction = await deserializeInstructionFromJson(jsonInstruction)
    instructions.push(instruction)
  } else {
    throw new Error('Error while creating stake instruction')
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
    `${POOL_SERVER}/guild/stake?pubkey=${userPublicKey.toString()}&mint=${COAL_SOL_LP_MINT_ADDRESS.toString()}&amount=${guildStakeAmountLamports}`,
    encodedTransaction
  )

  if (response.data === 'SUCCESS') {
    console.log('Successfully staked to guild!')
  } else {
    throw new Error('Transaction failed:', response.data)
  }
}
