'use client'

import React, { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import {
  deserializeServerMessagePoolSubmissionResult,
  getServerWS,
  MiningResult,
  ServerMessage,
} from '../../../lib/mine'
import { signUpMiner } from '../../../lib/poolUtils'

let minerWs: WebSocket | null = null
let workers: Worker[] = []

export default function WebMiner () {
  const wallet = useWallet()

  const [isMining, setIsMining] = useState(false)
  const [hashRate, setHashRate] = useState(0)
  const [totalHashes, setTotalHashes] = useState(0)
  const [bestDifficulty, setBestDifficulty] = useState(0)
  const [miningStartedTime, setMiningStartedTime] = useState(0)
  const [lastSubmissionTime, setLastSubmissionTime] = useState(0)
  const [miningTme, setMiningTme] = useState(0)
  const [lastSubmission, setLastSubmission] = useState<string | null>(null)
  const [serverMessage, setServerMessage] = useState<string | null>(null)

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
    console.log('Stopping mining')
    setIsMining(false)
    if (minerWs) {
      minerWs.close()
      minerWs = null
    }
    workers.forEach(worker => {
      worker.postMessage({ type: 'Dispose' })
      worker.terminate()
    })
    workers = []
  }

  const mine = async () => {
    console.log('isMining', isMining)
    if (!wallet.publicKey) return

    if (minerWs) {
      console.log('Already mining, closing existing connection')
      minerWs.close()
      minerWs = null
    }

    const ws = await getServerWS(wallet)

    minerWs = ws

    console.log('Connected to mining server')

    ws.onmessage = async (event) => {
      if (event.data instanceof Blob) {
        const arrayBuffer = await event.data.arrayBuffer()
        const uint8Array = new Uint8Array(arrayBuffer)

        const messageType = uint8Array[0]

        console.log('messageType -->', messageType)

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
              const dataView = new DataView(uint8Array.buffer, 1) // Skip the first byte (message type)
              const poolSubmissionResult = deserializeServerMessagePoolSubmissionResult(dataView, 0)

              console.log('poolSubmissionResult', poolSubmissionResult)

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
        handleStartMining(message.challenge, message.nonceRange, Number(message.cutoff) - 1)
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

  const sendSubmission = async (data: MiningResult) => {
    if (!minerWs || minerWs.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not open')
      return
    }

    if (!wallet.publicKey) {
      console.error('Wallet is not connected')
      return
    }

    try {
      // Create a ThreadSubmission-like structure
      const threadSubmission = {
        nonce: data.best_nonce,
        difficulty: data.best_difficulty,
        d: data.best_d
      }

      // Prepare the message
      const messageType = new Uint8Array([2]) // 2 for BestSolution Message
      const bestDigestArray = threadSubmission.d // 16 bytes
      const bestNonceBin = new Uint8Array(new BigUint64Array([BigInt(threadSubmission.nonce)]).buffer) // 8 bytes
      const publicKeyBytes = wallet.publicKey.toBytes() // 32 bytes

      // Prepare the final binary message
      const binData = new Uint8Array(57)
      binData.set(messageType, 0)
      binData.set(bestDigestArray, 1)
      binData.set(bestNonceBin, 17)
      binData.set(publicKeyBytes, 25)

      // Send the binary message
      minerWs.send(binData)

      console.log('Submission sent:', {
        nonce: threadSubmission.nonce,
        difficulty: threadSubmission.difficulty,
        digest: Array.from(threadSubmission.d).map(b => b.toString(16).padStart(2, '0')).join('')
      })

    } catch (error) {
      console.error('Failed to send submission:', error)
    }
  }

  const resetMiningSystem = async () => {
    if (!minerWs || minerWs.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not open')
      return
    }

    try {
      // Create a Uint8Array with a single byte representing the Reset message
      const resetMessage = new Uint8Array([1]) // 1 represents Reset in the enum

      // Send the reset message through WebSocket
      minerWs.send(resetMessage)

      console.log('Reset message sent to server')

      // Reset local state
      /*setTotalHashes(0);
      setBestDifficulty(0);
      setHashRate(0);
      setMiningTme(0);
      setLastSubmission(null);
      setServerMessage(null);*/

      // Terminate all workers
      workers.forEach(worker => {
        worker.postMessage({ type: 'Dispose' })
        worker.terminate()
      })
      workers = []

    } catch (error) {
      console.error('Failed to send Reset message:', error)
    }
  }

  const finishMining = async () => {
    // Reset the mining system (you might need to implement this separately)
    await resetMiningSystem()
    // Sleep for a buffer time (commented out in the Rust code)
    // await new Promise(resolve => setTimeout(resolve, (5 + args.buffer) * 1000));

    // Prepare the ready message
    const now = Math.floor(Date.now() / 1000)
    const msg = new Uint8Array(new BigUint64Array([BigInt(now)]).buffer)

    if (!wallet.signMessage) {
      console.error('Wallet doesn\'t support message signing')
      return
    }

    try {

      const binData = new Uint8Array(1 + 32 + 8)
      binData[0] = 0 // Message type
      binData.set(wallet.publicKey!.toBytes(), 1) // Public key
      binData.set(msg, 33) // Timestamp

      // Send the binary data through WebSocket
      if (minerWs && minerWs.readyState === WebSocket.OPEN) {
        minerWs.send(binData)
      } else {
        console.error('WebSocket is not open')
      }
    } catch (error) {
      console.error('Failed to send Ready message:', error)
      // Implement finish logic here if needed
      // finishMining();
    }
  }

  const handleStartMining = (challenge: Uint8Array, [nonceRangeStart, nonceRangeEnd]: [bigint, bigint], cutoff: number) => {
    // Extract challenge (32 bytes), difficulty (8 bytes), and nonce range (16 bytes)

    console.log('Challenge:', challenge)
    console.log('nonceRange:', nonceRangeStart, ' - ', nonceRangeEnd)
    console.log('cutoff:', cutoff)

    let bestMiningResult: MiningResult | undefined = undefined

    const miningStartedTime = Date.now()
    let totalHashes = 0
    let bestDifficulty = 0
    let workerDone = 0

    setMiningStartedTime(miningStartedTime)
    // setTotalHashes(totalHashes)
    // setBestDifficulty(bestDifficulty)

    // handle mining loop
    console.log('mining loop')

    for (const worker of workers) {
      worker.postMessage({ type: 'Dispose' })
      worker.terminate()
    }

    const numberOfWorkers = navigator.hardwareConcurrency
    workers = []
    const noncesPerWorker = Math.ceil((Number(nonceRangeEnd) - Number(nonceRangeStart)) / numberOfWorkers)

    for (let i = 0; i < numberOfWorkers; i++) {
      const worker = new Worker('/worker/miningWorker.js', { name: 'miner_' + i })
      const workerNonceStart = BigInt(Number(nonceRangeStart) + i * noncesPerWorker)
      const workerNonceEnd = BigInt(Math.min(Number(workerNonceStart) + noncesPerWorker - 1, Number(nonceRangeEnd)))

      worker.postMessage({
        type: 'StartMining',
        challenge,
        nonceStart: workerNonceStart,
        nonceEnd: workerNonceEnd,
        cutoff
      })

      worker.onmessage = async (e: MessageEvent<MiningResult>) => {

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

        console.log('e.data', e.data)

        if (!bestMiningResult || e.data.best_difficulty > bestMiningResult.best_difficulty) {
          bestMiningResult = e.data
        }

        workerDone++
        if (workerDone >= numberOfWorkers) {
          console.log('bestMiningResult', bestMiningResult)

          if (bestMiningResult) {
            await sendSubmission(bestMiningResult)
          }
          finishMining()
        }
      }

      workers.push(worker)
    }

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
      <p>Last Submission: {lastSubmissionTime ? new Date(lastSubmissionTime).toLocaleString() : 'N/A'}</p>
      <p>Mine started at: {miningStartedTime ? new Date(miningStartedTime).toLocaleString() : 'N/A'}</p>
    </div>
  )
}
