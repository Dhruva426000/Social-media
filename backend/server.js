import express from 'express';
import authRoutes from './routes/auth.routes.js';
import dotenv from 'dotenv';
import connectDB from  './db/connection.js';


dotenv.config();

const PORT=process.env.PORT || 8000;
const app = express();
app.get('/', (req, res) => {
  res.send('Hello World!');
});
app.use("/api/auth",authRoutes);

app.listen(PORT, () => {
  console.log('Server is running on port http://localhost:'+PORT);
  connectDB();
});