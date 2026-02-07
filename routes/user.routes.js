import { Router } from "express";
const userRouter = Router();

import {
  signUpController,
  loginController,
  provideMyRole
} from "../controllers/user.controllers.js";
import isAuthenticated from "../middlewares/isAuthenticated.middleware.js";


// --------- routes for authenticating the user -------------
userRouter.post("/signup", signUpController);
userRouter.post("/login", loginController);

userRouter.get("/me", isAuthenticated, provideMyRole);

export default userRouter;
