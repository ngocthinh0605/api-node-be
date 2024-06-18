'use strict'

const express = require('express')
const { apiKey,permission } = require('../auth/checkAuth')
const router = express.Router()

// router.get('/',(req, res,next)=>{
//     // const strCompress = 'hello bro'
//     return res.status(500).json({
//         message: 'Wellcom to my chanal user',
//         // metadata: strCompress.repeat(1000)
//     })
// })
//check api key
router.use(apiKey)
router.use(permission('0000'))
//check perm

router.use('/v1/api',require('./access'))

module.exports = router