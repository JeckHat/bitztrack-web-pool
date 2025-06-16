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
          <TableHead>Worker</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Bitz Earned</TableHead>
          <TableHead>Hashpower</TableHead>
          <TableHead>Difficulty</TableHead>
          <TableHead>Bitz Total</TableHead>
          <TableHead>Pool Hashpower</TableHead>
          <TableHead>Pool Difficulty</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Object.entries(groupedData).sort(([a], [b]) => Number(b) - Number(a)).map(([challengeId, entries]) => {
          console.log("entries", entries)
          const isExpanded = expandedRows.includes(Number(challengeId))
          const totalCoal = formatLargeNumber(entries.reduce((sum, entry) => parseFloat(bigDecimal.add(sum, entry.minerAmount)), 0), COAL_TOKEN_DECIMALS)
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
                <TableCell>[{entries.length}]</TableCell>
                <TableCell>{latestDate.toLocaleString()}</TableCell>
                <TableCell>{totalCoal.toLocaleString()}</TableCell>
                <TableCell>{totalHashpower.toLocaleString()}</TableCell>
                <TableCell>{averageDifficulty.toFixed(2).toLocaleString()}</TableCell>
                <TableCell>{formatLargeNumber(entries[0].totalRewardsEarned, COAL_TOKEN_DECIMALS).toLocaleString()}</TableCell>
                <TableCell>{entries[0].bestChallengeHashpower.toLocaleString()}</TableCell>
                <TableCell>{entries[0].bestDifficulty.toLocaleString()}</TableCell>
              </TableRow>
              {isExpanded && entries.map((entry, index) => (
                <TableRow key={index}>
                  <TableCell></TableCell>
                  <TableCell>{entry.challengeId}</TableCell>
                  <TableCell>{entry.workerName}</TableCell>
                  <TableCell>{entry.createdAt.toLocaleString()}</TableCell>
                  <TableCell>{formatLargeNumber(entry.minerAmount, COAL_TOKEN_DECIMALS).toLocaleString()}</TableCell>
                  <TableCell>{entry.minerHashpower.toLocaleString()}</TableCell>
                  <TableCell>{entry.minerDifficulty.toLocaleString()}</TableCell>
                  <TableCell>{formatLargeNumber(entry.totalRewardsEarned, COAL_TOKEN_DECIMALS).toLocaleString()}</TableCell>
                  <TableCell>{entry.bestChallengeHashpower.toLocaleString()}</TableCell>
                  <TableCell>{entry.bestDifficulty.toLocaleString()}</TableCell>
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
