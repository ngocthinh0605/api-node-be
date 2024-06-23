'use strict'

const { SuccessResponse } = require("../core/success.response")
// const ProductService = require('../services/product.service.copy')
const ProductServiceV2 = require('../services/product.service')
class ProductController {

    //POST
    createProduct = async (req,res,next)=>{
        // new SuccessResponse({
        //     message: 'Create new Product successfully!',
        //     metadata: await ProductService.createProduct(req.body.product_type, {
        //         ...req.body,
        //         product_shop: req.user.userId
        //     })
        // }).send(res)

        new SuccessResponse({
            message: 'Create new Product successfully!',
            metadata: await ProductServiceV2.createProduct(req.body.product_type, {
                ...req.body,
                product_shop: req.user.userId
            })
        }).send(res)
    }

    //update product
    updateProduct = async (req,res,next)=>{
        // new SuccessResponse({
        //     message: 'Create new Product successfully!',
        //     metadata: await ProductService.createProduct(req.body.product_type, {
        //         ...req.body,
        //         product_shop: req.user.userId
        //     })
        // }).send(res)

        new SuccessResponse({
            message: 'updateProduct Product successfully!',
            metadata: await ProductServiceV2.updateProduct(req.body.product_type,req.params.productId,{
                ...req.body,
                product_shop: req.user.userId
            })
        }).send(res)
    }


    //end update


    publicProductById = async (req,res,next)=>{
        new SuccessResponse({
            message: 'Public new Product successfully!',
            metadata: await ProductServiceV2.publicProductByShop( {
                product_id: req.params.id,
                product_shop: req.user.userId
            })
        }).send(res)
    }

    unPublicProductById = async (req,res,next)=>{
        new SuccessResponse({
            message: 'UnPublic new Product successfully!',
            metadata: await ProductServiceV2.unPublicProductByShop( {
                product_id: req.params.id,
                product_shop: req.user.userId
            })
        }).send(res)
    }

    //QUERY 
    //comment for api
    // /** */
    /**
     * @desc get all Drafts for shop
     * @param {String} product_shop 
     * @param {Number} limit 
     * @param {Number} skip 
     * @return { JSON }
     */
    getAllDraftsForShop = async (req, res, next) =>{
        new SuccessResponse({
            message: 'Get all draft Product list successfully!',
            metadata: await ProductServiceV2.findAllDraftsForShop({product_shop: req.user.userId})
        }).send(res)
    }

      /**
     * @desc get all Drafts for shop
     * @param {String} product_shop 
     * @param {Number} limit 
     * @param {Number} skip 
     * @return { JSON }
     */
    getAllPublicsForShop = async (req, res, next) =>{
        new SuccessResponse({
            message: 'Get all publics Product list successfully!',
            metadata: await ProductServiceV2.findAllPublicsForShop({product_shop: req.user.userId})
        }).send(res)
    }

    getListSearchProduct = async (req, res, next) =>{
        new SuccessResponse({
            message: 'Get list search Product by keySearch',
            metadata: await ProductServiceV2.searchProductByUser(req.params)
        }).send(res)
    }


    findAllProducts = async (req, res, next) =>{
        new SuccessResponse({
            message: 'Get findAllProducts successfully',
            metadata: await ProductServiceV2.findAllProducts(req.query)
        }).send(res)
    }

    findProductById = async (req, res, next)=>{
        console.log('params', req.params);
        new SuccessResponse({
            message: 'Get detail product successfully',
            metadata: await ProductServiceV2.findProductById({product_id: req.params.product_id, unSelect: req.body.unSelect})
        }).send(res)
    }
    
    //END QUERY

}

module.exports = new ProductController()