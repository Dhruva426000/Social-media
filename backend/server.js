import express from 'express';
import authRoutes from './routes/auth.route.js';
import dotenv from 'dotenv';
import connectDB from  './db/connection.js';
import cookieParser from 'cookie-parser';
import userRoutes from './routes/user.route.js';
import {v2 as cloudinary} from 'cloudinary';
import postRoutes from './routes/post.route.js';
import notificationRoutes from './routes/notification.route.js';

dotenv.config();



cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
cloudinary.api.ping()
  .then(res => console.log("Cloudinary connected:", res))
  .catch(err => console.error("Cloudinary error:", err));


const PORT=process.env.PORT || 8000;
const app = express();
app.use(express.urlencoded({ extended: true }));//to parse form data
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use(express.json());
app.use(cookieParser());
app.use("/api/auth",authRoutes);
app.use("/api/users",userRoutes);
app.use("/api/posts",postRoutes);
app.use("/api/notifications",notificationRoutes);

app.listen(PORT, () => {
  console.log('Server is running on port http://localhost:'+PORT);
  connectDB();
});