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
   return ( <div>
      <h1>Welcome to minesweeper</h1>
      <h1>Player: {username}</h1>
      <Button onClick={()=>setToggleStart(true)}>Start Game</Button>
      <h2>{loser===""?`Winner: ${winner}`:`Loser: ${loser}`}</h2>
      <div className="grid grid-cols-10 gap-2 bg-gray-200 p-3 rounded-xl shadow-inner">
        {toggleStart && board.map((row,rowIndex)=>(
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