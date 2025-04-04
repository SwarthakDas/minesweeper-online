import dbConnect from "@/lib/dbConnect"
import Game from "@/models/Game"

export async function GET(request:Request){
    await dbConnect()

    try {
        const {searchParams}=new URL(request.url)
        const queryParam={gameId:searchParams.get('gameId')}
        const gameId=queryParam.gameId?.toString()
        const game=await Game.findById(gameId)
        const leaderboard=game?.table?.slice().sort((a, b) => b.moves - a.moves);
        return Response.json({
            success:true,
            message: "Current leaderboard fetched successfully",
            leaderboard
        },{status:201})
    } catch (error) {
        console.log("error getting leaderboard ",error)
        return Response.json({
            success:false,
            message:"error getting leaderboard"
        },{status:500})
    }
}