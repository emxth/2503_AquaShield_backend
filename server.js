import dotenv from "dotenv";

import express from 'express';
import { connect } from 'mongoose';
//import { json } from 'body-parser';
import bodyParser from 'body-parser';
import cors from 'cors';
import { reportRouter } from "./routes/reportRoutes.js";


// Routes
// .. Add your route imports here ..
// const userRoutes = require('./routes/users');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8081;

// Middleware
app.use(cors());
//app.use(json());
app.use(bodyParser.json());

// Database Connection
connect(process.env.MONGODB_URL)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
// .. Add your routes here ..
// app.use('/api/users', userRoutes);

app.use('/api/report', reportRouter);

// Example protected routes (keep these if you need them)
// app.get('/api/private', auth, (req, res) => {
//   res.json({ success: true, data: 'Protected route accessed' });
// });

// app.get('/api/admin', adminAuth, (req, res) => {
//   res.json({ success: true, data: 'Admin route accessed' });
// });

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});