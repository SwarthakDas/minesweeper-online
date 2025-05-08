/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"

const MinesweeperGame = () => {
  const router=useRouter()
  const [username, setUsername] = useState("");
  const [loser, setLoser] = useState("");
  const [winner,setWinner]=useState("")
  const [board,setBoard]=useState<Array<Array<any>>>([])
  const [over,setOver]=useState(false)
  const [toggleStart,setToggleStart]=useState(true)

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
          setOver(true)
          setWinner(username)
          setToggleStart(false)
          toast.success("Congratulations! You won!");
        }
        else if(msg.message==="Mine triggered. Game over."){
          setLoser(username)
          setOver(true)
          setToggleStart(false)
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
      setOver(false)
    } catch (error) {
      console.error("Error generating board", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };
  if(over){
   return ( <div className="bg-gradient-to-b from-blue-50 to-blue-100 min-h-screen">
      <h1 className="text-2xl font-bold text-indigo-700">Welcome to minesweeper</h1>
      <div className="flex items-center gap-2">
            <h2 className="font-semibold text-black text-2xl">Player:</h2>
            <h1 className="text-2xl font-bold text-blue-900">{username}</h1>
      </div>
      <div className="flex flex-col items-center justify-center  p-4">
      <div className="w-full max-w-md animate-scale-in">
        <div className="bg-white rounded-xl shadow-lg p-8 border border-blue-100">
          <h1 className={`text-3xl font-bold text-center ${loser===""?`text-blue-500`:`text-red-500`} mb-8`}>{loser===""?`Winner: ${winner}`:`Loser: ${loser}`}</h1>
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
              onClick={()=>setToggleStart(true)}>
              Start Game
            </Button>
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
    {toggleStart && <div className="grid grid-cols-10 gap-2 bg-gray-200 p-3 rounded-xl shadow-inner h-full w-full max-w-[400px] mx-auto">
         {board.map((row,rowIndex)=>(
          row.map((cell,colIndex)=>(
            <button
            key={rowIndex-colIndex}
            onClick={()=>startGame(rowIndex,colIndex)}
            className={`rounded-sm text-blue-600 bg-blue-600 flex items-center justify-center
            transition-all duration-150 text-sm font-bold transform hover:scale-105 active:scale-95 aspect-square`}
            >
              B
            </button>
          ))
        ))}
      </div>}
    </div>)
  }

  return (
    <div className="min-h-screen items-center bg-gradient-to-b from-blue-50 to-blue-200 p-4">
      <h1 className="text-2xl font-bold text-indigo-700">Welcome to minesweeper</h1>
      <div className="flex items-center gap-2">
            <h2 className="font-semibold text-black text-2xl">Player:</h2>
            <h1 className="text-2xl font-bold text-blue-900">{username}</h1>
      </div>
      <Button className="absolute right-1 top-5" onClick={()=>router.replace("/leaderboard")}>Leaderboard</Button>
      <div className="grid grid-cols-10 gap-2 bg-gray-200 p-3 rounded-xl shadow-inner h-full w-full max-w-[400px] mx-auto">
        {board.map((row,rowIndex)=>(
          row.map((cell,colIndex)=>(
            <button
            key={rowIndex-colIndex}
            onClick={()=>cell==='B' && handleCellClick(rowIndex,colIndex)}
            className={`rounded-sm text-blue-600 ${cell==='B'?'bg-blue-600':'bg-white'}
           rounded flex items-center justify-center
            transition-all duration-150 text-sm font-bold transform hover:scale-105 active:scale-95 aspect-square`}
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