import dbConnect from "@/lib/dbConnect";
import Game from "@/models/Game";

export async function POST(request:Request){
    await dbConnect()

    try {
        const {row,col}=await request.json()
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
        
        const newGame=new Game({
            result:board,
            board,
            table:[],
        })
        await newGame.save()
        return Response.json({
            success:true,
            message: "Reply registered successfully",
            result
        },{status:201})
    } catch (error) {
        console.log("error generating board ",error)
        return Response.json({
            success:false,
            message:"error generating board"
        },{status:500})
    }
}