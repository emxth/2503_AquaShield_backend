import express from 'express'
import { feoProfile, loginFEO, updateFeoProfile, allFEOsforFEO } from '../controllers/feoController.js'
import authFEO from '../middlewares/authFEO.js'


const feoRouter = express.Router()

feoRouter.post('/login',loginFEO)
feoRouter.get('/profile',authFEO,feoProfile)
feoRouter.put('/update-profile',authFEO,updateFeoProfile)
feoRouter.get('/all', authFEO, allFEOsforFEO)

export default feoRouter