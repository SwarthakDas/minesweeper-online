"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

type LeaderboardEntry = {
  username: string
  moves: number
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])

  useEffect(() => {
    // Load leaderboard from localStorage
    const storedLeaderboard = localStorage.getItem("minesweeper-leaderboard")
    if (storedLeaderboard) {
      const parsedLeaderboard = JSON.parse(storedLeaderboard) as LeaderboardEntry[]
      // Sort by moves (ascending - fewer moves is better)
      const sortedLeaderboard = [...parsedLeaderboard].sort((a, b) => a.moves - b.moves)
      setLeaderboard(sortedLeaderboard)
    }
  }, [])

  const clearLeaderboard = () => {
    if (confirm("Are you sure you want to clear the leaderboard?")) {
      localStorage.removeItem("minesweeper-leaderboard")
      setLeaderboard([])
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center p-4 bg-gradient-to-b from-background to-muted">
      <div className="w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <Link href="/game" className="flex items-center text-muted-foreground hover:text-foreground">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Game
          </Link>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-3xl font-bold">Leaderboard</h1>
          <p className="mt-2 text-muted-foreground">Best players ranked by fewest moves</p>
        </motion.div>

        {leaderboard.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-lg shadow-lg overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Username
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Moves
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {leaderboard.map((entry, index) => (
                    <motion.tr
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                      className={index === 0 ? "bg-yellow-50 dark:bg-yellow-900/20" : ""}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {index === 0 && <span className="mr-2">🏆</span>}
                          {index === 1 && <span className="mr-2">🥈</span>}
                          {index === 2 && <span className="mr-2">🥉</span>}
                          <span className="font-medium">{index + 1}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium">{entry.username}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          {entry.moves} {entry.moves === 1 ? "move" : "moves"}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 bg-muted/20">
              <Button variant="outline" size="sm" onClick={clearLeaderboard} className="text-muted-foreground">
                Clear Leaderboard
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center p-12 bg-card rounded-lg shadow"
          >
            <p className="text-muted-foreground mb-4">No scores yet!</p>
            <Link href="/game">
              <Button>Play a Game</Button>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  )
}

