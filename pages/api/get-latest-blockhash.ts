import type { NextApiRequest, NextApiResponse } from 'next'
import { Connection } from '@solana/web3.js'
import { BlockhashData, ErrorMessage } from './apiDataTypes'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<BlockhashData | ErrorMessage>
) {
  const RPC_URL = process.env.RPC_URL ?? '';
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const connection = new Connection(RPC_URL, 'confirmed');
    const latestBlockhash = await connection.getLatestBlockhash();
    res.status(200).json({ latestBlockhash });
  } catch (error) {
    console.error('Error fetching latest blockhash:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
