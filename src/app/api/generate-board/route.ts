import dbConnect from "@/lib/dbConnect";
import Game from "@/models/Game";

export async function POST(request:Request){
    await dbConnect()

    try {
        const {row,col,username}=await request.json()
        const result=new Array(20).fill(new Array(10).fill(0))
        const board=new Array(20).fill(new Array(10).fill('B'))

        for(let n=0;n<10;n++){
            let x=(Math.random()*19)+1
            let y=(Math.random()*9)+1
            while((x==row && y==col) || result[x][y]=='x'){
                x=(Math.random()*19)+1
                y=(Math.random()*9)+1
            }
            result[x][y]='x'
            for(let i=x-1;i<=x+1;i++){
                for(let j=y-1;j<=y+1;j++){
                    if(i>=1 && i<20 && j>=1 && j<10 && result[i][j]!='x'){
                        result[i][j]=result[i][j]+1;
                    }
                }
            }
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

                if (result[x][y] === '0') {
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
        
        const game=new Game({
            result,
            board,
            table:[],
        })
        await game.save()

        const existingPlayer = game.table.find(player => player.user === username);
        if (existingPlayer) {
            existingPlayer.moves += 1;
        } else {
            game.table.push({ user: username, moves: 1 });
        }
        await game.save()
        return Response.json({
            success:true,
            message: "Reply registered successfully",
        },{status:201})
    } catch (error) {
        console.log("error generating board ",error)
        return Response.json({
            success:false,
            message:"error generating board"
        },{status:500})
    }
}