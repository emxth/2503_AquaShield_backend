import jwt from 'jsonwebtoken'

//feo authentication middleware
const authFEO = async (req,res,next)=>{
    try {
        const {dtoken} = req.headers
        if(!dtoken){
            return res.json({success: false, message: 'Not Authorized Login Again'})
        }
        const token_decode = jwt.verify(dtoken,process.env.JWT_SECRET)
        
        req.body.feoId = token_decode.id

        next()
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }

}

export default authFEO