'use client'

import React, { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { getServerWS, MiningResult, ServerMessage, ServerMessagePoolSubmissionResult } from '../../../lib/mine'
import { signUpMiner } from '../../../lib/poolUtils'

export default function WebMiner () {
  const wallet = useWallet()
  const [minerWs, setMinerWs] = useState<WebSocket | null>(null)
  const [isMining, setIsMining] = useState(false)
  const [hashRate, setHashRate] = useState(0)
  const [totalHashes, setTotalHashes] = useState(0)
  const [bestDifficulty, setBestDifficulty] = useState(0)
  const [miningStartedTime, setMiningStartedTime] = useState(0)
  const [lastSubmissionTime, setLastSubmissionTime] = useState(0)
  const [miningTme, setMiningTme] = useState(0)
  const [lastSubmission, setLastSubmission] = useState<string | null>(null)
  const [serverMessage, setServerMessage] = useState<string | null>(null)

  const [workers, setWorkers] = useState<Worker[]>([])

  const startMining = async () => {
    if (!wallet.publicKey) {
      console.error('Wallet not connected')
      return
    }

    try {
      await signUpMiner(wallet.publicKey.toString())
      setIsMining(true)
      mine()
    } catch (error) {
      console.error('Failed to start mining:', error)
    }
  }

  const stopMining = () => {
    setIsMining(false)
    if (minerWs) {
      minerWs.close()
      setMinerWs(null)
    }
  }

  const mine = async () => {
    console.log('isMining', isMining)
    if (!wallet.publicKey) return

    if (minerWs) {
      minerWs.close()
      setMinerWs(null)
    }

    const ws = await getServerWS(wallet)

    setMinerWs(ws)

    ws.onmessage = async (event) => {
      if (event.data instanceof Blob) {
        const arrayBuffer = await event.data.arrayBuffer()
        const uint8Array = new Uint8Array(arrayBuffer)

        const messageType = uint8Array[0]

        switch (messageType) {
          case 0: // StartMining
            if (uint8Array.length < 49) {
              console.error('Invalid data for Message StartMining')
            } else {
              const challenge = uint8Array.slice(1, 33)
              const cutoff = new DataView(uint8Array.buffer).getBigUint64(33, true)
              const nonceStart = new DataView(uint8Array.buffer).getBigUint64(41, true)
              const nonceEnd = new DataView(uint8Array.buffer).getBigUint64(49, true)

              const startMiningMessage: ServerMessage = {
                type: 'StartMining',
                challenge,
                nonceRange: [nonceStart, nonceEnd],
                cutoff
              }

              handleServerMessage(startMiningMessage)
            }
            break

          case 1: // PoolSubmissionResult
            try {
              const resultData = JSON.parse(new TextDecoder().decode(uint8Array.slice(1)))
              const poolSubmissionResult: ServerMessagePoolSubmissionResult = {
                ...resultData,
                bestNonce: BigInt(resultData.bestNonce),
                challenge: new Uint8Array(resultData.challenge),
                coalDetails: {
                  ...resultData.coalDetails,
                  rewardDetails: {
                    ...resultData.coalDetails.rewardDetails,
                    minerSuppliedDifficulty: Number(resultData.coalDetails.rewardDetails.minerSuppliedDifficulty)
                  }
                },
                minerDetails: {
                  ...resultData.minerDetails,
                  guildAddress: new Uint8Array(resultData.minerDetails.guildAddress),
                  minerAddress: new Uint8Array(resultData.minerDetails.minerAddress)
                },
                oreDetails: {
                  ...resultData.oreDetails,
                  oreBoosts: []
                }
              }

              const poolSubmissionMessage: ServerMessage = {
                type: 'PoolSubmissionResult',
                data: poolSubmissionResult
              }

              handleServerMessage(poolSubmissionMessage)
            } catch (error) {
              console.error('Error parsing PoolSubmissionResult:', error)
            }
            break

          default:
            console.log('Failed to parse server message type')
        }
      } else {
        console.log('Received non-Blob message:', event.data)
      }
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    ws.onclose = (evt) => {
      console.log('Disconnected from mining server', evt)
      if (isMining) {
        mine() // Reconnect if still mining
      }
    }

    return () => {
      ws.close()
    }
  }

  const handleServerMessage = (message: ServerMessage) => {
    switch (message.type) {
      case 'StartMining':
        console.log('Received StartMining message:')
        console.log('Challenge:', Buffer.from(message.challenge).toString('hex'))
        console.log('Nonce Range:', message.nonceRange[0], '-', message.nonceRange[1])
        console.log('Cutoff:', message.cutoff)
        handleStartMining(message.challenge, message.nonceRange, Number(message.cutoff))
        break
      case 'PoolSubmissionResult':
        console.log('Received PoolSubmissionResult:')
        console.log('Difficulty:', message.data.difficulty)
        console.log('Best Nonce:', message.data.bestNonce)
        console.log('Active Miners:', message.data.activeMiners)
        // You can update state or perform other actions based on this data
        break
    }
  }

  const handleStartMining = (challenge: Uint8Array, [nonceRangeStart, nonceRangeEnd]: [bigint, bigint], cutoff: number) => {
    // Extract challenge (32 bytes), difficulty (8 bytes), and nonce range (16 bytes)

    console.log('Challenge:', challenge)
    console.log('nonceRange:', nonceRangeStart, ' - ', nonceRangeEnd)
    console.log('cutoff:', cutoff)

    const miningStartedTime = Date.now()
    let totalHashes = 0
    let bestDifficulty = 0

    setMiningStartedTime(miningStartedTime)
    setTotalHashes(totalHashes)
    setBestDifficulty(bestDifficulty)

    // handle mining loop
    console.log('mining loop')

    for (const worker of workers) {
      worker.terminate()
    }

    const numberOfWorkers = navigator.hardwareConcurrency
    const currentWorkers: Worker[] = []
    const noncesPerWorker = Math.ceil((Number(nonceRangeEnd) - Number(nonceRangeStart)) / numberOfWorkers)

    for (let i = 0; i < numberOfWorkers; i++) {
      const worker = new Worker('/worker/miningWorker.js', { name: 'miner_' + i })
      const workerNonceStart = BigInt(Number(nonceRangeStart) + i * noncesPerWorker)
      const workerNonceEnd = BigInt(Math.min(Number(workerNonceStart) + noncesPerWorker - 1, Number(nonceRangeEnd)))

      worker.postMessage({
        challenge,
        nonceStart: workerNonceStart,
        nonceEnd: workerNonceEnd,
        cutoff
      })

      worker.onmessage = (e: MessageEvent<MiningResult>) => {

        totalHashes += Number(e.data.total_hashes)

        setTotalHashes(totalHashes)

        if (e.data.best_difficulty > bestDifficulty) {
          bestDifficulty = e.data.best_difficulty
          setBestDifficulty(bestDifficulty)
        }

        const lastSubmissionTime = Date.now()

        setLastSubmissionTime(lastSubmissionTime)

        const miningTme = (lastSubmissionTime - miningStartedTime) / 1000

        setMiningTme(miningTme)

        if (miningTme > 0) {
          setHashRate(Math.round(totalHashes / miningTme))
        } else {
          setHashRate(0)
        }
      }

      currentWorkers.push(worker)
    }

    setWorkers(currentWorkers)

  }

  return (
    <div>
      <h1>Web Miner</h1>
      <button onClick={isMining ? stopMining : startMining}>
        {isMining ? 'Stop Mining' : 'Start Mining'}
      </button>
      <p>Mined for: {miningTme} s</p>
      <p>Hash Rate: {hashRate} H/s</p>
      <p>Total Hashes: {totalHashes}</p>
      <p>Best Difficulty: {bestDifficulty}</p>
    </div>
  )
}
