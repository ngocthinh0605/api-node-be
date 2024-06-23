'use strict'

const { CREATED, SuccessResponse } = require("../core/success.response");
const AccessService = require("../services/access.service");

class AccessController {


    handlerRefreshToken = async (req,res,next)=>{
        // V1
        // new SuccessResponse({
        //     message: 'Get Tokens Successfully!!',
        //     metadata: await AccessService.handlerRefreshToken(req.body.refreshToken)
        // }).send(res) 

        //V2 Fixed, no need accessToken
        console.log({req});
        new SuccessResponse({
            message: 'Get Tokens Successfully!!',
            metadata: await AccessService.handlerRefreshTokenV2({
                refreshToken: req.refreshToken,
                user: req.user,
                keyStores: req.keyStores
            })
        }).send(res) 
    }

    logout = async (req,res,next)=>{
        // console.log({req: req.body});
        new SuccessResponse({
            message: 'Logout success!',
            metadata: await AccessService.logout(req.keyStores)
        }).send(res)
    }

    login = async (req,res,next)=>{
        // console.log({req: req.body});
        new SuccessResponse({
            metadata: await AccessService.login(req.body)
        }).send(res)
    }
    
    signUp = async ( req, res, next )=>{
        try {
            // 200 oke
            // 2001 created
            new CREATED({
                message: "Registered OK!",
                metadata: await AccessService.signUp(req.body),
                options:{
                    limit: 100
                }
            }).send(res)
            // console.log(`[P]::signUp::`,req.body)
            // return res.status(201).json(await AccessService.signUp(req.body))
        } catch (error) {
            next(error)
        }
    }
}
module.exports = new AccessController()