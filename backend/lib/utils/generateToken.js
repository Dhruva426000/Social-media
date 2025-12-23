import jwt from 'jsonwebtoken';

export const generateTokenAndSetCookie = (userId,res) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: '7d',
    });
    res.cookie("jwt", token, {
        maxAge: 7*24*60*60*1000, // 7 days
        httpOnly: true,//prevent client side js to access the cookie
        secure: process.env.NODE_ENV !== 'development', //cookie only sent over https in production
        sameSite: 'strict',//mitigate CSRF attacks
    }
    )
}
