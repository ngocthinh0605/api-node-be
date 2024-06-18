'use strict'
const apiKeyModule = require('../models/apikey.model')
const crypto = require('crypto')
const findById = async (key)=>{
    // const newKey = await apiKeyModule.create({key: crypto.randomBytes(64).toString('hex'),permissions:['0000']})
    // console.log({newKey});
    const objectKey = await apiKeyModule.findOne({key, status: true}).lean()
    console.log({objectKey});
    return objectKey
}

module.exports = {
    findById
}