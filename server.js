import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import dotenv from "dotenv";
import { connect } from 'mongoose';
import bodyParser from 'body-parser';

// Routes
import adminRouter from './routes/adminRoute.js';
import userRouter from './routes/userRoute.js';
import feoRouter from './routes/feoRoute.js';
import speciesRoutes from "./routes/speciesRoutes.js";
import speciesRequestRoutes from "./routes/speciesRequestRoutes.js";
import { reportRouter } from "./routes/reportRoutes.js";

// App config
const app = express();
const port = process.env.PORT || 8081;
connectDB()
connectCloudinary()
dotenv.config();

// Middlewares
app.use(express.urlencoded({ extended: true }));
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
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${port}`);
});
