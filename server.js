import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import mongoose from "mongoose";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

const GameSchema = new mongoose.Schema({
    result: {
        type: [[Number]],
        required: true,
    },
    board: {
        type: [[String]],
        required: true,
    },
    table: [{
        user: { type: String, required: true },
        moves: { type: Number, required: true, default: 0 }
    }],
    loser: {
        type: String,
        default: ""
    },
    winner: {
        type: String,
        default: ""
    },
    gameStatus: {
        type: String,
        enum: ['active', 'won', 'lost'],
        default: 'active'
    }
}, { timestamps: true })

const Game = mongoose.models.Game || mongoose.model("Game", GameSchema)

const connectDB = async () => {
    try {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGO_URI);
            console.log('MongoDB connected');
        }
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

const ROWS = 20;
const COLS = 10;
const MINES = 40;
const TOTAL_CELLS = ROWS * COLS;
const WIN_CONDITION = TOTAL_CELLS - MINES;

const gameState = {
    result: [],
    board: [],
    table: [],
    gameId: null,
    gameStatus: 'active',
    loser: "",
    winner: ""
};

const isValidCell = (row, col) => {
    return row >= 0 && row < ROWS && col >= 0 && col < COLS;
};

const saveGameToMongo = async () => {
    try {
        if (gameState.gameId) {
            await Game.findByIdAndUpdate(gameState.gameId, {
                result: gameState.result,
                board: gameState.board,
                table: gameState.table,
                loser: gameState.loser || "",
                winner: gameState.winner || "",
                gameStatus: gameState.gameStatus
            });
            console.log('Game saved to MongoDB');
        }
    } catch (error) {
        console.error('Error saving game to MongoDB:', error);
    }
};

const loadGameFromMongo = async () => {
    try {
        const game = await Game.findOne({ gameStatus: 'active' }).sort({ createdAt: -1 });
        if (game) {
            gameState.result = game.result;
            gameState.board = game.board;
            gameState.table = game.table;
            gameState.gameId = game._id;
            gameState.gameStatus = game.gameStatus;
            gameState.loser = game.loser;
            gameState.winner = game.winner;
            console.log('Loaded active game from MongoDB');
            return true;
        }
        console.log('No active game found in MongoDB');
        return false;
    } catch (error) {
        console.error('Error loading game from MongoDB:', error);
        return false;
    }
};

const generateBoard = async (row, col, username) => {
    try {
        gameState.result = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
        gameState.board = Array.from({ length: ROWS }, () => Array(COLS).fill('B'));
        gameState.table = [{ user: username, moves: 1 }];
        gameState.gameStatus = 'active';
        gameState.loser = "";
        gameState.winner = "";

        let minesPlaced = 0;
        while (minesPlaced < MINES) {
            const x = Math.floor(Math.random() * ROWS);
            const y = Math.floor(Math.random() * COLS);
            
            if ((x === row && y === col) || gameState.result[x][y] === -1) {
                continue;
            }
            
            gameState.result[x][y] = -1;
            minesPlaced++;
            
            for (let i = x - 1; i <= x + 1; i++) {
                for (let j = y - 1; j <= y + 1; j++) {
                    if (isValidCell(i, j) && gameState.result[i][j] !== -1) {
                        gameState.result[i][j]++;
                    }
                }
            }
        }

        const newGame = new Game({
            result: gameState.result,
            board: gameState.board,
            table: gameState.table,
            gameStatus: 'active'
        });
        
        const savedGame = await newGame.save();
        gameState.gameId = savedGame._id;
        console.log('New game created in MongoDB with ID:', savedGame._id);

        await revealCells(row, col);
        await saveGameToMongo();
        console.log('Board generated successfully');
    } catch (error) {
        console.error('Error in generateBoard:', error);
        throw error;
    }
};

const revealCells = async (startRow, startCol) => {    
    const dx = [-1, -1, -1, 0, 0, 1, 1, 1];
    const dy = [-1, 0, 1, -1, 1, -1, 0, 1];
    
    const visited = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
    const queue = [[startRow, startCol]];
    visited[startRow][startCol] = true;

    while (queue.length > 0) {
        const [x, y] = queue.shift();
        gameState.board[x][y] = gameState.result[x][y].toString();

        if (gameState.result[x][y] === 0) {
            for (let i = 0; i < MINES; i++) {
                const nx = x + dx[i];
                const ny = y + dy[i];
                
                if (isValidCell(nx, ny) && !visited[nx][ny]) {
                    visited[nx][ny] = true;
                    queue.push([nx, ny]);
                }
            }
        }
    }
    
    const revealedCount = gameState.board.flat().filter(cell => cell !== 'B').length;
    console.log(`Revealed ${revealedCount} cells`);
};

