import express from 'express'
import { getFEOProfile, createFEO, updateFEOProfile, getAllFEOs } from '../controllers/feoController.js'
import authFEO from '../middlewares/authFEO.js'


const feoRouter = express.Router()

feoRouter.post('/login',createFEO)
feoRouter.get('/profile',authFEO,getFEOProfile)
feoRouter.put('/update-profile',authFEO,updateFEOProfile)
feoRouter.get('/all', authFEO, getAllFEOs)

export default feoRouter