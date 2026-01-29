import {Router} from "express";
const userRouter = Router();
import {signUpController , loginController} from "../controllers/user.controllers.js";


// --------- routes for authenticating the user -------------
userRouter.post('/signup',signUpController);
userRouter.post('/login',loginController);


export default userRouter;