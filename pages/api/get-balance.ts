import type { NextApiRequest, NextApiResponse } from 'next'
import { Connection, PublicKey } from '@solana/web3.js'
import { BalanceData, ErrorMessage } from './apiDataTypes'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<BalanceData | ErrorMessage>
) {
  const RPC_URL = process.env.RPC_URL ?? '';
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { tokenAccount } = req.body;

  if (!tokenAccount || typeof tokenAccount !== 'string') {
    return res.status(400).json({ error: 'Token account is required and must be a string' });
  }

  try {
    const connection = new Connection(RPC_URL, 'confirmed');
    const balance = await connection.getTokenAccountBalance(new PublicKey(tokenAccount));
    res.status(200).json({ balance });
  } catch (error) {
    console.error('Error fetching token balance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
