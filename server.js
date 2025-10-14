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
// import { reportRouter } from "./routes/reportRoutes.js";
import favoriteRoutes from './routes/favoritesRoutes.js';
import passwordRouter from "./routes/passwordRoute.js";


// console.log("Mongo URI:", process.env.MONGODB_URL);  
//app config
const app = express()
app.use(cors());
import reportRouter from "./routes/reportRoutes.js";
import notifyRouter from './routes/notificationRoute.js';

// App config
// const app = express();
// const port = process.env.PORT || 8081;
// connectDB();

// dotenv.config();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(bodyParser.json());

const port = process.env.PORT || 8081
connectDB()
connectCloudinary()
dotenv.config();

// Api endpoints
app.use('/api/admin', adminRouter);
app.use('/api/user', userRouter);
app.use('/api/feo', feoRouter);
app.use('/api/report', reportRouter);
app.use("/api/species", speciesRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use("/api/password", passwordRouter);

// Species Management Routes
app.use("/species", speciesRoutes);
app.use("/speciesRequest", speciesRequestRoutes);
app.use('/api/notification', notifyRouter);

app.get('/', (req, res) => {
  res.send('API Working')
})

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// app.listen(port, '0.0.0.0', () => {
//   console.log(`Server running on http://0.0.0.0:${port}`);
// });
