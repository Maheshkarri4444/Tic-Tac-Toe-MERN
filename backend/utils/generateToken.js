import jwt from "jsonwebtoken";

const generateTokenAndSetCookie = (userId, res)=>{
    const token = jwt.sign({userId},process.env.JWT_SECRET,{
        expiresIn: '15d'
    })
    console.log("created token", token)
    res.cookie("jwt",token,{
        maxAge: 15 * 24 * 60 * 60 *1000,
        httpOnly:true,
        sameSite: 'none',
        secure: true,
        path: '/'
    })
}

export default generateTokenAndSetCookie;