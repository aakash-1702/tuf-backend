import express from "express";
const app = express();
import dotenv from "dotenv";
import cors from "cors";
import userRouter from "../routes/user.routes.js";
import cookieParser from "cookie-parser";
dotenv.config({
    path : "src/index.js"
});
app.use(cors());

const PORT = process.env.PORT || 5000;


app.use(express.json());

app.use('/api/v1/user',userRouter);


app.listen(PORT , () => {
    console.log(`Server started at PORT ${PORT}`);
})
