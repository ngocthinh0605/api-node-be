'use strict'

const { BadRequestError } = require("../core/error.response")
const orderModel = require("../models/order.model")
const { findCartById } = require("../models/repositories/cart.repo")
const { checkProductByServer } = require("../models/repositories/product.repo")
const { getDiscountAmount } = require("./discount.service")
const { acquireLock, releaseLock } = require("./redis.service")

class CheckoutService {
    // can login, or without login
    /*
       ** Payload **
        {
            cartId,
            userId,
            shop_orders_ids:[
                {   
                    shopId, 1
                    shop_discounts: [],
                    item_products:[
                        {
                            productId,
                            quantity,
                            price
                        },
                         {
                            productId,
                            quantity,
                            price
                        },
                    ]
                },
                 {   
                    shopId, 2
                    shop_discounts: [
                        {
                            codeId,
                            discount_id,
                            shopId
                        }
                    ],
                    item_products:[
                        {
                            productId,
                            quantity,
                            price
                        },
                    ]
                }
            ]
        }
    */
    static async checkoutReview({cartId,shop_orders_ids=[],userId}){
        console.log({cartId});
        //check cartId
        const foundCart = await findCartById(cartId)
        if(!foundCart){
            throw new BadRequestError('Cart not exits!')
        }
        console.log({foundCart});
        const checkout_order = {
            totalPrice: 0, //tong tien
            feeShip: 0, // phi van chuyen
            totalDiscount: 0, // tong khuyen mai
            totalCheckout: 0 , // tong thanh toan
        }
        const shop_order_ids_new = []

        for (let i = 0; i < shop_orders_ids.length; i++) {
            
            const { shopId, shop_discounts, item_products } = shop_orders_ids[i]
            console.log({item_products});
            // check product
            const checkProductServer = await checkProductByServer({products: item_products})
            if(!checkProductServer[0]){
                throw BadRequestError('Order something went wrong!!')
            }

            //tong tien don hang của user
            const checkoutPrice = item_products.reduce((acc, product)=> acc + (product.price * product.quantity), 0)

            checkout_order.totalPrice += checkoutPrice

            const itemCheckout = {
                shopId,
                shop_discounts,
                priceRaw: checkoutPrice,
                priceApplyDiscount: checkoutPrice,
                itemProducts: item_products
            }

            //check discount
            if(shop_discounts?.length > 0){
                //gia su chi co 1 discount
                // get amount discount
                const { totalPrice = 0, disCountAmount = 0, totalOrder = 0 } = await getDiscountAmount({codeId: shop_discounts[0].codeId, products: item_products, shopId, userId})
                checkout_order.totalDiscount += disCountAmount
                if(disCountAmount > 0){
                    itemCheckout.priceApplyDiscount = checkoutPrice - disCountAmount
                }
            
            }

            //tong thanh toan chuoi cung
            checkout_order.totalCheckout += itemCheckout.priceApplyDiscount
            shop_order_ids_new.push(itemCheckout)
        }
        return{
            shop_orders_ids,
            shop_order_ids_new,
            checkout_order: checkout_order
        }


       
    }

    //order
    static async orderByUser({
        shop_order_ids,
        cartId,
        userId,
        user_address = {},
        user_payment = {}
    }){

        const {checkout_order,shop_order_ids_new} = await CheckoutService.checkoutReview({
            cartId,
            shop_order_ids,
            userId
        })

        //check tồn kho
        const acquireProduct = []
        const products = shop_order_ids_new.flatMap(order=> order.itemProducts)
        console.log("[1] products", products);

        for (let i = 0; i < products.length; i++) {
            const {productId, quantity} = products[i];
            const keyLock = await acquireLock({
                productId,
                cartId,
                quantity
            })

            acquireProduct(keyLock ? true : false)

            if(keyLock){
                await releaseLock(keyLock)
            }
            
        }

        //if any product is out of stock
        if(acquireProduct.includes(false)){
            throw BadRequestError('Your product in cart maybe change stock,...')
        }

        const newOrder = await orderModel.create({
            order_userId: userId,
            order_checkout: checkout_order,
            order_shipping: user_address,
            order_payment: user_payment,
            order_products: shop_order_ids_new
        })

        //check if create successfully remove product in cart

        return newOrder
            
    }

    /**
     * query orders by user
     */
    static async getOrdersByUser(){

    }

    /**
     * query order by user
     */
    static async getOneOrderByUser(){

    }

     /**
     * cancel order by user
     */
     static async cancelOrderByUser(){

     }

     /**
     * update order status [shop / admin]
     */
     static async updateOrderStatusByShop(){

     }
    
    
}

module.exports = CheckoutService