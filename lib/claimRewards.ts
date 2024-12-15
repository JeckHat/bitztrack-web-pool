import axios, { AxiosError } from 'axios'
import { COAL_TOKEN_DECIMALS, POOL_SERVER } from './constants'
import { getMinerRewardsNumeric, getServerTimestamp } from './poolUtils'
import { WalletContextState } from '@solana/wallet-adapter-react'

export const MINIMUM_CLAIM_AMOUNT_COAL = 5
export const MINIMUM_CLAIM_AMOUNT_ORE = 0.05
export const TOKEN_CREATION_AMOUNT_COAL = 4
export const TOKEN_CREATION_AMOUNT_ORE = 0.02

export async function claimRewards (
  wallet: WalletContextState,
) {
  if (!wallet) throw new Error('User wallet is not available')
  const userPublicKey = wallet.publicKey
  if (!userPublicKey) throw new Error('User public key is not available')

  // Fetch miner rewards
  const rewards = await getMinerRewardsNumeric(userPublicKey.toString())

  console.log('Miner Unclaimed Rewards:', rewards)

  if (rewards.coal < MINIMUM_CLAIM_AMOUNT_COAL && rewards.ore < MINIMUM_CLAIM_AMOUNT_ORE) {
    throw new Error('Insufficient rewards to claim')
  }

  // Convert rewards to grains (smallest unit)
  const balanceGrainsCoal = Math.floor(rewards.coal * Math.pow(10, COAL_TOKEN_DECIMALS))
  const balanceGrainsOre = Math.floor(rewards.ore * Math.pow(10, COAL_TOKEN_DECIMALS))
  const balanceGrainsChromium = Math.floor(rewards.chromium * Math.pow(10, COAL_TOKEN_DECIMALS))

  if (balanceGrainsCoal === 0 && balanceGrainsOre === 0) {
    throw new Error('Insufficient rewards to claim')
  }

  // Get timestamp from server
  const timestampResponse = await getServerTimestamp()
  const timestamp = parseInt(timestampResponse)

  if (!wallet.signMessage) {
    throw new Error('Wallet does not support message signing')
  }

  // Sign the message
  const signature = await wallet.signMessage(new TextEncoder().encode(`Claim: ${rewards.coal} COAL ${rewards.ore} ORE ${rewards.chromium} Chromium`))

  // Encode the authorization
  // const auth = btoa(`${userPublicKey.toString()}:${Buffer.from(signature).toString('base64')}`)

  // Send claim request
  try {
    const response = await axios.post(
      `${POOL_SERVER}/v2/claim-all`,
      null,
      {
        params: {
          timestamp,
          receiver_pubkey: userPublicKey.toString(),
          amount_coal: balanceGrainsCoal,
          amount_ore: balanceGrainsOre,
          amount_chromium: balanceGrainsChromium,
          username: userPublicKey.toString(),
          password: Buffer.from(signature).toString('base64')
        }
      }
    ).catch(err => {
      throw new Error(err.response.data)
    })

    const result = response.data

    console.log('result', result)

    if (result === 'SUCCESS') {
      return
    } else if (result === 'QUEUED') {
      return
    } else if (!isNaN(Number(result))) {
      const timeLeft = 1800 - Number(result)
      const mins = Math.floor(timeLeft / 60)
      const secs = timeLeft % 60
      throw new Error(`You cannot claim until the time is up. Time left: ${mins}m ${secs}s`)
    } else {
      throw new Error(result)
    }
  } catch (error) {
    console.error('Error claiming rewards:', error)
    throw new Error((error as AxiosError).toString())
  }
}
