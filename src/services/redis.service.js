'use strict'

const { promisify } = require('util')
const redis = require('redis')
const { reservationInventory } = require('../models/repositories/inventory.repo')
const redisClient = redis.createClient()

const pExpire = promisify(redisClient.pExpire).bind(redisClient)
const setNxAsync = promisify(redisClient.setNX).bind(redisClient)

const acquireLock = async ({productId,quantity, cartId})=>{
    const key = `lock_v2024_${productId}`
    const retryTimes = 10;
    const expiredTime = 3000 //3s

    for (let i = 0; i < retryTimes; i++) {
        const result = await setNxAsync(key, expiredTime)
        console.log(`Result[1] :::`,result);
        if(result ===1 ){
            //thao tac inventory
            const isReservation = await reservationInventory({
                productId,
                quantity,
                cartId
            })
            if(isReservation.modifiedCount){
                await pExpire(key, expiredTime) //khoa lac quan owr day
                return key
            }
            return null
        }else{
            await new Promise((resolve)=> setTimeout(resolve,50))
        }
        
    }
}

const releaseLock = async keylock => {
    const delAsyncKey = promisify(redisClient.del).bind(redisClient)
    return await delAsyncKey(keylock)
}



module.exports = {
    acquireLock,
    releaseLock
}