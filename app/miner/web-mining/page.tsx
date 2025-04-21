'use client'

import React, { useEffect, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import {
  deserializeServerMessagePoolSubmissionResult,
  getServerWS,
  MiningResult,
  ServerMessage,
} from '../../../lib/mine'
import { getMinerRewardsNumeric, signUpMiner } from '../../../lib/poolUtils'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { COAL_TOKEN_DECIMALS } from '../../../lib/constants'
import Link from 'next/link'

let minerWs: WebSocket | null = null
let workers: Worker[] = []
let workerDone = 0
let bestMiningResult: MiningResult | null = null
let totalHashes: number = 0
let bestDifficulty: number = 0
let numberOfWorkers: number = 0
let miningStartedTime: number = 0
let isMining = false

export default function WebMiner () {

  const wallet = useWallet()

  const [viewIsMining, setViewIsMining] = useState(false)
  const [hashRate, setHashRate] = useState(0)
  const [viewTotalHashes, setViewTotalHashes] = useState(0)
  const [viewBestDifficulty, setViewBestDifficulty] = useState(0)
  const [viewMiningStartedTime, setViewMiningStartedTime] = useState(0)
  const [lastSubmissionTime, setLastSubmissionTime] = useState(0)
  const [timeFromLastSubmission, setTimeFromLastSubmission] = useState(0)
  const [coalLastSubmission, setCoalLastSubmission] = useState(0)
  const [oreLastSubmission, setOreLastSubmission] = useState(0)
  const [coalTotal, setCoalTotal] = useState(0)
  const [oreTotal, setOreTotal] = useState(0)
  const [chromiumTotal, setChromiumTotal] = useState(0)
  const [serverMessage, setServerMessage] = useState<string[]>([])
  const [threadCount, setThreadCount] = useState(0
  )
  const [maxThread, setMaxThread] = useState(0)

  useEffect(() => {
    // console.log('hardwareConcurrency', window.navigator.hardwareConcurrency)
    setMaxThread(window.navigator.hardwareConcurrency - 1)
    setThreadCount(window.navigator.hardwareConcurrency - 1)
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isMining) {
      interval = setInterval(() => {
        setTimeFromLastSubmission(prevTime => prevTime + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [lastSubmissionTime])

  const setupWorkers = () => {
    if (!isMining) return
    if (!wallet.publicKey) {
      return
    }
    numberOfWorkers = threadCount
    // console.log('setup workers', numberOfWorkers)

    for (const worker of workers) {
      worker.postMessage({ type: 'Dispose' })
      worker.terminate()
    }
    workers = []

    workerDone = 0

    for (let i = 0; i < numberOfWorkers; i++) {
      const worker = new Worker('/worker/miningWorker.js', { name: 'miner_' + i })
      worker.postMessage({ type: 'Init' })
      worker.onmessage = async (e: MessageEvent<MiningResult>) => {

        totalHashes = totalHashes + Number(e.data.total_hashes)

        if (e.data.best_difficulty > bestDifficulty) {
          bestDifficulty = e.data.best_difficulty
        }

        if (!bestMiningResult || e.data.best_difficulty > bestMiningResult.best_difficulty) {
          bestMiningResult = e.data
        }

        workerDone = workerDone + 1

        // console.log('worker done', workerDone)

        if (workerDone >= numberOfWorkers) {
          // console.log('bestMiningResult', bestMiningResult)

          if (bestMiningResult) {
            await sendSubmission(bestMiningResult)
          }
          finishMining()
        }
      }

      workers.push(worker)
    }
  }

  const startMining = async () => {
    if (!wallet.publicKey) {
      console.error('Wallet not connected')
      return
    }

    try {
      await signUpMiner(wallet.publicKey.toString())
      setupUserTotals()
      isMining = true
      setViewIsMining(true)
      setupWorkers()
      mine()
    } catch (error) {
      console.error('Failed to start mining:', error)
    }
  }

  const stopMining = () => {
    // console.log('Stopping mining', minerWs)
    isMining = false
    setViewIsMining(false)
    if (minerWs) {
      minerWs.close()
      minerWs = null
    }
    workers.forEach(worker => {
      worker.terminate()
    })
    workers = []
  }

  const mine = async () => {
    // console.log('isMining', isMining)
    if (!isMining) return
    if (!wallet.publicKey) return

    if (minerWs) {
      //  console.log('Already mining, closing existing connection')
      minerWs.close()
      minerWs = null
    }

    const ws = await getServerWS(wallet)

    minerWs = ws

    // console.log('Connected to mining server')

    ws.onmessage = async (event) => {
      if (event.data instanceof Blob) {
        const arrayBuffer = await event.data.arrayBuffer()
        const uint8Array = new Uint8Array(arrayBuffer)

        const messageType = uint8Array[0]

        // console.log('messageType -->', messageType)

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

              // console.log('poolSubmissionResult', poolSubmissionResult)

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
          // console.log('Failed to parse server message type')
        }
      } else {
        // console.log('Received non-Blob message:', event.data)
        setServerMessage([event.data])
      }
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      if (isMining) {
        mine() // Reconnect if still mining
      }
    }

    ws.onclose = () => {
      // console.log('Disconnected from mining server', evt)
      if (isMining) {
        mine() // Reconnect if still mining
      }
    }

    return () => {
      ws.close()
    }
  }

  const setupUserTotals = async () => {
    if (!wallet.publicKey) return
    const rewards = await getMinerRewardsNumeric(wallet.publicKey.toString())
    setCoalTotal(rewards.coal)
    setOreTotal(rewards.ore)
    setChromiumTotal(rewards.chromium)
  }

  const handleServerMessage = async (message: ServerMessage) => {
    switch (message.type) {
      case 'StartMining':
        // console.log('Received StartMining message:')
        // console.log('Challenge:', Buffer.from(message.challenge).toString('hex'))
        // console.log('Nonce Range:', message.nonceRange[0], '-', message.nonceRange[1])
        // console.log('Cutoff:', message.cutoff)
        handleStartMining(message.challenge, message.nonceRange, Number(message.cutoff) - 1)
        break
      case 'PoolSubmissionResult':
        // console.log('Received PoolSubmissionResult:')
        // console.log('Difficulty:', message.data.difficulty)
        // console.log('Best Nonce:', message.data.bestNonce)
        // console.log('Active Miners:', message.data.activeMiners)
        setServerMessage([`Active Miners: ${message.data.activeMiners}`, `Pool Difficulty: ${message.data.difficulty}`])
        setOreLastSubmission(message.data.oreDetails.rewardDetails.minerEarnedRewards)
        setCoalLastSubmission(message.data.coalDetails.rewardDetails.minerEarnedRewards)
        setupUserTotals()
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

      /*console.log('Submission sent:', {
        nonce: threadSubmission.nonce,
        difficulty: threadSubmission.difficulty,
        digest: Array.from(threadSubmission.d).map(b => b.toString(16).padStart(2, '0')).join('')
      })*/

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

      // console.log('Reset message sent to server')

      // Reset local state
      /*setTotalHashes(0);
      setBestDifficulty(0);
      setHashRate(0);
      setMiningTme(0);
      setLastSubmission(null);
      setServerMessage(null);*/

      // Terminate all workers
      /*workers.forEach(worker => {
        worker.postMessage({ type: 'Dispose' })
        worker.terminate()
      })
      workers = []*/

    } catch (error) {
      console.error('Failed to send Reset message:', error)
    }
  }

  const finishMining = async () => {
    const _lastSubmissionTime = Date.now()
    setTimeFromLastSubmission(0)
    setLastSubmissionTime(_lastSubmissionTime)

    const miningTme = (_lastSubmissionTime - miningStartedTime) / 1000

    // console.log('totalHashes', totalHashes, miningTme)

    if (miningTme > 0) {
      setHashRate(Math.round(totalHashes / miningTme))
    } else {
      setHashRate(0)
    }

    setViewTotalHashes(totalHashes)
    setViewBestDifficulty(bestDifficulty)

    totalHashes = 0
    bestDifficulty = 0

    // console.log('finish mining')
    // Reset the mining system (you might need to implement this separately)
    await resetMiningSystem()
    // Sleep for a buffer time (commented out in the Rust code)
    // await new Promise(resolve => setTimeout(resolve, (5 + args.buffer) * 1000));

    // Prepare the ready message
    const now = Math.floor(Date.now() / 1000)
    const msg = new Uint8Array(new BigUint64Array([BigInt(now)]).buffer)

    setupWorkers()

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

    // console.log('Challenge:', challenge)
    // console.log('nonceRange:', nonceRangeStart, ' - ', nonceRangeEnd)
    // console.log('cutoff:', cutoff)

    workerDone = 0
    bestMiningResult = null
    miningStartedTime = Date.now()
    setViewMiningStartedTime(miningStartedTime)
    // setMiningTime(0)
    // setCutoffTime(cutoff)
    // setTotalHashes(totalHashes)
    // setBestDifficulty(bestDifficulty)

    // handle mining loop
    // console.log('mining loop')

    /*for (const worker of workers) {
      worker.postMessage({ type: 'Dispose' })
      worker.terminate()
    }*/

    // workers = []
    const noncesPerWorker = Math.ceil((Number(nonceRangeEnd) - Number(nonceRangeStart)) / numberOfWorkers)

    for (let i = 0; i < workers.length; i++) {
      // console.log('workers[i]', workers[i])
      const workerNonceStart = BigInt(Number(nonceRangeStart) + i * noncesPerWorker)
      const workerNonceEnd = BigInt(Math.min(Number(workerNonceStart) + noncesPerWorker - 1, Number(nonceRangeEnd)))

      workers[i].postMessage({
        type: 'StartMining',
        challenge,
        nonceStart: workerNonceStart,
        nonceEnd: workerNonceEnd,
        cutoff
      })

    }

  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Web Miner</h1>
      <div className="text-center mb-6">
        <p className="text-lg leading-relaxed">
          Just connect a wallet and start to mine with the pool!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Mining Control</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center items-center mb-4">
              {viewIsMining ? (
                <div className="relative w-16 h-16 mining-animation">
                  <img
                    src="/images/excalivator-logo-small-no-bg.png"
                    alt="Mining Animation"
                    className="object-contain"
                  />
                </div>
              ) : (
                <div className="w-16 h-16">
                  <img
                    src="/images/excalivator-logo-small-no-bg.png"
                    alt="Mining Logo"
                    className="object-contain"
                  />
                </div>
              )}
            </div>
            <div className="flex justify-center space-x-4">
              <Button onClick={startMining} disabled={viewIsMining || !wallet.publicKey}>
                Start Mining
              </Button>
              <Button onClick={stopMining} disabled={!viewIsMining}>
                Stop Mining
              </Button>
            </div>
            <div className="flex justify-center items-center space-x-2 mt-4">
              <label htmlFor="threadCount" className="text-sm font-medium">
                Threads:
              </label>
              <input
                id="threadCount"
                type="number"
                min="1"
                max={maxThread}
                value={threadCount}
                disabled={isMining}
                onChange={(e) => setThreadCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 px-2 py-1 text-sm border rounded"
              />
            </div>
            <div className="flex justify-center mt-4">
              <p>Last mining started
                at {viewMiningStartedTime ? new Date(viewMiningStartedTime).toLocaleString() : 'N/A'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mining Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Status:</strong> {viewIsMining ? 'Mining' : 'Idle'}</p>
              <p><strong>Hash Rate:</strong> {hashRate.toLocaleString()} H/s</p>
              <p><strong>Total Hashes:</strong> {viewTotalHashes.toLocaleString()}</p>
              <p><strong>Best Difficulty:</strong> {viewBestDifficulty}</p>
              <p><strong>Total COAL:</strong> {coalTotal.toFixed(COAL_TOKEN_DECIMALS)}</p>
              <p><strong>Total ORE:</strong> {oreTotal.toFixed(COAL_TOKEN_DECIMALS)}</p>
              <p><strong>Total CHROMIUM:</strong> {chromiumTotal.toFixed(COAL_TOKEN_DECIMALS)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Last Submission</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{lastSubmissionTime ? (new Date(lastSubmissionTime)).toLocaleString() : 'No submission yet'}</p>
            {timeFromLastSubmission > 0 && (
              <div className="flex flex-col">
                <p className="mt-2">
                  <strong>Time since last submission:</strong>{' '}
                  {timeFromLastSubmission}s ago
                </p>
                <p className="mt-2">
                  <strong>COAL:</strong>{' '}
                  {coalLastSubmission.toFixed(COAL_TOKEN_DECIMALS)}
                </p>
                <p className="mt-2">
                  <strong>ORE:</strong>{' '}
                  {oreLastSubmission.toFixed(COAL_TOKEN_DECIMALS)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Server Message</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{serverMessage.length > 0 ? serverMessage.join('\n') : 'No messages from server'}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Info</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside">
            <li>The maximum amount of usable cores is the total one minus one</li>
            <li><strong>0 transactions fees</strong> are required to mine</li>
            <li>The web miner <strong>is not</strong> the most optimized way to mine the pool</li>
            <li>To get the best results check out the <Link href="/getting-started/quick-start"
                                                            target="_blank"
                                                            className="underline text-blue-500 hover:text-blue-700">
              Software Installation guide
            </Link> with the <Link href="/getting-started/quick-start"
                                   target="_blank"
                                   className="underline text-blue-500 hover:text-blue-700">
              Orion Client
            </Link></li>
            <li>The browser may throttled this page if left in the background</li>
          </ul>
        </CardContent>
      </Card>

      {/*<Card className="mt-6">
        <CardHeader>
          <CardTitle>Mining Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={(miningTime * cutoffTime) / 100} className="w-full"/>
          <p className="text-center mt-2">
            {miningTime % 60}s
          </p>
        </CardContent>
      </Card>*/}
    </div>
  )
}
