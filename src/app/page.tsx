"use client"
import { useState,useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const Index = () => {
  const [username, setUsername] = useState("");
  const router = useRouter();

  useEffect(() => {
    const existingUsername = localStorage.getItem("minesweeper_username");
    if (existingUsername) {
      router.replace("/game");
    }
  }, [router]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error("Please enter a username");
      return;
    }
    if (username.trim().length < 2) {
      toast.error("Username must be at least 2 characters long");
      return;
    }
    localStorage.setItem("minesweeper_username", username.trim());
    toast.success("Welcome to Minesweeper!");
    router.replace("/game");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100 p-4">
      <div className="w-full max-w-md animate-scale-in">
        {/* Game Logo/Header */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-2">💣</div>
          <h1 className="text-4xl font-bold text-blue-900 mb-2">Minesweeper Online</h1>
          <p className="text-gray-600 text-sm">Challenge yourself with the classic puzzle game</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 border border-blue-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Enter your username
              </label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                placeholder="YourUsername"
                autoFocus
                minLength={2}
                maxLength={15}
              />
              <p className="text-xs text-gray-500">2-15 characters, visible to other players</p>
            </div>
            
            <Button 
              type="submit" 
              disabled={!username.trim() || username.trim().length < 2}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-md transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Start Playing
            </Button>
          </form>
        </div>

        {/* Game Info */}
        <div className="mt-6 bg-white/70 rounded-lg p-4 text-center">
          <h3 className="font-semibold text-gray-800 mb-2">Game Features</h3>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
            <div>🎯 20×10 Board</div>
            <div>💣 40 Mines</div>
            <div>🏆 Live Leaderboard</div>
            <div>⚡ Real-time Play</div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-6 flex justify-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/leaderboard")}
            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 text-sm transition-colors"
          >
            📊 View Leaderboard
          </Button>
        </div>

        {/* How to Play */}
        <div className="mt-6 text-center">
          <details className="bg-white/50 rounded-lg p-3">
            <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
              How to Play
            </summary>
            <div className="mt-3 text-xs text-gray-600 text-left space-y-2">
              <p>• Click any cell to start the game</p>
              <p>• Numbers show how many mines are nearby</p>
              <p>• Avoid clicking on mines (💣)</p>
              <p>• Reveal all safe cells to win</p>
              <p>• Compete with other players on the leaderboard</p>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
};

export default Index;