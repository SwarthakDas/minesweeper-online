import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";


interface LeaderboardEntry {
  username: string;
  moves: number;
  timestamp: number;
}

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const router=useRouter()
  useEffect(() => {
    // Load leaderboard data from localStorage
    const storedData = localStorage.getItem("minesweeper_leaderboard");
    if (storedData) {
      const parsedData = JSON.parse(storedData) as LeaderboardEntry[];
      // Sort by moves in descending order
      parsedData.sort((a, b) => b.moves - a.moves);
      setLeaderboard(parsedData);
    }
  }, []);
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-blue-50 to-blue-100 p-4">
      <div className="w-full max-w-4xl animate-fade-in">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-blue-900">Leaderboard</h1>
            <div className="space-x-2">
              <Button
                onClick={() => router.replace("/")}
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                New Game
              </Button>
            </div>
          </div>
          
          {leaderboard.length === 0 ? (
            <div className="text-center py-12 animate-fade-in">
              <h2 className="text-xl text-gray-500 font-medium mb-4">No games played yet</h2>
              <p className="text-gray-400 mb-6">Complete a game to see your score on the leaderboard</p>
              <Button
                onClick={() => router.replace("/")}
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
                    <th className="px-6 py-3 rounded-tl-lg">#</th>
                    <th className="px-6 py-3">Username</th>
                    <th className="px-6 py-3 text-right">Moves</th>
                    <th className="px-6 py-3 text-right rounded-tr-lg">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry, index) => (
                    <tr 
                      key={index} 
                      className={`
                        border-b border-blue-100 hover:bg-blue-50 transition-colors
                        ${index % 2 === 0 ? "bg-white" : "bg-blue-50/30"}
                      `}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="px-6 py-4 font-medium">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {entry.username}
                      </td>
                      <td className="px-6 py-4 text-right text-blue-700 font-bold">
                        {entry.moves}
                      </td>
                      <td className="px-6 py-4 text-right text-gray-500">
                        {formatDate(entry.timestamp)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;