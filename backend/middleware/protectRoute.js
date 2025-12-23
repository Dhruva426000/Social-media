import User from "../model/user.model.js";
import jwt from "jsonwebtoken";

export const protectRoute = async (req, res, next) => {
    try{
        const token = req.cookies.jwt;
        if(!token){
            return  res.status(401).json({ error: 'Not authorized, token missing' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if(!decoded || !decoded.userId){
            return res.status(401).json({ error: 'Not authorized, invalid token' });
        }
        const user = await User.findById(decoded.userId).select('-password');
        if(!user){
            return res.status(401).json({ error: 'Not authorized, user not found' });
        }
        req.user = user;
        console.log("protectRoute middleware passed, user:", user.username);
        next();//proceed to the next middleware or route handler
    }
    catch(err){
        console.log("Error in protectRoute middleware:", err);
        res.status(500).json({ error: 'Internal server error' });
    }
}