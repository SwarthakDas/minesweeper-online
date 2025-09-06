/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Socket, io } from "socket.io-client";

interface LeaderboardEntry {
  user: string;
  totalMoves: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  averageMoves: number;
}

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedUsername = localStorage.getItem("minesweeper_username");
    
    // Connect to socket for real-time leaderboard updates
    socketRef.current = io("http://localhost:3000", {
      query: { username: storedUsername || "guest" }
    });

    const socket = socketRef.current;

    socket.on("connect", () => {
      setIsConnected(true);
      console.log("Connected to server");
      // Request leaderboard data
      socket.emit("get-leaderboard");
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      console.log("Disconnected from server");
    });

    socket.on("leaderboard", (data: any[]) => {
      console.log("Received leaderboard");
      
      const formattedLeaderboard = data.map((entry: any) => ({
        user: entry.user,
        totalMoves: entry.totalMoves,
        gamesPlayed: entry.gamesPlayed,
        wins: entry.wins,
        losses: entry.losses,
        averageMoves: entry.gamesPlayed > 0 ? Math.round(entry.totalMoves / entry.gamesPlayed * 100) / 100 : 0
      }));

      setLeaderboard(formattedLeaderboard);
      setLoading(false);
      toast.success("Leaderboard updated!");
    });

    socket.on("error", ({ message }: { message: string }) => {
      toast.error(message);
      setLoading(false);
    });

    // Cleanup
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const refreshLeaderboard = () => {
    if (socketRef.current && isConnected) {
      setLoading(true);
      socketRef.current.emit("get-leaderboard");
      toast.info("Refreshing leaderboard...");
    } else {
      toast.error("Not connected to server");
    }
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return "🥇";
      case 1: return "🥈";
      case 2: return "🥉";
      default: return `#${index + 1}`;
    }
  };

  const getWinRate = (wins: number, gamesPlayed: number) => {
    if (gamesPlayed === 0) return "0%";
    return `${Math.round((wins / gamesPlayed) * 100)}%`;
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-blue-50 to-blue-100 p-4">
      <div className="w-full max-w-6xl animate-fade-in">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-blue-900">🏆 Leaderboard</h1>
              <div className="flex items-center gap-2 mt-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-600">
                  {isConnected ? 'Live' : 'Disconnected'}
                </span>
              </div>
            </div>
            <div className="space-x-2">
              <Button
                onClick={refreshLeaderboard}
                disabled={!isConnected || loading}
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                {loading ? "Loading..." : "Refresh"}
              </Button>
              <Button
                onClick={() => router.replace("/game")}
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                Return to Game
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12 animate-pulse">
              <h2 className="text-xl text-gray-500 font-medium mb-4">Loading leaderboard...</h2>
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-gray-200 h-12 rounded animate-pulse"></div>
                ))}
              </div>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-12 animate-fade-in">
              <h2 className="text-xl text-gray-500 font-medium mb-4">No games played yet</h2>
              <p className="text-gray-400 mb-6">Complete a game to see your score on the leaderboard</p>
              <Button
                onClick={() => router.replace("/game")}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Start Playing
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto animate-reveal">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-blue-50 text-blue-800 text-left">
                    <th className="px-4 py-3 rounded-tl-lg">Rank</th>
                    <th className="px-4 py-3">Player</th>
                    <th className="px-4 py-3 text-center">Games</th>
                    <th className="px-4 py-3 text-center">Wins</th>
                    <th className="px-4 py-3 text-center">Win Rate</th>
                    <th className="px-4 py-3 text-center">Total Moves</th>
                    <th className="px-4 py-3 text-center rounded-tr-lg">Avg Moves</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry, index) => (
                    <tr 
                      key={`${entry.user}-${index}`}
                      className={`
                        border-b border-blue-100 hover:bg-blue-50 transition-colors
                        ${index % 2 === 0 ? "bg-white" : "bg-blue-50/30"}
                        ${index < 3 ? "bg-gradient-to-r from-yellow-50 to-yellow-100" : ""}
                      `}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="px-4 py-4 font-medium text-center">
                        <span className={index < 3 ? "text-lg" : ""}>
                          {getRankIcon(index)}
                        </span>
                      </td>
                      <td className="px-4 py-4 font-medium">
                        <div className="flex items-center gap-2">
                          <span className={index < 3 ? "font-bold text-blue-900" : ""}>
                            {entry.user}
                          </span>
                          {entry.wins > 0 && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                              Winner
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center font-medium">
                        {entry.gamesPlayed}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-green-700 font-bold">
                          {entry.wins}
                        </span>
                        {entry.losses > 0 && (
                          <span className="text-gray-500">
                            /{entry.losses}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`font-medium ${
                          entry.gamesPlayed > 0 && entry.wins / entry.gamesPlayed > 0.5 
                            ? 'text-green-600' : 'text-gray-600'
                        }`}>
                          {getWinRate(entry.wins, entry.gamesPlayed)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center text-blue-700 font-medium">
                        {entry.totalMoves}
                      </td>
                      <td className="px-4 py-4 text-center text-blue-900 font-bold">
                        {entry.averageMoves}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Summary stats */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900">Total Players</h3>
                  <p className="text-2xl font-bold text-blue-600">{leaderboard.length}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900">Total Games</h3>
                  <p className="text-2xl font-bold text-green-600">
                    {leaderboard.reduce((sum, entry) => sum + entry.gamesPlayed, 0)}
                  </p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-900">Total Wins</h3>
                  <p className="text-2xl font-bold text-yellow-600">
                    {leaderboard.reduce((sum, entry) => sum + entry.wins, 0)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {!isConnected && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center">
              ⚠️ Connection lost. Leaderboard may not be up to date.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;