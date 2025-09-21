import express from 'express'
import { addfeo,allFEOs,loginAdmin } from '../controllers/adminController.js'
import upload from '../middlewares/multer.js'
import authAdmin from '../middlewares/authAdmin.js'

const adminRouter = express.Router()

adminRouter.post('/add-feo',authAdmin,
    upload.fields([
        {name: 'photo',maxCount:1},
        {name: 'officeId',maxCount:1}
    ]),
    addfeo
)

adminRouter.post('/login',loginAdmin)
adminRouter.post('/all-feos',authAdmin,allFEOs)

export default adminRouter