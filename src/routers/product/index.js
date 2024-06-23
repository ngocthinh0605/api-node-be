'use strict'

const express = require('express')
const productController = require('../../controllers/product.controller')
const { asyncHandle } = require('../../auth/checkAuth')
const {  authenticationV2 } = require('../../auth/authUtils')
const router = express.Router()


router.get('/search/:keySearch',asyncHandle(productController.getListSearchProduct))
router.get('',asyncHandle(productController.findAllProducts))
router.get('/:product_id',asyncHandle(productController.findProductById))

//authentication
router.use(authenticationV2)

router.post('',asyncHandle(productController.createProduct))
router.patch('/:productId',asyncHandle(productController.updateProduct))
router.post('/public/:id',asyncHandle(productController.publicProductById))

// Query
router.get('/drafts/all',asyncHandle(productController.getAllDraftsForShop))
router.get('/publics/all',asyncHandle(productController.getAllPublicsForShop))



module.exports = router