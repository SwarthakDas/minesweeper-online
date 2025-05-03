/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const MinesweeperGame = () => {
  const router=useRouter()
  const [username, setUsername] = useState("");
  const [gameState, setGameState] = useState<"pre-game" | "playing" | "game-lost" | "game-won">("pre-game");
  const [loser, setLoser] = useState("");
  const [moves, setMoves] = useState(0);
  const [board,setBoard]=useState<Array<Array<any>>>([])
  const [waitingForFirstClick, setWaitingForFirstClick] = useState(false);

  const currentBoard=async()=>{
    try {
      const response=await fetch(`http://localhost:3000/api/get-current-board`,{
        method:"GET",
        headers:{"Content-Type":"application/json"}
      })
      const msg=await response.json()
      if(!response.ok){
        throw new Error(msg.message||"Board fetching failed")
      }
      setBoard(msg.board)
      setGameState("playing")
    } catch (error) {
      console.error("Error getting board")
      toast.error("Failed to fetch game board");
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  }
  useEffect(() => {
    const init=async()=>{
      const storedUsername = localStorage.getItem("minesweeper_username");
    if (!storedUsername) {
      router.replace("/");
      return;
    }
    setUsername(storedUsername);
    await currentBoard()
    }
    init()
  }, [router]);
  
  const handleCellClick = async(row: number, col: number) => {
    if (waitingForFirstClick) {
      setWaitingForFirstClick(false);
      await startGame(row, col); 
      return; 
    }
    const data={row,col,username}
      try {
        const response=await fetch(`http://localhost:3000/api/update-current-board`,{
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body: JSON.stringify(data)
        })
        const msg=await response.json()
        if(!response.ok){
          throw new Error(msg.message||"Board updation failed")
        }
        setMoves(prev => prev + 1);
        if(msg.message==="Game won"){
          setGameState("game-won")
          toast.success("Congratulations! You won!");
        }
        else if(msg.message==="Mine triggered. Game over."){
          setGameState("game-lost")
          setLoser(username)
          toast.error("You hit a mine! Game over!");
        }
        else if(msg.message==="Board updated"){
          await currentBoard()
        }
      } catch (error) {
        console.error("Error getting board")
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("An unexpected error occurred");
        }
      }
  };
  
  const startGame = async(row:number,col:number) => {
    const data={
      row,col,username
    }
    try {
      setMoves(0);
      toast.info("Generating new game...");
      const response=await fetch(`http://localhost:3000/api/generate-board`,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify(data)
      })
      const msg=await response.json()
      if(!response.ok){
        throw new Error(msg.message||"Board generating failed")
      }
      await currentBoard();
      toast.success("Game started! Watch out for mines!");
      setGameState("playing");
    } catch (error) {
      console.error("Error generating board", error);
      setGameState("pre-game");
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  

  const renderCellContent = (cell: any) => {
    if (cell === "B") {
      return ""; 
    }
    if (cell === -1 || cell === "X") {
      return "💣"; // mine
    }
      return cell.toString(); // number revealed
  };

  const getCellStyle = (cell: any) => {
    if (cell === "B") {
      return "bg-blue-400 hover:bg-blue-500"; 
    }
    if (cell === -1 || cell === "X") {
      return "bg-red-600 text-white"; 
    }
      return cell === "0" ? "bg-gray-300 text-transparent" : "bg-gray-100 text-black"; 

  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-blue-50 to-blue-100 p-4">
      <div className="w-full max-w-4xl animate-fade-in">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 flex flex-wrap justify-between items-center">
          <div>
            <h2 className="font-medium text-gray-600">Player:</h2>
            <h1 className="text-2xl font-bold text-blue-900">{loser ? "Loser 💥" : username}</h1>
          </div>
          
          <div className="flex items-center gap-4">
              <div className="bg-blue-50 px-4 py-2 rounded-lg">
                <span className="font-medium text-gray-600">Moves:</span>
                <span className="ml-2 text-xl font-bold text-blue-700">{moves}</span>
              </div>
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
              onClick={()=>startGame}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-md text-lg transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              Start Game
            </Button>
          </div>
        )}
        
        {gameState === "game-lost" && (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center mb-6 animate-bounce-in">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Game Over!</h2>
            <p className="text-gray-600 mb-6">You made {moves} moves before hitting a mine.</p>
            <Button 
              onClick={()=>{
                setWaitingForFirstClick(true); 
                setGameState("pre-game");
                setMoves(0);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-md text-lg transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              Start Again
            </Button>
          </div>
        )}
        
        {gameState === "game-won" && (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center mb-6 animate-bounce-in">
            <h2 className="text-2xl font-bold text-green-600 mb-4">Victory! 🎉</h2>
            <p className="text-gray-600 mb-6">You won in {moves} moves!</p>
            <Button 
              onClick={()=>{
                setWaitingForFirstClick(true);
                setGameState("pre-game");
                setMoves(0);
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-md text-lg transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              Play Again
            </Button>
          </div>
        )}

        
        <div
        className="grid gap-1 bg-gray-200 p-3 rounded-xl shadow-inner"
        style={{ gridTemplateColumns: 'repeat(20, minmax(0, 1fr))' }}
        >
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <button
              key={`${rowIndex}*${colIndex}`}
              onClick={() => handleCellClick(rowIndex, colIndex)}
              className={`
                w-full aspect-square rounded flex items-center justify-center
                transition-all duration-150 text-sm font-bold
                ${getCellStyle(cell)}
                transform hover:scale-105 active:scale-95
              `}
              style={{ animationDelay: `${(rowIndex * 20 + colIndex) * 5}ms` }}
            >
              {renderCellContent(cell)}
            </button>
          ))
        )}
      </div>
      </div>
    </div>
  );
};

export default MinesweeperGame;