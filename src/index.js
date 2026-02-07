import express from "express";
const app = express();
import dotenv from "dotenv";
import cors from "cors";
import userRouter from "../routes/user.routes.js";
import cookieParser from "cookie-parser";
dotenv.config({
    path : "src/index.js"
});
app.use(cors({
    origin: "http://localhost:3000", // your frontend URL
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

const PORT = process.env.PORT || 5000;


app.use(cookieParser())
app.use(express.json());

app.use('/api/v1/user',userRouter);


app.listen(PORT , () => {
    console.log(`Server started at PORT ${PORT}`);
})
