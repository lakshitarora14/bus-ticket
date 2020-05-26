const jwt = require('jsonwebtoken')
const User = require('../models/user')
const Admin = require('../models/admin')
const authAdmin = async (req,res,next)=>{
    try{
        const token = req.header('Authorization').replace('Bearer ','')
        const decoded = jwt.verify(token,'secretkeyAdmin')
        const admin = await Admin.findOne({_id:decoded._id, token:token})

        if(!admin){
            throw new  Error()
        }
        req.admin = admin
        next()
    }
    catch(error){
        res.status(401).send({error:'Please Authenticate '})
    }
}

const authUser = async (req,res,next)=>{
    try{
        const token = req.header('Authorization').replace('Bearer ','')
        const decoded = jwt.verify(token,'secretkeyUser')
        const user = await User.findOne({_id:decoded._id, token:token})

        if(!user){
            throw new  Error()
        }
        req.user = user
        next()
    }
    catch(error){
        res.status(401).send({error:'Please Authenticate '})
    }
}

module.exports = {authAdmin,authUser}