import dbConnect from "@/lib/dbConnect"
import Game from "@/models/Game"

export async function GET(){
    await dbConnect()

    try {
        const game = await Game.findOne().sort({ createdAt: -1 });
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