'use strict'

const express = require('express')
const {  authenticationV2 } = require('../../auth/authUtils')
const asyncHandle = require('../../helpers/asyncHandler')
const inventoryController = require('../../controllers/inventory.controller')
const router = express.Router()

router.use(authenticationV2)
router.post('', asyncHandle(inventoryController.addStockToInventory))


module.exports = router