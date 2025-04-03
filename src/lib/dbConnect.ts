import mongoose from "mongoose";

const connection:{isConnected?:number}={}

async function dbConnect():Promise<void>{
    if(connection.isConnected){
        console.log("Already connected to database")
    }
    try {
        const db=await mongoose.connect(process.env.MONGO_URI || '')
        connection.isConnected=db.connections[0].readyState
        console.log("DB connected successfully")
    } catch (error) {
        console.log("Database connection failed. ",error)
        process.exit(1)
    }
}

export default dbConnect;