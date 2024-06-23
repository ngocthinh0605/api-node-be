'use strict'

const { findById } = require("../services/apikey.service")

const HEADER = {
    API_KEY : 'x-api-key',
    AUTHORIZATION : 'authorization'
}
const apiKey = async (req,res,next)=>{
    try {
        const key = req.headers[HEADER.API_KEY]?.toString()
        if(!key){
            return res.status(403).json({
                message: 'Forbidden error'
            })
        }
        //check objecKey
        const objectKey = await findById(key)
        if(!objectKey){
            return res.status(403).json({
                message: 'Forbidden error'
            })
        }

        req.objKey = objectKey
        return next()
    } catch (error) {
        
    }
}

const permission = (permission)=>{
    return (req,res,next)=>{
        if(!req.objKey){
            return res.status(403).json({
                message: 'permission denied'
            })
        }

        console.log("permission::: ",req.objKey.permissions);
        const validPermissions = req.objKey.permissions.includes(permission)
        if(!validPermissions){
            return res.status(403).json({
                message: 'permission denied'
            })
        }

        return next()
    }
}
const asyncHandle = fn =>{
    return(req,res,next)=>{
        fn(req,res,next).catch(next)
    }
}
module.exports = {
    apiKey,
    permission,
    asyncHandle
}