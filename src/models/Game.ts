import mongoose from "mongoose";

const GameSchema=new mongoose.Schema({
    result:{
        type:[[Number]],
        required:true,
    },
    board:{
        type:[[String]],
        required:true,
    },
    table:[{
        user: { type:String, required:true },
        moves: { type:Number, required:true, default:0 }
    }],
    loser:{
        type:String,
        default:""
    }
})

const Game=mongoose.model("Game",GameSchema)
export default Game