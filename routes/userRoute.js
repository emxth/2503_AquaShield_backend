import express from 'express'
import { getUserProfile, updateUserProfile } from '../controllers/userController.js';
import { registerUser, loginUser } from '../controllers/authController.js'
import authUser from '../middlewares/authUser.js'
import upload from '../middlewares/multer.js'

const userRouter = express.Router()

userRouter.post('/register',registerUser)
userRouter.post('/login',loginUser)
userRouter.get('/get-profile',authUser,getUserProfile)
userRouter.put('/update-profile',upload.single('image'),authUser,updateUserProfile)


export default userRouter
