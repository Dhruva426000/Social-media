import express from 'express';
import authRoutes from './routes/auth.routes.js';
import dotenv from 'dotenv';
import connectDB from  './db/connection.js';
import cookieParser from 'cookie-parser';


dotenv.config();

const PORT=process.env.PORT || 8000;
const app = express();
app.use(express.urlencoded({ extended: true }));//to parse form data
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth",authRoutes);

app.listen(PORT, () => {
  console.log('Server is running on port http://localhost:'+PORT);
  connectDB();
});