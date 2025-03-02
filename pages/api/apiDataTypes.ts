export type BalanceData = { balance: { value: { amount: string, decimals: number } } }
export type ErrorMessage = { error: string }
export type BlockhashData = { latestBlockhash: { blockhash: string, lastValidBlockHeight: number } }
export type StakeAndMultipliers = {
  coal_multiplier: number,
  coal_stake: number,
  guild_multiplier: number,
  guild_stake: number,
  tool_multiplier: number,
  ore_stake: number,
}
export type StakeAndMultipliersString = {
  coal_multiplier: string,
  coal_stake: string,
  guild_multiplier: string,
  guild_stake: string,
  tool_multiplier: string,
  total_coal_multiplier: string,
  ore_stake: string,
}

export type Submission = {
  nonce: number,
  difficulty: number,
  created_at: string,
}

export type SubmissionWithDate = {
  nonce: number,
  difficulty: number,
  created_at: Date,
}

export type ReprocessInfo = {
  last_reprocess: string,
  next_reprocess: string,
}

export type ReprocessInfoWithDate = {
  last_reprocess: Date,
  next_reprocess: Date,
}

export type FullMinerBalance = {
  sol: number,
  coal: number,
  ore: number,
  chromium: number,
  ingot: number,
  wood: number,
}

export type FullMinerBalanceString = {
  sol: string,
  coal: string,
  ore: string,
  chromium: string,
  ingot: string,
  wood: string,
}

export type DiamondHandsMultiplier = {
  lastClaim: Date | null,
  multiplier: number
}

export type AvgGuildRewards = {
  last_24h: string,
  last_7d: string,
  last_30d: string
}

export type SubmissionEarningMinerInfoApi = {
  miner_id: number,
  challenge_id: number,
  pubkey: string,
  miner_amount_coal: number,
  miner_amount_ore: number,
  best_difficulty: number,
  miner_difficulty: number,
  best_challenge_hashpower: number,
  miner_hashpower: number,
  created_at: string,
  total_rewards_earned_coal: number,
  total_rewards_earned_ore: number
}

export type SubmissionEarningMinerInfo = {
  minerId: number,
  challengeId: number,
  pubkey: string,
  minerAmountCoal: number,
  minerAmountOre: number,
  bestDifficulty: number,
  minerDifficulty: number,
  bestChallengeHashpower: number,
  minerHashpower: number,
  createdAt: Date,
  totalRewardsEarnedCoal: number,
  totalRewardsEarnedOre: number
}

export type ChallengeWithDifficulty = {
  id: number,
  difficulty: number,
  challenge_hashpower: number,
  rewards_earned_coal: number,
  rewards_earned_ore: number,
  created_at: Date
}
