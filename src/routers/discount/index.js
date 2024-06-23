'use strict'

const express = require('express')
const { asyncHandle } = require('../../auth/checkAuth')
const {  authenticationV2 } = require('../../auth/authUtils')
const discountController = require('../../controllers/discount.controller')
const router = express.Router()

router.post('/amount',asyncHandle(discountController.getDiscountAmount))
router.get('/list_products_code',asyncHandle(discountController.getAllDiscountCodesWithProduct))
//authentication
router.use(authenticationV2)
router.post('', asyncHandle(discountController.createDiscountCode))
router.get('', asyncHandle(discountController.getAllDiscountCodeByShop))


module.exports = router