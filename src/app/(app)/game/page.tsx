/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const MinesweeperGame = () => {
  const router=useRouter()
  const [username, setUsername] = useState("");
  const [gameState, setGameState] = useState<"pre-game" | "playing" | "game-lost" | "game-won">("pre-game");
  const [loser, setLoser] = useState("");
  const [board,setBoard]=useState<Array<Array<any>>>([])
  const [over,setOver]=useState(false)

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
    const data={row,col,username}
    console.log(data)
      try {
        const response=await fetch(`http://localhost:3000/api/update-current-board`,{
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body: JSON.stringify(data)
        })
        const msg=await response.json()
        console.log(msg)
        if(!response.ok){
          throw new Error(msg.message||"Board updation failed")
        }
        if(msg.message==="Game won"){
          setGameState("game-won")
          setOver(true)
          toast.success("Congratulations! You won!");
        }
        else if(msg.message==="Mine triggered. Game over."){
          setGameState("game-lost")
          setLoser(username)
          setOver(true)
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
    console.log(data)
    try {
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
      setOver(false)
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
  if(over){
   return ( <div>
      <h1>Welcome to minesweeper</h1>
      <h2>Start game</h2>
      <div className="grid grid-cols-10 gap-2 bg-gray-200 p-3 rounded-xl shadow-inner">
        {board.map((row,rowIndex)=>(
          row.map((cell,colIndex)=>(
            <button
            key={rowIndex-colIndex}
            onClick={()=>startGame(rowIndex,colIndex)}
            className={`border-black border-2 rounded-sm text-blue-600 bg-blue-600`}
            >
              B
            </button>
          ))
        ))}
      </div>
    </div>)
  }

  return (
    <div>
      <h1>Welcome to minesweeper</h1>
      <div className="grid grid-cols-10 gap-2 bg-gray-200 p-3 rounded-xl shadow-inner">
        {board.map((row,rowIndex)=>(
          row.map((cell,colIndex)=>(
            <button
            key={rowIndex-colIndex}
            onClick={()=>handleCellClick(rowIndex,colIndex)}
            className={`border-black border-2 rounded-sm text-blue-600 ${cell==='B'?'bg-blue-600':'bg-white'}`}
            >
              {cell}
            </button>
          ))
        ))}
      </div>
    </div>
  );
};

export default MinesweeperGame;