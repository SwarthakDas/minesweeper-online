"use client"
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const Index = () => {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      toast.error("Please enter a username");
      return;
    }
    
    // Save username to localStorage
    localStorage.setItem("minesweeper_username", username.trim());
    
    // Navigate to game page
    navigate("/game");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100 p-4">
      <div className="w-full max-w-md animate-scale-in">
        <div className="bg-white rounded-xl shadow-lg p-8 border border-blue-100">
          <h1 className="text-3xl font-bold text-center text-blue-900 mb-8">Minesweeper</h1>
          
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
                maxLength={15}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Start Game
            </Button>
          </form>
        </div>
        
        <div className="mt-6 text-center">
          <a 
            href="/leaderboard" 
            className="text-blue-600 hover:text-blue-800 underline text-sm transition-colors"
          >
            View Leaderboard
          </a>
        </div>
      </div>
    </div>
  );
};

export default Index;