// Listen for messages from the main thread
self.addEventListener('message', async (event) => {
  const data = event.data
  if (data.type === 'StartMining') {
    const wasmInstance = (await import('/wasm/standalone_miner.js'))
    await wasmInstance.default()
    const { challenge, nonceStart, nonceEnd, cutoff } = data

    // Call the WASM function
    const result = wasmInstance.start_mining(challenge,
      nonceStart,
      nonceEnd,
      cutoff
    )

    // Post the result back to the main thread
    self.postMessage({
      best_difficulty: result.best_difficulty,
      best_nonce: result.best_nonce,
      best_d: result.best_d,
      total_hashes: result.total_hashes
    })

  }
})
