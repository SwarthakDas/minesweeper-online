import dbConnect from "@/lib/dbConnect"
import Game from "@/models/Game"

export async function GET(request:Request){
    await dbConnect()

    try {
        const {searchParams}=new URL(request.url)
        const queryParam={gameId:searchParams.get('gameId')}
        const gameId=queryParam.gameId?.toString()
        const game=await Game.findById(gameId)
        const board=game?.board
        return Response.json({
            success:true,
            message: "Current game fetched successfully",
            board
        },{status:201})
    } catch (error) {
        console.log("error getting board ",error)
        return Response.json({
            success:false,
            message:"error getting board"
        },{status:500})
    }
}