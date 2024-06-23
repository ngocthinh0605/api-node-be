'use strict'
const JWT = require('jsonwebtoken')
const asyncHandle = require('../helpers/asyncHandler')
const { AuthFailureError, NotFoundError } = require('../core/error.response')
const { findByUserId } = require('../services/keyToken.service')
const HEADER = {
    API_KEY : 'x-api-key',
    CLIENT_ID: 'x-client-id',
    AUTHORIZATION : 'authorization',
    REFRESH_TOKEN: 'x-rtoken-id'
}
const createTokenPair = async (payload, publicKey, privateKey)=>{
    try {
        //access token
        const accessToken = await JWT.sign(payload, publicKey,{
            // algorithm: 'RS256',
            expiresIn: '2 days'
        })

        const refreshToken = await JWT.sign(payload, privateKey,{
            // algorithm: 'RS256',
            expiresIn: '7 days'
        })

        //verify
        
        JWT.verify(accessToken, publicKey, (err,decode)=>{
            if(err){
                console.log('error verify::',err);
            }else{
                console.log('decode verify:: ',decode);
            }
        })

        return { accessToken, refreshToken}

    } catch (error) {
        
    }
}
const authentication = asyncHandle(async (req,res,next)=>{
    console.log({reqHeaders: req.headers});
    // 1: check userId missing ??? 
    // 2: get access token
    // 3: verify token
    // 4: check user in dbs
    // 5: check keyStores with this userId
    // 6: ALL OKE = > return next()
    const userId = req.headers[HEADER.CLIENT_ID]
    console.log({reqHeadersuserId: userId});
    if(!userId){
        throw new AuthFailureError('Invalid Request')
    }

    //2 
    const keyStores = await findByUserId(userId)
    console.log({keyStores});
    if(!keyStores){
        throw new NotFoundError('Not found keyStores')
    }

    //3 
    const accessToken = req.headers[HEADER.AUTHORIZATION]

    if(!accessToken){
        throw new AuthFailureError('Invalid AUTHORIZATION Request')
    }

    try {
        const decodeUser = JWT.verify(accessToken, keyStores.publicKey)
        console.log({decodeUser});
        if(userId !== decodeUser.userId){
            throw new AuthFailureError('Invalid user')
        }
        req.keyStores = keyStores
        return next()
    } catch (error) {
            throw error
        }
})

const authenticationV2 = asyncHandle(async (req,res,next)=>{
    console.log({reqHeaders: req.headers});
    // 1: check userId missing ??? 
    // 2: get access token
    // 3: verify token
    // 4: check user in dbs
    // 5: check keyStores with this userId
    // 6: ALL OKE = > return next()
    const userId = req.headers[HEADER.CLIENT_ID]
    console.log({reqHeadersuserId: userId});
    if(!userId){
        throw new AuthFailureError('Invalid Request')
    }

    //2 
    const keyStores = await findByUserId(userId)
    console.log({keyStores});
    if(!keyStores){
        throw new NotFoundError('Not found keyStores')
    }

    //3 
    if(req.headers[HEADER.REFRESH_TOKEN]){
        try {
            const refreshToken = req.headers[HEADER.REFRESH_TOKEN]
            const decodeUser = JWT.verify(refreshToken, keyStores.privateKey)
            console.log({decodeUser});
            if(userId !== decodeUser.userId){
                throw new AuthFailureError('Invalid user')
            }
            req.keyStores = keyStores
            req.user = decodeUser
            req.refreshToken = refreshToken
            return next()
        } catch (error) {
            throw error
        }
    }

    const accessToken = req.headers[HEADER.AUTHORIZATION]

    if(!accessToken){
        throw new AuthFailureError('Invalid AUTHORIZATION Request')
    }

    try {
        const decodeUser = JWT.verify(accessToken, keyStores.publicKey)
        console.log({decodeUser});
        if(userId !== decodeUser.userId){
            throw new AuthFailureError('Invalid user')
        }
        req.keyStores = keyStores
        req.user = decodeUser
        req.accessToken = accessToken
        return next()
    } catch (error) {
        throw error
    }
})



const verifyJWT = async (token, keySecret)=>{
        return JWT.verify(token, keySecret)
    }




module.exports ={
    createTokenPair,
    authentication,
    verifyJWT,
    authenticationV2
}