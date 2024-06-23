'use strict'

const express = require('express')
const {  authenticationV2 } = require('../../auth/authUtils')
const cartController = require('../../controllers/cart.controller')
const asyncHandle = require('../../helpers/asyncHandler')
const router = express.Router()

router.get('',asyncHandle(cartController.getCartByUser))
router.post('',asyncHandle(cartController.addToCart))
router.post('/update',asyncHandle(cartController.update))
router.post('/delete',asyncHandle(cartController.delete))


module.exports = router
