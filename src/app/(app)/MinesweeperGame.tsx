import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const MinesweeperGame = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [gameState, setGameState] = useState<"pre-game" | "playing" | "game-over">("pre-game");
  const [loser, setLoser] = useState(false);
  const [moves, setMoves] = useState(0);
  const [grid, setGrid] = useState<Array<Array<number>>>([]); 
  
  // Initialize the grid with placeholders (actual mine generation will be implemented later)
  useEffect(() => {
    const storedUsername = localStorage.getItem("minesweeper_username");
    if (!storedUsername) {
      navigate("/");
      return;
    }
    
    setUsername(storedUsername);
    
    // Create empty grid
    const newGrid = [];
    for (let i = 0; i < 10; i++) {
      const row = Array(20).fill(0);
      newGrid.push(row);
    }
    setGrid(newGrid);
  }, [navigate]);
  
  const startGame = () => {
    setGameState("playing");
    setLoser(false);
    setMoves(0);
    toast.success("Game started! Watch out for mines!");
  };
  
  const handleCellClick = (row: number, col: number) => {
    if (gameState !== "playing") return;
    
    // Increment moves
    setMoves(prev => prev + 1);
    
    // Simulate hitting a mine randomly (5% chance)
    // This will be replaced with actual game logic later
    if (Math.random() < 0.05) {
      handleGameOver();
      return;
    }
    
    // Clone the grid to mark the cell as revealed
    const newGrid = [...grid];
    newGrid[row][col] = 1; // 1 means revealed
    setGrid(newGrid);
  };
  
  const handleGameOver = () => {
    setGameState("game-over");
    setLoser(true);
    
    // Store score in leaderboard
    const leaderboard = JSON.parse(localStorage.getItem("minesweeper_leaderboard") || "[]");
    leaderboard.push({ username, moves, timestamp: Date.now() });
    localStorage.setItem("minesweeper_leaderboard", JSON.stringify(leaderboard));
    
    toast.error("You hit a mine! Game over!");
  };
  
  const restartGame = () => {
    setGameState("pre-game");
    
    // Reset grid
    const newGrid = [];
    for (let i = 0; i < 10; i++) {
      const row = Array(20).fill(0);
      newGrid.push(row);
    }
    setGrid(newGrid);
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-blue-50 to-blue-100 p-4">
      <div className="w-full max-w-4xl animate-fade-in">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 flex justify-between items-center">
          <div>
            <h2 className="font-medium text-gray-600">Player:</h2>
            <h1 className="text-2xl font-bold text-blue-900">{loser ? "Loser" : username}</h1>
          </div>
          
          <div className="flex items-center gap-4">
            {gameState === "playing" && (
              <div className="bg-blue-50 px-4 py-2 rounded-lg">
                <span className="font-medium text-gray-600">Moves:</span>
                <span className="ml-2 text-xl font-bold text-blue-700">{moves}</span>
              </div>
            )}
            
            <a 
              href="/leaderboard" 
              className="text-blue-600 hover:text-blue-800 underline transition-colors"
            >
              Leaderboard
            </a>
          </div>
        </div>
        
        {gameState === "pre-game" && (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center mb-6 animate-bounce-in">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Ready to play?</h2>
            <p className="text-gray-600 mb-6">Click the Start Game button to begin!</p>
            <Button 
              onClick={startGame}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-md text-lg transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              Start Game
            </Button>
          </div>
        )}
        
        {gameState === "game-over" && (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center mb-6 animate-bounce-in">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Game Over!</h2>
            <p className="text-gray-600 mb-6">You made {moves} moves before hitting a mine.</p>
            <Button 
              onClick={restartGame}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-md text-lg transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              Start Again
            </Button>
          </div>
        )}
        
        <div className={`grid grid-cols-20 gap-1 bg-gray-200 p-3 rounded-xl shadow-inner ${gameState !== "playing" ? "opacity-70" : ""}`}>
          {grid.map((row, rowIndex) => (
            row.map((cell, colIndex) => (
              <button
                key={`${rowIndex}-${colIndex}`}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                disabled={gameState !== "playing"}
                className={`
                  w-full aspect-square rounded flex items-center justify-center
                  transition-all duration-150 text-sm font-medium
                  ${cell === 0
                    ? "bg-blue-200 hover:bg-blue-300 active:bg-blue-400"
                    : "bg-blue-500 text-white"
                  }
                  ${gameState === "playing" ? "animate-reveal" : ""}
                  transform hover:scale-105 active:scale-95
                `}
                style={{ animationDelay: `${(rowIndex * 20 + colIndex) * 5}ms` }}
              >
                {/* Cell content will be added here with the game logic */}
              </button>
            ))
          ))}
        </div>
      </div>
    </div>
  );
};

export default MinesweeperGame;