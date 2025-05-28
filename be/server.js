import express from "express"
import cors from "cors"
import 'dotenv/config'
import bodyParser from "body-parser"
import {connectDB} from "./config/db.js";
import userRouter from "./routes/userRoute.js"
import packageRouter from "./routes/packageRoute.js"
import membershipRouter from "./routes/membershipRoute.js";
import equipmentRouter from "./routes/equipmentRoute.js";
import feedbackRouter from "./routes/feedbackRoute.js";
import statisticRouter from "./routes/statisticRoute.js";


// app config
const app = express()
const port = process.env.PORT

// middleware
app.use(express.json())
app.use(cors())

// connect db
connectDB()

// call API
app.use("/api/user",userRouter)
app.use("/api/package",packageRouter)
app.use("/api/membership", membershipRouter);
app.use("/api/equipment", equipmentRouter);
app.use("/api/feedbacks", feedbackRouter);
app.use("/api/statistics", statisticRouter);


app.get("/",(req,res)=>{
    res.send("Hello World")
})

app.listen(port, () => {
    console.log(`Server started on port http://localhost:${port}`)
})