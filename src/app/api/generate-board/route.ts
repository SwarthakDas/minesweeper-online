import dbConnect from "@/lib/dbConnect";
import Game from "@/models/Game";

export async function POST(request:Request){
    await dbConnect()

    try {
        const {row,col,username}=await request.json()
        const result = Array.from({ length: 20 }, () => Array(10).fill(0));
        const board = Array.from({ length: 20 }, () => Array(10).fill('B'));

        for(let n=0;n<20;n++){
            let x=Math.floor(Math.random()*20)
            let y=Math.floor(Math.random()*10)
            while((x===row && y===col) || result[x][y]==-1){
                x=Math.floor(Math.random()*20)
                y=Math.floor(Math.random()*10)
            }
            result[x][y]=-1
            for(let i=x-1;i<=x+1;i++){
                for(let j=y-1;j<=y+1;j++){
                    if(i>=0 && i<20 && j>=0 && j<10 && result[i][j]!=-1){
                        result[i][j]=result[i][j]+1;
                    }
                }
            }
        }

        if(result[row][col]===0){
            const m = 20;
            const n = 10;

            const dx = [ -1, 0, 0, 1];
            const dy = [ 0, -1, 1, 0];

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
        }
        else board[row][col]=result[row][col];
        
        const game=new Game({
            result,
            board,
            table:[{
                user:username,
                moves:1
            }],
        })
        await game.save()
        console.log("result:\n",result)
        console.log("board:\n",board)
        return Response.json({
            success:true,
            message: "Board generated successfully",
        },{status:201})
    } catch (error) {
        console.log("error generating board ",error)
        return Response.json({
            success:false,
            message:"error generating board"
        },{status:500})
    }
}