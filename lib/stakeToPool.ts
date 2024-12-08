import { Transaction } from '@solana/web3.js'
import { createTransferInstruction, getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { COAL_MINT_ADDRESS, COAL_TOKEN_DECIMALS, POOL_SERVER } from './constants' // Ensure you have this constant defined
import axios from 'axios'
import { WalletContextState } from '@solana/wallet-adapter-react'
import {
  getFeePayerPubkey,
  getLatestBlockhash,
  getPoolAuthorityPubkey,
  getTokenBalance,
  signUpMiner
} from './poolUtils'

export async function stakeToPool(
  amount: number,
  wallet: WalletContextState,
) {
  if(!wallet) throw new Error('User wallet is not available');
  // 1. Check balance and adjust stake amount if necessary
  const userPublicKey = wallet.publicKey;
  if(!userPublicKey) throw new Error('User public key is not available');
  const balance = await getTokenBalance(userPublicKey, COAL_MINT_ADDRESS);

  const stakeAmount = amount > balance ? balance : amount;

  // 3. Get fee payer and pool authority public keys
  const feePayerPubkey = await getFeePayerPubkey();
  const poolPubkey = await getPoolAuthorityPubkey();

  // 4. Sign up miner to the pool if needed
  await signUpMiner(userPublicKey.toString());

  // 5. Calculate stake amount in lamports
  const stakeAmountLamports = Math.floor(stakeAmount * Math.pow(10, COAL_TOKEN_DECIMALS));

  // 6. Create transfer instruction
  const userTokenAccount = await getAssociatedTokenAddress(COAL_MINT_ADDRESS, userPublicKey);
  const poolTokenAccount = await getAssociatedTokenAddress(COAL_MINT_ADDRESS, poolPubkey);


  const transferInstruction = createTransferInstruction(
    userTokenAccount,
    poolTokenAccount,
    userPublicKey,
    stakeAmountLamports,
    [],
    TOKEN_PROGRAM_ID
  );

  // 7. Create and sign transaction
  const latestBlockhash = await getLatestBlockhash();
  if(!latestBlockhash) throw new Error('Failed to get latest block');
  const transaction = new Transaction().add(transferInstruction);
  transaction.recentBlockhash = latestBlockhash.blockhash;
  transaction.feePayer = feePayerPubkey;

  if (!wallet.signTransaction) {
    throw new Error('Wallet does not support transaction signing');
  }

   const signedTransaction = await wallet.signTransaction(transaction);

  // 8. Send transaction to server for completion and execution
  const serializedTransaction = signedTransaction.serialize({requireAllSignatures: false});
  const encodedTransaction = Buffer.from(serializedTransaction).toString('base64');

  const response = await axios.post(
    `${POOL_SERVER}/coal/stake?pubkey=${userPublicKey.toString()}&amount=${stakeAmountLamports}`,
    encodedTransaction
  );

  if (response.data === 'SUCCESS') {
    console.log('Successfully staked to pool! The staked COAL got added to your total balance');
  } else {
    console.log('Transaction failed:', response.data);
  }
}
