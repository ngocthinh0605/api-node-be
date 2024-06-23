'use strict'

const { NotFoundError } = require("../core/error.response")
const { cart } = require("../models/cart.model")
const { findProductById } = require("../models/repositories/product.repo")

/*
    key features: Cart service
    [[user]]
    - add product to cart [user]
    - reduce product quantity by one 
    - increase product quantity by one
    - get cart
    - delete cart
    - delete items
*/

class CartService {
    // REPO STARTS
    static async createUserCart({userId, product}){
        const query = { cart_userId: userId, cart_state: 'active' }
        const updateOrInsert = {
            /* 
            The $addToSet operator adds the product to the cart_products array, 
            but only if it does not already exist in the array. 
            This prevents duplicate entries for the same product.
            */
            $addToSet:{ 
                cart_products: product
            }
        }
        const options = {
            upsert: true, //upsert: true: If the cart does not exist, create a new one.
            new: true // new: true: Return the modified document rather than the original.
        }
        return await cart.findOneAndUpdate(query,updateOrInsert,options)
    }

    static async updateQuantityCart({userId, product}){
        const {productId, quantity} = product
        const query = { 
            cart_userId: userId,
            'cart_products.productId': productId,
            cart_state: 'active'
        }
        const updateSet = {
            $inc:{
                'cart_products.$.quantity': quantity // "$" đại diện cho product tìm được dựa trên productid, update đúng phần từ đó
            }
        }

        const options = {
            upsert: true, //upsert: true: If the cart does not exist, create a new one.
            new: true // new: true: Return the modified document rather than the original.
        }

        return await cart.findOneAndUpdate(query,updateSet,options)

        
    }
    //REPO END


    static async addToCart({ userId, product }){
        //check cart 
        const userCart = await cart.findOne({
            cart_userId: userId
        })

        if(!userCart){
            //create cart
            return await CartService.createUserCart({userId, product})
        }


        //if cart exits but product = []

        if(!userCart.cart_products.length){
            userCart.cart_products = [product]
            return await userCart.save()
        }

        return CartService.updateQuantityCart({userId, product})

    }

    //update cart
    /* 
        shop_order_ids[
            shopId,
            item_products:[
                productId,
                shopId,
                price,
                old_quantity,
                quantity
            ],
            version: //khoa bi quan, khoa lac quan, khoa phan tan
        ]
    */

    static async addToCartV2({userId, shop_order_ids=[]}){
        const { productId, quantity, old_quantity } = shop_order_ids?.[0]?.item_products?.[0]
        //check product
        const foundProduct = await findProductById({product_id: productId})
        if(!foundProduct){
            throw new NotFoundError('Product not found')
        }

        if(foundProduct.product_shop.toString() !== shop_order_ids?.[0]?.shopId){
            throw new NotFoundError('Product does not belong to this Shop')
        }

        if( quantity === 0){
            //delete product
        }

        return await CartService.updateQuantityCart({userId, product:{
            productId,
            quantity: quantity - old_quantity
        }})


    }

    static async deleteUserCart({userId, productId}){
        const query = { cart_userId: userId, cart_state: 'active' }
        const updateSet = {
            $pull:{ // pull to remove with id in array
                cart_products: {
                    productId
                }
            }
        }
        const deleteCart = await cart.updateOne(query,updateSet)
        return deleteCart
    }

    static async getCartByUser({userId}){
        console.log({userId});
        return await cart.findOne({
            cart_userId: +userId,
        }).lean()
    }
}

module.exports = CartService