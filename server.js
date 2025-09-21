import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import adminRouter from './routes/adminRoute.js';
import userRouter from './routes/userRoute.js';
import feoRouter from './routes/feoRoute.js';
import dotenv from "dotenv";
import { connect } from 'mongoose';
//import { json } from 'body-parser';
import bodyParser from 'body-parser';
import { reportRouter } from "./routes/reportRoutes.js";



// App config
const app = express();
const PORT = process.env.PORT || 8081;
connectDB()
connectCloudinary()
dotenv.config();

// Database Connection
connect(process.env.MONGODB_URL)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middlewares
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

// Api endpoints
app.use('/api/admin',adminRouter);
app.use('/api/user',userRouter);
app.use('/api/feo',feoRouter);
app.use('/api/report', reportRouter);

app.get('/',(req,res)=>{
  res.send('API Working')
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.listen(PORT, ()=> console.log("Server Started",port));
