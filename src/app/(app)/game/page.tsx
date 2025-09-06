/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"
import {Socket, io } from "socket.io-client";

interface GameStatus {
  status: 'active' | 'won' | 'lost';
  winner?: string;
  loser?: string;
}

const MinesweeperGame = () => {
  const router = useRouter();
  const socketRef = useRef<Socket | null>(null);
  const [username, setUsername] = useState("");
  const [loser, setLoser] = useState("");
  const [winner, setWinner] = useState("");
  const [board, setBoard] = useState<Array<Array<any>>>([]);
  const [gameStatus, setGameStatus] = useState<'active' | 'won' | 'lost'>('lost');
  const [toggleStart, setToggleStart] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

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

    socket.on("connect", () => {
      setIsConnected(true);
      console.log("Connected to server");
      socket.emit("get-current-game");
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      console.log("Disconnected from server");
    });

    socket.on("board-updated", (newBoard) => {
      setBoard(newBoard);
    });

    socket.on("current-board", (newBoard) => {
      setBoard(newBoard);
    });

    socket.on("game-status", (status: GameStatus) => {
      setGameStatus(status.status);
      if (status.winner) setWinner(status.winner);
      if (status.loser) setLoser(status.loser);
    });

    socket.on("game-over", ({ loser: gameLoser, board: gameBoard }) => {
      setGameStatus('lost');
      setLoser(gameLoser);
      setWinner("");
      setToggleStart(false);
      setBoard(gameBoard);
      toast.error(`${gameLoser} hit a mine! Game over!`);
    });

    socket.on("game-won", ({ winner: gameWinner, board: gameBoard }) => {
      setGameStatus('won');
      setWinner(gameWinner);
      setLoser("");
      setToggleStart(false);
      setBoard(gameBoard);
      toast.success(`${gameWinner} has won the game!`);
    });

    socket.on("error", ({ message }) => {
      toast.error(message);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [router]);

  const startGame = (row: number, col: number) => {
    if (!socketRef.current || !isConnected) {
      toast.error("Not connected to server");
      return;
    }

    setGameStatus('active');
    setToggleStart(false);
    setLoser("");
    setWinner("");
    socketRef.current.emit("start-game", { row, col });
    toast.info("Game started!");
  };

  const handleCellClick = (row: number, col: number) => {
    if (!socketRef.current || !isConnected || gameStatus !== 'active') return;
    socketRef.current.emit("cell-click", { row, col });
  };

  const getCellDisplay = (cell: any) => {
    if (cell === 'B') return '';
    if (cell === 'M') return '💣';
    if (cell === '0') return '';
    return cell;
  };

  const getCellColor = (cell: any) => {
    if (cell === 'B') return 'bg-blue-600 text-white';
    if (cell === 'M') return 'bg-red-600 text-white';
    if (cell === '0') return 'bg-gray-100';
    
    const colors: { [key: string]: string } = {
      '1': 'bg-blue-100 text-blue-800',
      '2': 'bg-green-100 text-green-800',
      '3': 'bg-red-100 text-red-800',
      '4': 'bg-purple-100 text-purple-800',
      '5': 'bg-yellow-100 text-yellow-800',
      '6': 'bg-pink-100 text-pink-800',
      '7': 'bg-indigo-100 text-indigo-800',
      '8': 'bg-gray-100 text-gray-800',
    };
    
    return colors[cell] || 'bg-white text-gray-800';
  };

  const resetGame = () => {
    setToggleStart(true);
    setGameStatus('lost');
    setLoser("");
    setWinner("");
    setBoard(Array.from({ length: 20 }, () => Array(10).fill('B')));
  };

  if (gameStatus !== 'active') {
    return (
      <div className="bg-gradient-to-b from-blue-50 to-blue-100 min-h-screen p-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-indigo-700">Welcome to Minesweeper</h1>
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-black text-lg">Player:</h2>
              <h1 className="text-lg font-bold text-blue-900">{username}</h1>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-600">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
          <Button 
            onClick={() => router.replace("/leaderboard")}
            variant="outline"
            className="border-blue-300 text-blue-700 hover:bg-blue-50"
          >
            Leaderboard
          </Button>
        </div>

        <div className="flex flex-col items-center justify-center">
          <div className="w-full max-w-md animate-scale-in">
            <div className="bg-white rounded-xl shadow-lg p-8 border border-blue-100">
              <h1 className={`text-3xl font-bold text-center mb-4 ${
                gameStatus === 'won' ? 'text-green-600' : 
                gameStatus === 'lost' ? 'text-red-600' : 'text-blue-600'
              }`}>
                {gameStatus === 'won' ? `Winner: ${winner} gave the winning move` : 
                 gameStatus === 'lost' && loser ? `Game Over: ${loser} triggered a mine` : 
                 'Ready to Play'}
              </h1>
              
              <Button 
                type="button" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                onClick={resetGame}
                disabled={!isConnected}
              >
                {!isConnected ? 'Connecting...' : 'Start New Game'}
              </Button>
            </div>
          </div>

          {/* Game board for selection or showing final state */}
          {(toggleStart || board.length > 0) && (
            <div className="mt-6">
              <p className="text-center text-sm text-gray-600 mb-2">
                {toggleStart ? 'Click a cell to start the game' : 'Final board state'}
              </p>
              <div className="grid grid-cols-10 gap-1 bg-gray-200 p-3 rounded-xl shadow-inner w-full max-w-[800px] mx-auto overflow-x-auto">
                {board.map((row, rowIndex) => (
                  row.map((cell, colIndex) => (
                    <button
                      key={`${rowIndex}-${colIndex}`}
                      onClick={() => toggleStart && startGame(rowIndex, colIndex)}
                      disabled={!toggleStart || !isConnected}
                      className={`rounded-sm flex items-center justify-center transition-all duration-150 text-sm font-bold w-8 h-8 min-w-[32px] min-h-[32px]
                        ${toggleStart ? 
                          'bg-blue-600 text-white hover:scale-105 active:scale-95 cursor-pointer' : 
                          `${getCellColor(cell)} cursor-default`
                        }
                        ${!isConnected && toggleStart ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                    >
                      {toggleStart ? '' : getCellDisplay(cell)}
                    </button>
                  ))
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-200 p-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h1 className="text-2xl font-bold text-indigo-700">Minesweeper Game</h1>
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-black text-lg">Player:</h2>
            <h1 className="text-lg font-bold text-blue-900">{username}</h1>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-600">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
        <div className="space-x-2">
          <Button 
            onClick={() => router.replace("/leaderboard")}
            variant="outline"
            className="border-blue-300 text-blue-700 hover:bg-blue-50"
          >
            Leaderboard
          </Button>
          <Button 
            onClick={resetGame}
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-50"
          >
            New Game
          </Button>
        </div>
      </div>

      <div className="flex justify-center overflow-x-auto">
        <div className="grid grid-cols-10 gap-1 bg-gray-200 p-3 rounded-xl shadow-inner min-w-[500px] max-w-[800px]">
          {board.map((row, rowIndex) => (
            row.map((cell, colIndex) => (
              <button
                key={`active-${rowIndex}-${colIndex}-${cell}`}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                disabled={!isConnected || cell !== 'B'}
                className={`rounded-sm flex items-center justify-center transition-all duration-150 text-xs font-bold aspect-square min-w-[24px] min-h-[24px]
                  ${getCellColor(cell)}
                  ${cell === 'B' && isConnected ? 
                    'hover:scale-105 active:scale-95 cursor-pointer' : 
                    'cursor-default'
                  }
                  ${!isConnected ? 'opacity-50' : ''}
                `}
              >
                {getCellDisplay(cell)}
              </button>
            ))
          ))}
        </div>
      </div>

      {!isConnected && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
          Connection lost. Trying to reconnect...
        </div>
      )}
    </div>
  );
};

export default MinesweeperGame;