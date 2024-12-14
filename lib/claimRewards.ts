import axios from 'axios'
import { PublicKey } from '@solana/web3.js'
import { COAL_TOKEN_DECIMALS, POOL_SERVER } from './constants'
import { getMinerRewardsNumeric, getServerTimestamp } from './poolUtils'
import { toast } from '../hooks/use-toast'

export const MINIMUM_CLAIM_AMOUNT_COAL = 5
export const MINIMUM_CLAIM_AMOUNT_ORE = 0.05

export async function claimRewards (
  publicKey: PublicKey,
  signMessage: (message: Uint8Array) => Promise<Uint8Array>,
  receiverPublicKey?: string
) {
  const receiverPubkey = receiverPublicKey || publicKey.toString()

  // Fetch miner rewards
  const rewards = await getMinerRewardsNumeric(publicKey.toString())

  console.log('Miner Unclaimed Rewards:', rewards)

  if (rewards.coal < MINIMUM_CLAIM_AMOUNT_COAL && rewards.ore < MINIMUM_CLAIM_AMOUNT_ORE) {
    toast({
      title: 'Insufficient Rewards',
      description: `You need at least ${MINIMUM_CLAIM_AMOUNT_COAL} COAL or ${MINIMUM_CLAIM_AMOUNT_ORE} ORE to claim rewards.`,
      variant: 'destructive',
    })
    return
  }

  // Convert rewards to grains (smallest unit)
  const balanceGrainsCoal = Math.floor(rewards.coal * Math.pow(10, COAL_TOKEN_DECIMALS))
  const balanceGrainsOre = Math.floor(rewards.ore * Math.pow(10, COAL_TOKEN_DECIMALS))
  const balanceGrainsChromium = Math.floor(rewards.chromium * Math.pow(10, COAL_TOKEN_DECIMALS))

  if (balanceGrainsCoal === 0 && balanceGrainsOre === 0 && balanceGrainsChromium === 0) {
    toast({
      title: 'No Balance',
      description: 'There is no balance to claim.',
      variant: 'destructive',
    })
    return
  }

  // Get timestamp from server
  const timestampResponse = await getServerTimestamp()
  const timestamp = parseInt(timestampResponse)

  // Prepare message to sign
  const message = new Uint8Array([
    ...Array.from(new Uint8Array(new BigUint64Array([BigInt(timestamp)]).buffer)),
    ...Array.from(new PublicKey(receiverPubkey).toBytes()),
    ...Array.from(new Uint8Array(new BigUint64Array([BigInt(balanceGrainsCoal)]).buffer)),
    ...Array.from(new Uint8Array(new BigUint64Array([BigInt(balanceGrainsOre)]).buffer)),
    ...Array.from(new Uint8Array(new BigUint64Array([BigInt(balanceGrainsChromium)]).buffer)),
  ])

  // Sign the message
  const signature = await signMessage(message)

  // Encode the authorization
  const auth = btoa(`${publicKey.toBase58()}:${Buffer.from(signature).toString('base64')}`)

  // Send claim request
  try {
    const response = await axios.post(
      `${POOL_SERVER}/v2/claim`,
      null,
      {
        params: {
          timestamp,
          receiver_pubkey: receiverPubkey,
          amount_coal: balanceGrainsCoal,
          amount_ore: balanceGrainsOre,
          amount_chromium: balanceGrainsChromium,
        },
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    )

    const result = response.data

    if (result === 'SUCCESS') {
      toast({
        title: 'Claim Request Successful',
        description: 'Successfully queued claim request!',
      })
    } else if (result === 'QUEUED') {
      toast({
        title: 'Claim Already Queued',
        description: 'Claim is already queued for processing.',
      })
    } else if (!isNaN(Number(result))) {
      const timeLeft = 1800 - Number(result)
      const mins = Math.floor(timeLeft / 60)
      const secs = timeLeft % 60
      toast({
        title: 'Claim Not Available',
        description: `You cannot claim until the time is up. Time left: ${mins}m ${secs}s`,
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Unexpected Response',
        description: result,
        variant: 'destructive',
      })
    }
  } catch (error) {
    console.error('Error claiming rewards:', error)
    toast({
      title: 'Error',
      description: 'Failed to claim rewards. Please try again later.',
      variant: 'destructive',
    })
  }
}
