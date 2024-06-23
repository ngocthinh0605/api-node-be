'use strict'
const { SuccessResponse } = require("../core/success.response")
const CartService = require("../services/cart.service")

class CartController {

    /**
     * 
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    getCartByUser = async (req,res,next)=>{
        new SuccessResponse({
            message: 'getCartByUser successfully!',
            metadata: await CartService.getCartByUser(req.query)
        }).send(res)
    }

    //add to cart
    addToCart = async (req,res,next)=>{
        new SuccessResponse({
            message: 'addToCart successfully!',
            metadata: await CartService.addToCart(req.body)
        }).send(res)
    }

    //update quantity
    update = async (req,res,next)=>{
        new SuccessResponse({
            message: 'update successfully!',
            metadata: await CartService.addToCartV2(req.body)
        }).send(res)
    }

    //delete
    delete = async (req,res,next)=>{
        new SuccessResponse({
            message: 'delete successfully!',
            metadata: await CartService.deleteUserCart(req.body)
        }).send(res)
    }

}


module.exports = new CartController()