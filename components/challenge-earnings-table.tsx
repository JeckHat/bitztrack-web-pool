import React, { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { SubmissionEarningMinerInfo } from '@/pages/api/apiDataTypes'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronRight } from 'lucide-react'
import bigDecimal from 'js-big-decimal'
import { COAL_TOKEN_DECIMALS } from '../lib/constants'

interface ChallengeEarningsTableProps {
  data: SubmissionEarningMinerInfo[]
}

const ChallengeEarningsTable: React.FC<ChallengeEarningsTableProps> = ({ data }) => {
  const [expandedRows, setExpandedRows] = useState<number[]>([])

  const toggleRow = (challengeId: number) => {
    setExpandedRows(prev =>
      prev.includes(challengeId) ? prev.filter(id => id !== challengeId) : [...prev, challengeId]
    )
  }

  const groupedData = data.reduce((acc, item) => {
    if (!acc[item.challengeId]) {
      acc[item.challengeId] = []
    }
    acc[item.challengeId].push(item)
    return acc
  }, {} as Record<number, SubmissionEarningMinerInfo[]>)

  function formatLargeNumber (num: number, decimalPlaces: number): string {
    const divisor = new bigDecimal('1' + '0'.repeat(decimalPlaces))
    const bigNum = new bigDecimal(num.toString())
    const result = bigNum.divide(divisor, decimalPlaces)
    return result.getValue()
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead></TableHead>
          <TableHead>Challenge ID</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Coal Earned</TableHead>
          <TableHead>Ore Earned</TableHead>
          <TableHead>Hashpower</TableHead>
          <TableHead>Difficulty</TableHead>
          <TableHead>Coal Total</TableHead>
          <TableHead>Ore Total</TableHead>
          <TableHead>Pool Hashpower</TableHead>
          <TableHead>Pool Difficulty</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Object.entries(groupedData).sort(([a], [b]) => Number(b) - Number(a)).map(([challengeId, entries]) => {
          const isExpanded = expandedRows.includes(Number(challengeId))
          const totalCoal = formatLargeNumber(entries.reduce((sum, entry) => parseFloat(bigDecimal.add(sum, entry.minerAmountCoal)), 0), COAL_TOKEN_DECIMALS)
          const totalOre = formatLargeNumber(entries.reduce((sum, entry) => parseFloat(bigDecimal.add(sum, entry.minerAmountOre)), 0), COAL_TOKEN_DECIMALS)
          const totalHashpower = entries.reduce((sum, entry) => parseFloat(bigDecimal.add(sum, entry.minerHashpower)), 0)
          const averageDifficulty = entries.reduce((sum, entry) => parseFloat(bigDecimal.add(sum, entry.minerDifficulty)), 0) / entries.length
          const latestDate = new Date(Math.max(...entries.map(entry => entry.createdAt.getTime())))

          return (
            <React.Fragment key={challengeId}>
              <TableRow>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => toggleRow(Number(challengeId))}>
                    {isExpanded ? <ChevronDown/> : <ChevronRight/>}
                  </Button>
                </TableCell>
                <TableCell>{challengeId}</TableCell>
                <TableCell>{latestDate.toLocaleString()}</TableCell>
                <TableCell>{totalCoal}</TableCell>
                <TableCell>{totalOre}</TableCell>
                <TableCell>{totalHashpower}</TableCell>
                <TableCell>{averageDifficulty.toFixed(2)}</TableCell>
                <TableCell>{formatLargeNumber(entries[0].totalRewardsEarnedCoal, COAL_TOKEN_DECIMALS)}</TableCell>
                <TableCell>{formatLargeNumber(entries[0].totalRewardsEarnedOre, COAL_TOKEN_DECIMALS)}</TableCell>
                <TableCell>{entries[0].bestChallengeHashpower}</TableCell>
                <TableCell>{entries[0].bestDifficulty}</TableCell>
              </TableRow>
              {isExpanded && entries.map((entry, index) => (
                <TableRow key={index}>
                  <TableCell></TableCell>
                  <TableCell>{entry.challengeId}</TableCell>
                  <TableCell>{entry.createdAt.toLocaleString()}</TableCell>
                  <TableCell>{formatLargeNumber(entry.minerAmountCoal, COAL_TOKEN_DECIMALS)}</TableCell>
                  <TableCell>{formatLargeNumber(entry.minerAmountOre, COAL_TOKEN_DECIMALS)}</TableCell>
                  <TableCell>{entry.minerHashpower}</TableCell>
                  <TableCell>{entry.minerDifficulty}</TableCell>
                  <TableCell>{formatLargeNumber(entry.totalRewardsEarnedCoal, COAL_TOKEN_DECIMALS)}</TableCell>
                  <TableCell>{formatLargeNumber(entry.totalRewardsEarnedOre, COAL_TOKEN_DECIMALS)}</TableCell>
                  <TableCell>{entry.bestChallengeHashpower}</TableCell>
                  <TableCell>{entry.bestDifficulty}</TableCell>
                </TableRow>
              ))}
            </React.Fragment>
          )
        })}
      </TableBody>
    </Table>
  )
}

export default ChallengeEarningsTable
