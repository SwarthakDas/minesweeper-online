import dbConnect from "@/lib/dbConnect"
import Game from "@/models/Game"

export async function POST(request:Request){
    await dbConnect()

    try {
        const {row,col,username}=await request.json()
        const {searchParams}=new URL(request.url)
        const queryParam={gameId:searchParams.get('gameId')}
        const gameId=queryParam.gameId?.toString()
        const game=await Game.findById(gameId)
        const board=game?.board
        const result=game?.result
        if(!result || !board){
            return Response.json({
                success:true,
                message: "",
            },{status:500})
        }
        
        if(result[row][col]==-1){
            return Response.json({
                success:true,
                message: "Mine triggered. Game over.",
                loser:username,
            },{status:201})
        }
        else if(result[row][col]>0){
            board[row][col]=result[row][col]
            const existingPlayer = game.table.find(player => player.user === username);
            if (existingPlayer) {
                existingPlayer.moves += 1;
            } else {
                game.table.push({ user: username, moves: 1 });
            }

            const count = result.flat().filter(cell => typeof cell==='string' && cell === -1).length;
            if(count==10){
                return Response.json({
                    success:true,
                    message: "Game won",
                    winner:username
                },{status:201})
            }

            await game.save()
            return Response.json({
                success:true,
                message: "Board updated",
            },{status:201})
        }
        else{
            const existingPlayer = game.table.find(player => player.user === username);
            if (existingPlayer) {
                existingPlayer.moves += 1;
            } else {
                game.table.push({ user: username, moves: 1 });
            }
            
            const m = 20;
            const n = 10;

            const dx = [-1, -1, -1, 0, 0, 1, 1, 1];
            const dy = [-1, 0, 1, -1, 1, -1, 0, 1];

            const visited = Array.from({ length: m }, () => Array(n).fill(false));
            const queue:number[][] = [];

            queue.push([row, col]);
            visited[row][col] = true;

            while (queue.length > 0) {
                const [x, y] = queue.shift() ?? [];
                board[x][y] = result[x][y];

                if (result[x][y] === 0) {
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
            
            const count = result.flat().filter(cell => typeof cell==='string' && cell === -1).length;
            if(count==10){
                return Response.json({
                    success:true,
                    message: "Game won",
                    winner:username
                },{status:201})
            }

            await game.save()
            return Response.json({
                success:true,
                message: "Board updated",
            },{status:201})
        }
    } catch (error) {
        console.log("error getting board ",error)
        return Response.json({
            success:false,
            message:"error getting board"
        },{status:500})
    }
}