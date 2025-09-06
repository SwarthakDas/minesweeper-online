import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

const gameState = {
  result: [],
  board: [],
  table: []
};

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer);

    io.on("connection", (socket) => {
        const username = socket.handshake.query.username;
        console.log(`User connected: ${username}`);

        socket.on("start-game", ({ row, col }) => {
            try {
            gameState.result = Array.from({ length: 20 }, () => Array(10).fill(0));
            gameState.board = Array.from({ length: 20 }, () => Array(10).fill('B'));
            gameState.table=[]
            
            generateBoard(row, col, username);
            io.emit("board-updated", gameState.board);
            } catch (err) {
            console.error("start-game error:", err);
            socket.emit("error", { message: "Failed to start game" });
            }
        });

        socket.on("cell-click", ({ row, col }) => {
            try {
            const res = updateBoard(row, col, username);

            if (res==="game-over") {
                io.emit("game-over", { loser: username });

            } else if (res==="game-won") {
                io.emit("game-won", { winner: username });
            } else if (res==="board-updated") {
                io.emit("board-updated", gameState.board);
            }
            } catch (err) {
                console.error("cell-click error:", err);
                socket.emit("error", { message: "Error updating board" });
            }
        });

        socket.emit("current-board", gameState.board);

        socket.emit("get-leaderboard", gameState.table.slice().sort((a, b) => b.moves - a.moves));

        socket.on("disconnect", () => {
            console.log(`User disconnected: ${username}`);
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

const generateBoard=(row,col,username)=>{
    for(let n=0;n<20;n++){
        let x=Math.floor(Math.random()*20)
        let y=Math.floor(Math.random()*10)
        while((x===row && y===col) || gameState.result[x][y]==-1){
            x=Math.floor(Math.random()*20)
            y=Math.floor(Math.random()*10)
        }
        gameState.result[x][y]=-1
        for(let i=x-1;i<=x+1;i++){
            for(let j=y-1;j<=y+1;j++){
                if(i>=0 && i<20 && j>=0 && j<10 && gameState.result[i][j]!=-1){
                    gameState.result[i][j]=gameState.result[i][j]+1;
                }
            }
        }
    }

    if(gameState.result[row][col]===0){
        const m = 20;
        const n = 10;

        const dx = [ -1, 0, 0, 1,-1,-1,1,1];
        const dy = [ 0, -1, 1, 0,-1,1,-1,1];

        const visited = Array.from({ length: m }, () => Array(n).fill(false));
        const queue= [];

        queue.push([row, col]);
        visited[row][col] = true;

        while (queue.length > 0) {
            const pos = queue.shift();
            if (!pos) continue;
            const [x, y] = pos;
            gameState.board[x][y] = gameState.result[x][y];

            if (gameState.result[x][y] === 0) {
                for (let i = 0; i < 8; i++) {
                    const nx = x + dx[i];
                    const ny = y + dy[i];
                    if (nx >= 0 && nx < m && ny >= 0 && ny < n && !visited[nx][ny]) {
                        queue.push([nx, ny]);
                        visited[nx][ny] = true;
                    }
                }
            }
        }
    }
    else gameState.board[row][col]=gameState.result[row][col];
    gameState.table.push({ user: username, moves: 1 });
}

const updateBoard=(row,col,username)=>{
    if(gameState.result[row][col]==-1){
        return "game-over"
    }
    else if(gameState.result[row][col]>0){
        gameState.board[row][col]=gameState.result[row][col]
        const existingPlayer = gameState.table.find(player => player.user === username);
        if (existingPlayer) {
            existingPlayer.moves += 1;
        } else {
            gameState.table.push({ user: username, moves: 1 });
        }

        const revealedCount = gameState.board.flat().filter(cell => cell !== 'B').length;
        if (revealedCount === 180) {
            return "game-won";
        }

        return "board-updated"
    }
    else{
        const existingPlayer = gameState.table.find(player => player.user === username);
        if (existingPlayer) {
            existingPlayer.moves += 1;
        } else {
            gameState.table.push({ user: username, moves: 1 });
        }
        
        const m = 20;
        const n = 10;

        const dx = [ -1, 0, 0, 1,-1,-1,1,1];
        const dy = [ 0, -1, 1, 0,-1,1,-1,1];

        const visited = Array.from({ length: m }, () => Array(n).fill(false));
        const queue= [];

        queue.push([row, col]);
        visited[row][col] = true;

        while (queue.length > 0) {
            const pos = queue.shift();
            if (!pos) continue;
            const [x, y] = pos;
            gameState.board[x][y] = gameState.result[x][y];

            if (gameState.result[x][y] === 0) {
                for (let i = 0; i < 8; i++) {
                    const nx = x + dx[i];
                    const ny = y + dy[i];
                    if (nx >= 0 && nx < m && ny >= 0 && ny < n && !visited[nx][ny]) {
                        queue.push([nx, ny]);
                        visited[nx][ny] = true;
                    }
                }
            }
        }
        
        const revealedCount = gameState.board.flat().filter(cell => cell !== 'B').length;
        if (revealedCount === 180) {
            return "game-won";
        }

        console.log("board:\n",gameState.board)
        return "board-updated"
    }
}