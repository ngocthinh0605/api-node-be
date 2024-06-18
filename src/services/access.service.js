'use strict'

const shopModel = require("../models/shop.model")
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const KeyTokenService = require("./keyToken.service")
const { createTokenPair, verifyJWT } = require("../auth/authUtils")
const { getInfoData } = require("../utils")
const { BadRequestError, AuthFailureError, ForbiddenError } = require("../core/error.response")
const { findByEmail } = require("./shop.service")

const RoleShop = {
    SHOP: 'SHOP',
    WRITER: 'WRITER',
    EDITOR: 'EDITOR',
    ADMIN: 'ADMIN'
}
class AccessService {

    static handlerRefreshToken = async (refreshToken)=>{
        // check xem token nay đã dc sử dụng chưa?
        const foundToken = await KeyTokenService.findByRefreshTokenUsed(refreshToken)
        if(foundToken){
            //decode xem may la ai
            const {userId, email } = await verifyJWT(refreshToken, foundToken.privateKey)
            console.log({userId, email});
            //delete all toke
            await KeyTokenService.deleteKeyById(userId)
            throw new ForbiddenError('Something wrong happened !! pls re-login')
        }

        //No 
        const holderToken = await KeyTokenService.findByRefreshToken(refreshToken)
        if(!holderToken){
            throw new AuthFailureError('Shop not registered!! 1')
        }

        // verify token 
        const { userId, email } = await verifyJWT(refreshToken, holderToken.privateKey)
        console.log('Holder token ===>',{userId, email});

        const foundShop = await findByEmail({email})
        if(!foundShop){
            throw new AuthFailureError('Shop not registered!! 2')
        }

        //create new tokens
        const tokens = await createTokenPair({userId, email}, holderToken.publicKey, holderToken.privateKey)

        //update new tokens

        await holderToken.updateOne({
            $set: {
                refreshToken: tokens.refreshToken
            },
            $addToSet: {
                refreshTokensUsed: refreshToken // used to get new tokens
            }
        })

        return {
            user: { userId, email },
            tokens
        }
    }

    static logout = async (keyStore)=>{
        const delKey = await KeyTokenService.removeKeyById(keyStore._id)
        console.log({delKey});
        return delKey
    }

    //refreshToken kiểm tra xem đã từng login chưa nếu có rồi thì xóa token cũ không cần truy vấn vào db
    // 1 check email trong db
    // 2 match password
    // 3 create AcToken and ReToken save in db
    // 4 generate tokens
    // 5 return data login

    static login = async ({email, password, refreshToken = null})=>{

        //1
        const foundShop = await findByEmail({email})
        console.log({foundShoppasword: foundShop.password});
        console.log({foundShop});
        if(!foundShop){
            throw new BadRequestError('Shop not registered!')
        }

        //2
        // const passwordHash = await bcrypt.hash(password,10)
        const match = bcrypt.compare(password, foundShop.password)
        
        if(!match){
            throw new AuthFailureError('Authentication Error')
        }

        //3
        //create private key and public key
        const  privateKey = crypto.randomBytes(64).toString('hex')
        const  publicKey = crypto.randomBytes(64).toString('hex')

        //4 create tokes
        const {_id: userId} = foundShop
        const tokens = await createTokenPair({userId,email}, publicKey, privateKey)
        
        await KeyTokenService.createKeyToken({
            refreshToken: tokens.refreshToken,
            privateKey, 
            publicKey,
            userId
        })

        return {
            metadata:{
                shop: getInfoData({fields: ['_id','name','email'], object: foundShop}),
                tokens
            }
        }
    }

    static signUp = async ({name, email, password})=>{
        // try {
            //step: 1 check email exits?
            const holderShop = await shopModel.findOne({email}).lean()
            if(holderShop){
                throw new BadRequestError('Error: Shop already registered')
            }
            //hash password and save in db
            const passwordHash = await bcrypt.hash(password,10)
            const newShop = await shopModel.create({name,email,password: passwordHash,roles:[RoleShop.SHOP]})
            if(newShop){
                //created privateKey and publicKey
                //prvKey => send user not save in system
                //public key verify token save in system
                
                // const { privateKey,publicKey } = crypto.generateKeyPairSync('rsa',{
                //     modulusLength:  4096,
                //     publicKeyEncoding:{
                //         type: 'pkcs1',
                //         format: 'pem'
                //     },
                //     privateKeyEncoding:{
                //         type: 'pkcs1',
                //         format: 'pem'
                //     }
                // })

                const  privateKey = crypto.randomBytes(64).toString('hex')
                const  publicKey = crypto.randomBytes(64).toString('hex')

                console.log({privateKey,publicKey}); // save collection KeyStore

                const keyStore = await KeyTokenService.createKeyToken({
                    userId: newShop._id,
                    publicKey,
                    privateKey
                })

                if(!keyStore){
                    throw new BadRequestError('Error: keyStore error')
                    // return {
                    //     code: 'xxxxxx',
                    //     message: 'keyStore errr'
                    // }
                }
                
                // const publicKeyObject = crypto.createPublicKey( publicKeyString )
                //create token pair
                // const tokens = await createTokenPair({userId: newShop._id,email},publicKeyString,privateKey)

                const tokens = await createTokenPair({userId: newShop._id,email},publicKey,privateKey)
                console.log('created token success:: ', tokens);
                
                return {
                    code: 201,
                    metadata:{
                        shop: getInfoData({fields: ['_id','name','email'],object: newShop}),
                        tokens
                    }
                }
                
            }
            return {
                code: 200,
                metadata: null
            }
        // } catch (error) {
            
        //     return {
        //         code: 'xxx',
        //         message: error.message,
        //         status: 'error'
        //     }
        // }
    }
}
module.exports = AccessService