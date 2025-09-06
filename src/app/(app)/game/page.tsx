/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"
import {Socket, io } from "socket.io-client";

const MinesweeperGame = () => {
  const router=useRouter()
  const socketRef = useRef<Socket | null>(null);
  const [username, setUsername] = useState("");
  const [loser, setLoser] = useState("");
  const [winner,setWinner]=useState("")
  const [board,setBoard]=useState<Array<Array<any>>>([])
  const [over,setOver]=useState(true)
  const [toggleStart,setToggleStart]=useState(false)

  useEffect(() => {
    const storedUsername = localStorage.getItem("minesweeper_username");
    if (!storedUsername) {
      router.replace("/");
      return;
    }

    setUsername(storedUsername);

    socketRef.current = io("http://localhost:3000", {
      query: { username: storedUsername }
    });

    const socket = socketRef.current;

    socket.on("board-updated", (newBoard) => {
      setBoard(newBoard);
    });

    socket.on("current-board", (newBoard) => {
      console.log("Received board from server:", newBoard);
      setBoard(newBoard);
    });

    socket.on("game-over", ({ loser }) => {
      setOver(true);
      setLoser(loser);
      setToggleStart(false);
      toast.error(`${loser} hit a mine! Game over!`);
    });

    socket.on("game-won", ({ winner }) => {
      setOver(true);
      setWinner(winner);
      setToggleStart(false);
      toast.success(`${winner} has won the game!`);
    });

    socket.on("get-leaderboard", (leaderboard) => {
      console.log("Leaderboard:", leaderboard);
    });

    socket.on("error", ({ message }) => {
      toast.error(message);
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect()
    };
  }, [router]);

  const startGame = (row: number, col: number) => {
    if (!socketRef.current) return;

    setOver(false);
    setToggleStart(false);
    socketRef.current.emit("start-game", { row, col });
    console.log(board)
    toast.info("Game started!");
  };

  const handleCellClick = (row: number, col: number) => {
    if (!socketRef.current || over) return;
    socketRef.current.emit("cell-click", { row, col });
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
              onClick={()=>{setToggleStart(true)
                setBoard(Array.from({ length: 20 }, () => Array(10).fill('B')));
              }}>
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