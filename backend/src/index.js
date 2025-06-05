import express from "express"
import authRoutes from "./routes/auth.route.js"
import messageRoutes from "./routes/message.route.js"
import grammarRoutes from "./routes/grammar.js"
import cors from "cors"
import dotenv from "dotenv"
import { connectDB } from "./lib/db.js"
import cookieParser from "cookie-parser"
import { app, server } from "./lib/socket.js"
 import path from "path"

dotenv.config()


const PORT=process.env.PORT
const _dirname=path.resolve();

app.use(express.json())  
app.use(cookieParser())
app.use(cors({
    origin:"http://localhost:3000",
    credentials:true,
}))
app.use("/api/auth",authRoutes)
app.use("/api/messages",messageRoutes)
app.use("/api/grammar-check",grammarRoutes)
if( process.env.NODE_ENV==="production"){
    app.use(express.static(path.join(_dirname,"../frontend/build")))

    app.get("*",(req,res)=>{
        res.sendFile(path.join(_dirname,"..frontend","build","index.html"))
    })
}
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));


server.listen(PORT,()=>{
    console.log("Server is running on port "+PORT)
    connectDB()
});