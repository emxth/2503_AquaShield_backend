import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv';
dotenv.config();
import connectDB from './config/mongodb.js'

// Routes
import speciesRoutes from "./routes/speciesRoutes.js";
import speciesRequestRoutes from "./routes/speciesRequestRoutes.js";

// console.log("Mongo URI:", process.env.MONGODB_URL);  
//app config
const app = express()
app.use(cors());

app.use(express.json());

const port = process.env.PORT || 8081
connectDB()


// Routes
app.use("/species", speciesRoutes);
app.use("/speciesRequest", speciesRequestRoutes);


// Example protected routes (keep these if you need them)
// app.get('/api/private', auth, (req, res) => {
//   res.json({ success: true, data: 'Protected route accessed' });
// });

// app.get('/api/admin', adminAuth, (req, res) => {
//   res.json({ success: true, data: 'Admin route accessed' });
// });

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});