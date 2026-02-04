import {prisma} from "../lib/prisma.js";
import bcrypt from "bcryptjs";
import signUpSchema from "../schema/signUpSchema.validation.js";
import logInSchema from "../schema/loginSchema.validations.js";
import * as z from "zod";
import ApiResponse from "../utils/ApiResponse.js";
import { generateHashedPassword , comparePassword } from "../utils/password.utils.js";
import { generateAccessToken , generateRefreshToken} from "../utils/tokens.util.js";
import { ref } from "node:process";
const signUpController = async(req,res) => {
    const {name , password ,email} = req.body;

    try {

        // validating user input
        const validatingUserInput = await signUpSchema.safeParse({
            name : name.toLowerCase(),
            email,
            password
        })


        if(!validatingUserInput.success) {
            const pretty = z.prettifyError(validatingUserInput.error);
            return res.status(400).json(new ApiResponse(400,"Validation Error",pretty));
        }

        // checking if the user already exists
        const existingUser = await prisma.user.findUnique({
            where : {
                email
            }
        });



        if(existingUser){
            return res.status(400).json(new ApiResponse(400,"User already exists","Unable to signup"));
        }

        
        
        // hashing password before storing in db        
        const hashedPassword = await generateHashedPassword(password);
        if(!hashedPassword) return res.status(500).json({msg : "Unable to process password"});    
       
        

        

        const newUser = await prisma.user.create({
        data : {
            name,
            email,
            password : hashedPassword
        },
        select : {
           id : true,
           name : true,
           email : true 
        }
    });

    if(!newUser) return res.status(400).json({msg : "Unable to signup at the moment"});

    return res.status(201).json({
        newUser
    });
        
    } catch (error) {
        console.log("error",error);
        return res.status(400).json({"err" : "Unable to signup"});        
    }
    
}


const loginController = async (req,res) => {
    const {email , password} = req.body;
    try {
        const logInValidation = await logInSchema.safeParse({
            email,
            password            
        });

        if(!logInValidation.success) {
            const pretty = z.prettifyError(logInValidation.error);
            return res.status(400).json(new ApiResponse(400,"Validation Error",pretty));
        }


        // checking if the user exists or not
        const existingUser = await prisma.user.findUnique({
            where :{
                email
            }
        });

        if(!existingUser){
            return res.status(404).json(new ApiResponse(404,"User not found","Unable to login"));
        }

        const isPasswordValid = await comparePassword(password,existingUser.password);

        if(!isPasswordValid){
            return res.status(401).json(new ApiResponse(400,"Invalid Credentials","Unable to login"));
        }



        // generating tokens for the user
        const payload = {
            id : existingUser.id,
            email : existingUser.email
        };


        // access token is for short term and refresh token would be storedin db for long term
        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        // hashing the refresh token before storing in db
        const hashedRefreshToken = await bcrypt.hash(refreshToken,10);
        if(!hashedRefreshToken) return res.status(500).json(new ApiResponse(500,"Internal Server Error:refresh hasherror","Unable to login"));


        // saving refresh token in db
        const updatedUser = await prisma.user.update({
            where : {
                id : existingUser.id
            },
            data : {
                refreshToken : hashedRefreshToken
            }
        });

        if(!updatedUser) return res.status(500).json(new ApiResponse(500,"Internal Server Error:refresh token","Unable to login"));

        res.cookie("refreshToken",refreshToken,{
            httpOnly:true,
            secure : process.env.NODE_ENV === "production",
            sameSite : "strict",
            maxAge : 7 * 24 * 60 * 60 * 1000 // 7 days
        })

        res.cookie("accessToken",accessToken,{
            httpOnly:true,
            secure : process.env.NODE_ENV === "production",
            sameSite : "strict",
            maxAge : 1*24 * 60 * 1000 // 1 day
        }

        )

        return res.status(200).json(
            new ApiResponse(200,"Login Successful",
                accessToken
            )            
        );
    } catch (error) {
        console.log("error",error);
        return res.status(500).json(new ApiResponse(500,"Internal Server Error","Unable to login"));   
    }
}




export {signUpController, loginController};