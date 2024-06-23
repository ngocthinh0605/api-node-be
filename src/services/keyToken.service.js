'use strict'

const { Types: {ObjectId} } = require("mongoose")
const keytokenModel = require("../models/keytoken.model")

class KeyTokenService {
    static createKeyToken = async ({ userId, publicKey, privateKey, refreshToken})=>{
        try {
            // const publicKeyString = publicKey?.toString()
            //lv0
            // const tokens = await keytokenModel.create({
            //     user: userId,
            //     publicKey,
            //     privateKey
            // })


            // return tokens ? tokens.publicKey : null
            //lv xxx\
            const filter = {user: userId}, update = {
                publicKey, privateKey, refreshTokenUsed: [], refreshToken
            }

            const options = {upsert: true, new: true} // neu chua có ínert mới nếu có update

            const tokens = await keytokenModel.findOneAndUpdate(filter, update, options)

            return tokens ? tokens.publicKey : null
        } catch (error) {
            return error
        }
    }
    static findByUserId = async (userId) => {
        console.log({userId});
        return await keytokenModel.findOne({user:  new ObjectId(userId)})
    }

    static removeKeyById = async (id)=>{
        return await keytokenModel.deleteOne({_id:  new ObjectId(id)})
    }

    static findByRefreshTokenUsed = async (refreshToken) =>{
        return await keytokenModel.findOne({refreshTokensUsed: refreshToken}).lean()
    }

    static findByRefreshToken = async (refreshToken) =>{
        return await keytokenModel.findOne({refreshToken})
    }

    static deleteKeyById = async (userId)=>{
        return await keytokenModel.deleteOne({user: new ObjectId(userId)})
    }

}
module.exports = KeyTokenService