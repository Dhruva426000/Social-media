import User from '../model/user.model.js';
import bcrypt from 'bcryptjs';
import { generateTokenAndSetCookie } from '../lib/utils/generateToken.js';
export const signup =async(req, res) => {
    try{
        const {fullname, username, email, password} = req.body;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)){
            return res.status(400).json({ error: 'Please enter a valid email address' });
        }
        const existingUser = await User.findOne({username});
        if(existingUser){
            return res.status(400).json({ error: 'Username already taken' });
        }
        const existingEmail = await User.findOne({email});
        if(existingEmail){
            return res.status(400).json({ error: 'Email already registered' });
        }
        //hash password
        if(!password || password.length < 6){
            return  res.status(400).json({ error: 'Password must be at least 6 characters long' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({
            fullName: fullname,
            username: username,
            email: email,
            password: hashedPassword,
        });
        if(newUser){
            generateTokenAndSetCookie(newUser._id, res);
            await newUser.save();
            res.status(201).json({ 
                _id: newUser._id,
                fullName: newUser.fullName,
                username: newUser.username,
                email: newUser.email,
                followers: newUser.followers,
                following: newUser.following,
                profileImg: newUser.profileImg,
                coverImg: newUser.coverImg,
             });
        }
        else{
            res.status(400).json({ error: 'Invalid user data' });
        }


    }
    catch(err){
        console.log("Error in signup:", err);
        res.status(500).json({ error: 'Internal server error' });
    }
}
export const login =async(req, res) => {
    try{
        const{username, password} = req.body;
        const user = await User.findOne({username});
        if(!user){
            return res.status(400).json({ error: 'Invalid username or password' });
        }
        const isMatch = await bcrypt.compare(password, user?.password ||'');
        if(!user ||  !isMatch){
            return res.status(400).json({ error: 'Invalid username or password' });
        }
        generateTokenAndSetCookie(user._id, res);
        res.status(200).json({ 
            _id: user._id,
            fullName: user.fullName,
            username: user.username,
            email: user.email,
            followers: user.followers,
            following: user.following,
            profileImg: user.profileImg,
            coverImg: user.coverImg,
         });
    }
    catch(err){
        console.log("Error in login:", err);
        res.status(500).json({ error: 'Internal server error' });
    }
}
export const logout =async(req, res) => {
    try{
        res.clearCookie("jwt", {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'strict',
        });
        res.status(200).json({ message: 'Logged out successfully' });
    }
    catch(err){
        console.log("Error in logout:", err);
        res.status(500).json({ error: 'Internal server error' });
    }
}
export const getMe =async(req, res) => {
    try{
        const user = req.user;
        if(!user){
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(user);
    }
    catch(err){
        console.log("Error in getCurrentUser:", err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

