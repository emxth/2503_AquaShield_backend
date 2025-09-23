import express from 'express'
import { addfeo,allFEOs,loginAdmin,getAllUsers } from '../controllers/adminController.js'
import upload from '../middlewares/multer.js'
import authAdmin from '../middlewares/authAdmin.js'

const adminRouter = express.Router()

adminRouter.post('/add-feo',authAdmin,upload.single('image'),addfeo)
adminRouter.post('/login',loginAdmin)
adminRouter.post('/all-feos',authAdmin,allFEOs)
adminRouter.get('/all-users', authAdmin, getAllUsers)


export default adminRouter