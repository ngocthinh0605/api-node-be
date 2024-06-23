'use strict'

const express = require('express')
const accessController = require('../../controllers/access.controller')
const { asyncHandle } = require('../../auth/checkAuth')
const { authentication, authenticationV2 } = require('../../auth/authUtils')
const router = express.Router()

//signup
router.post('/shop/signup',asyncHandle(accessController.signUp))
//login
router.post('/shop/login',asyncHandle(accessController.login))

//authentication
router.use(authenticationV2)

router.post('/shop/handlerRefreshToken',asyncHandle(accessController.handlerRefreshToken))
router.post('/shop/logout',asyncHandle(accessController.logout))




module.exports = router