const updateBoard = async (row, col, username) => {
    try {
        console.log(`${username} clicked cell [${row}, ${col}]`);
        
        if (!isValidCell(row, col)) {
            throw new Error('Invalid cell coordinates');
        }

        if (gameState.board[row][col] !== 'B') {
            console.log('Cell already revealed');
            return "already-revealed";
        }

        if (gameState.gameStatus !== 'active') {
            console.log('Game is not active');
            return `game-${gameState.gameStatus}`;
        }

        const existingPlayer = gameState.table.find(player => player.user === username);
        if (existingPlayer) {
            existingPlayer.moves += 1;
        } else {
            gameState.table.push({ user: username, moves: 1 });
        }

        if (gameState.result[row][col] === -1) {
            console.log('Mine hit! Game over');
            gameState.gameStatus = 'lost';
            gameState.loser = username;
            
            // Reveal all mines
            for (let i = 0; i < ROWS; i++) {
                for (let j = 0; j < COLS; j++) {
                    if (gameState.result[i][j] === -1) {
                        gameState.board[i][j] = 'M'; // M for mine
                    }
                }
            }
            
            await saveGameToMongo();
            return "game-over";
        }

        await revealCells(row, col);

        const revealedCount = gameState.board.flat().filter(cell => cell !== 'B').length;
        
        if (revealedCount >= WIN_CONDITION) {
            console.log('Game won!');
            gameState.gameStatus = 'won';
            gameState.winner = username;
            await saveGameToMongo();
            return "game-won";
        }

        await saveGameToMongo();
        console.log('Board updated successfully');
        return "board-updated";
        
    } catch (error) {
        console.error('Error in updateBoard:', error);
        throw error;
    }
};

const getLeaderboard = async () => {
    try {
        const games = await Game.find({}).sort({ createdAt: -1 }).limit(50);
        const playerStats = {};
        
        games.forEach(game => {
            game.table.forEach(player => {
                if (!playerStats[player.user]) {
                    playerStats[player.user] = {
                        user: player.user,
                        totalMoves: 0,
                        gamesPlayed: 0,
                        wins: 0,
                        losses: 0
                    };
                }
                
                playerStats[player.user].totalMoves += player.moves;
                playerStats[player.user].gamesPlayed += 1;
                
                if (game.winner === player.user) {
                    playerStats[player.user].wins += 1;
                } else if (game.loser === player.user) {
                    playerStats[player.user].losses += 1;
                }
            });
        });
        
        return Object.values(playerStats).sort((a, b) => {
            if (b.wins !== a.wins) return b.wins - a.wins;
            return (a.totalMoves / a.gamesPlayed) - (b.totalMoves / b.gamesPlayed);
        });
    } catch (error) {
        console.error('Error getting leaderboard:', error);
        return [];
    }
};

app.prepare().then(async () => {
    await connectDB();
    await loadGameFromMongo();

    const httpServer = createServer(handler);
    const io = new Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", async (socket) => {
        const username = socket.handshake.query.username;
        if (!username) {
            socket.emit("error", { message: "Username is required" });
            return;
        }
        console.log(`User connected: ${username}`);

        socket.on("start-game", async ({ row, col }) => {
            try {
                if (!isValidCell(row, col)) {
                    socket.emit("error", { message: "Invalid starting position" });
                    return;
                }
                
                await generateBoard(row, col, username);
                io.emit("board-updated", gameState.board);
                io.emit("game-status", { status: gameState.gameStatus });
                
            } catch (err) {
                console.error("start-game error:", err);
                socket.emit("error", { message: "Failed to start game" });
            }
        });

        socket.on("cell-click", async ({ row, col }) => {
            try {                
                const res = await updateBoard(row, col, username);

                if (res === "game-over") {
                    console.log('Emitting game-over');
                    io.emit("game-over", { 
                        loser: username, 
                        board: gameState.board 
                    });
                } else if (res === "game-won") {
                    console.log('Emitting game-won');
                    io.emit("game-won", { 
                        winner: username,
                        board: gameState.board
                    });
                } else if (res === "board-updated") {
                    console.log('Emitting board-updated');
                    io.emit("board-updated", gameState.board);
                } else if (res === "already-revealed") {
                    socket.emit("error", { message: "Cell already revealed" });
                } else {
                    socket.emit("error", { message: "Game is not active" });
                }
                
            } catch (err) {
                console.error("cell-click error:", err);
                socket.emit("error", { message: "Error updating board" });
            }
        });

        socket.on("get-leaderboard", async () => {
            try {
                const leaderboard = await getLeaderboard();
                socket.emit("leaderboard", leaderboard);
            } catch (err) {
                console.error("get-leaderboard error:", err);
                socket.emit("error", { message: "Error fetching leaderboard" });
            }
        });

        socket.on("get-current-game", () => {
            socket.emit("current-board", gameState.board);
            socket.emit("game-status", { 
                status: gameState.gameStatus,
                winner: gameState.winner,
                loser: gameState.loser 
            });
        });

        // Send initial game state
        socket.emit("current-board", gameState.board);
        socket.emit("game-status", { 
            status: gameState.gameStatus,
            winner: gameState.winner,
            loser: gameState.loser 
        });

        socket.on("disconnect", () => {
            console.log(`User disconnected: ${username}`);
        });
    });

    process.on('SIGINT', async () => {
        console.log('Shutting down gracefully...');
        await mongoose.connection.close();
        httpServer.close(() => {
            console.log('Server closed');
            process.exit(0);
        });
    });

    httpServer
        .once("error", (err) => {
            console.error(err);
            process.exit(1);
        })
        .listen(port, () => {
            console.log(`> Ready on http://${hostname}:${port}`);
        });
});