import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import adminRouter from './routes/adminRoute.js'
import userRouter from './routes/userRoute.js'
import feoRouter from './routes/feoRoute.js'


//app config
const app = express()
const port = process.env.PORT || 8081
connectDB()
connectCloudinary()

//middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json())
app.use(cors())

//api endpoints
app.use('/api/admin',adminRouter)
app.use('/api/user',userRouter)
app.use('/api/feo',feoRouter)


app.get('/',(req,res)=>{
  res.send('API Working')
})

app.listen(port, ()=> console.log("Server Started",port))