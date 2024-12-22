// let wasmModule

let isInitialized = false
let wasm

async function initWasm () {
  if (!isInitialized) {
    wasm = await import('../wasm/standalone_miner.js')
    await wasm.default()
    isInitialized = true
  }
}

// Listen for messages from the main thread
self.addEventListener('message', async (event) => {
  const data = event.data
  await initWasm() // Ensure the WASM module is initialized

  const { challenge, nonceStart, nonceEnd, cutoff } = data

  // Call the WASM function
  const result = wasm.start_mining(challenge,
    nonceStart,
    nonceEnd,
    cutoff
  )

  // Post the result back to the main thread
  self.postMessage({
    best_difficulty: result.best_difficulty,
    best_nonce: result.best_nonce,
    total_hashes: result.total_hashes
  })
})
