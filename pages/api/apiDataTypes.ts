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
  ore_stake: string,
}

export type MinerBalance = {
  coal: number,
  ore: number,
  chromium: number,
}

export type MinerBalanceString = {
  coal: string,
  ore: string,
  chromium: string,
}
