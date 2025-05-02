import dbConnect from "@/lib/dbConnect"
import Game from "@/models/Game"

export async function GET(){
    await dbConnect()

    try {
        const game = await Game.findOne().sort({ createdAt: -1 });
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