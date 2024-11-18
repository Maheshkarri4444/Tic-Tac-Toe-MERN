import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const protectRoute =  async(req,res,next)=>{
    try{
        const token = req.cookies.jwt;
        console.log("token in middle ware: ", token);
        if(!token){
            return res.status(401).json({error:"Unauthorized - No Token Provided"});
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if(!decoded){
            return res.status(401).json({error:"Unauthorized - Invalid Token"})
        }

        const user = await User.findById(decoded.userId);

        if(!user){
            return res.status(400).json({error: "User not found"});
        }
        req.user = user

        next();

    }catch(error){
        console.log("error in protectRoute middleware: ", error.message)
        res.status(500).json({error:"internal server error at protectingRoute"});
    }
}

export default protectRoute;