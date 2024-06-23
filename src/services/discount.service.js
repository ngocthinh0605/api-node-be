'use strict'

const { Types } = require("mongoose")
const { BadRequestError, NotFoundError } = require("../core/error.response")
const { discount } = require("../models/discount.model")
const { findAllDiscountCodesUnSelect, checkDiscountExits } = require("../models/repositories/discount.repo")
const { findAllProducts } = require("../models/repositories/product.repo")
const { convertToObjectMongodb } = require("../utils")

/*
    Discount services
    1 - Generator Discount Code [Shop | Admin]
    2 - Get Discount Amount [User]
    3 - Get all discount codes [user | shop]
    4 - verify discount code [user]
    5 - delete discount code [admin | shop]
    6 - cancel discount code [user]
*/

class DiscountService {
    static async createDiscountCode(payload){
        const {
            code, start_date, end_date, is_active,
            shopId, min_order_value, product_ids, applies_to, 
            name, description, type, value, max_value, max_uses,
            uses_count, max_uses_per_user, users_used
        } = payload

        //Check value payload

        if(new Date(start_date) < new Date()){
            throw new  BadRequestError('Start date must be greater than today!')
        }
        if(new Date(end_date) < new Date()){
            throw new BadRequestError('End date must be greater than today!')
        }
        if(new Date(start_date) >= new Date(end_date)){
            throw new BadRequestError('End date must be greater than start date!')
        }

        if(new Date() > new Date(start_date) || new Date() > new Date(end_date)){
            throw new BadRequestError('Discount code has expired!')
        } 

        //create index for discount code

        const foundDiscount = await discount.findOne({
            discount_code: code,
            discount_shopId: convertToObjectMongodb(shopId)
        }).lean()

        if(foundDiscount && foundDiscount.discount_is_active){
            throw new BadRequestError('Discount exits!')
        }
       
        const newDiscount = discount.create({
            discount_name: name,
            discount_description: description,
            discount_type: type,
            discount_value: value,
            discount_code: code,
            discount_start_date: start_date,
            discount_end_date: end_date,
            discount_max_uses: max_uses,
            discount_uses_count: uses_count ,
            discount_users_used: users_used,
            discount_max_uses_per_user: max_uses_per_user,
            discount_min_order_value: min_order_value,
            discount_shopId: shopId,
            discount_is_active: is_active ,
            discount_applies_to: applies_to,
            discount_product_ids: applies_to === 'all' ? [] : product_ids
        })
        return newDiscount
    }

    static async updateDiscountCode(){
        // to do
    }

    /*
    Get All discount codes available with products
    ---> 1 discount code thuoc n products
    3. 
     */
    // get products by code thuộc shop
    static async getAllDiscountCodesWithProduct({
        code, shopId, limit, page
    }){
        //get products belong to this Shop
        //create index for discount
        const foundDiscount = await discount.findOne({
            discount_code: code,
            discount_shopId: convertToObjectMongodb(shopId)
        }).lean()
        if(!foundDiscount || !foundDiscount.discount_is_active){
            throw new NotFoundError('Discount not exits!')
        }

        const {discount_product_ids, discount_applies_to} = foundDiscount

        let products
        if(discount_applies_to === "all"){
            //get all product
            products = await findAllProducts({
                filter:{
                    product_shop: convertToObjectMongodb(shopId),
                    isPublic: true
                },
                limit: +limit, // covert to number
                page: +page,
                sort: 'ctime',
                select:['product_name']
            })
        }
        if(discount_applies_to === "specific"){
            //get discount_product_ids
            products = await findAllProducts({
                filter:{
                    _id: {$in: discount_product_ids},
                    isPublic: true
                },
                limit: +limit, // covert to number
                page: +page,
                sort: 'ctime',
                select:['product_name']
            })
        }
        return products
    }

    // 1 shop -> n discount codes
    // get discount by shop
    static async getAllDiscountCodeByShop({
        limit, page, shopId
    }){
        const discounts = await findAllDiscountCodesUnSelect({
            limit: +limit,
            page: +page,
            filter:{
                discount_shopId: convertToObjectMongodb(shopId),
                discount_is_active: true
            },
            unSelect: ['__v'],
            model: discount
        })
        return discounts
    }

    // Apply discount code 
    /*
        product=[{
            productId,
            shopId,
            quantity,
            name,
            price
        },{
            productId,
            shopId,
            quantity,
            name,
            price
        }]
    */

    static async getDiscountAmount({
        shopId,codeId,userId, products
    }){
        const foundDiscount = await checkDiscountExits({model: discount, filter: {
            discount_code: codeId,
            discount_shopId: convertToObjectMongodb(shopId)
        }})

        console.log({foundDiscount});

        if(!foundDiscount){
            throw new NotFoundError('Discount does not exits !!')
        }

        console.log({foundDiscount});

        const { 
            discount_applies_to,_id,createdAt,discount_code,
            discount_description,discount_end_date,discount_is_active,
            discount_max_uses,discount_max_uses_per_user,discount_min_order_value,
            discount_name,discount_product_ids,
            discount_start_date,discount_type,discount_users_used,
            discount_uses_count,discount_value,updatedAt,discount_shopId
        } = foundDiscount

        if(!discount_is_active){
            throw new NotFoundError('Discount is not active !!')
        }

        if(!discount_max_uses){
            throw new NotFoundError('Discount are out !!')
        }

        if(new Date() > new Date(discount_end_date)){
            throw new NotFoundError('Discount expired !!')
        }

        // check if this discount has min order value,
        let totalOrder = 0
        if(discount_min_order_value > 0){
            //get total order
            console.log('get total order');
            totalOrder = products.reduce((acc, product)=> {
                return acc + (product.quantity * product.price)
            },0)
            console.log({totalOrder});
            if(totalOrder < discount_min_order_value){
                throw new NotFoundError(`TotalOrder requires a minium order value of ${discount_min_order_value}`)
            }
            console.log({totalOrder2: totalOrder});
        }

        if(discount_max_uses_per_user > 0){
            const totalUserUsedForDiscount = discount_users_used.filter(user => user === userId)
            if(totalUserUsedForDiscount && totalUserUsedForDiscount >= discount_max_uses_per_user){
                throw new NotFoundError('You can not continue this Discount !, you have used up the allowed limit.')

            }
        }
        
        // check type of discount

        const disCountAmount = discount_type === 'fixed_amount' ? discount_value : totalOrder * (discount_value / 100)

        return {
            totalOrder,
            disCountAmount,
            totalPrice: totalOrder - disCountAmount
        }


    }


    // delete 
    /*
     không phải xóa hẳng trong trong db 
     - Xóa đem qua 1 bản khác để hoàn tác
     - sort delete
    */

    static async deleteDiscountByCode({codeId, shopId}){
        const foundDiscount = checkDiscountExits({model: discount, filter: {
            discount_code: codeId,
            discount_shopId: convertToObjectMongodb(shopId)
        }})
        if(!foundDiscount){
            throw NotFoundError('Discount does not exits!!')
        }

        const deletedDiscount = await discount.findByIdAndDelete(foundDiscount._id,{
            discount_shopId: shopId
        })

        if(!deletedDiscount){
            throw NotFoundError('Somethings went wrong when delete !!')
        }

        return deletedDiscount
     }

    /*
    Cancel discount by code 
    */
    static async cancelDiscountByCode({codeId, shopId, userId}){
        const foundDiscount = checkDiscountExits({model: discount, filter:{
            discount_code: codeId,
            discount_shopId: shopId,
        }})
        if(!foundDiscount){
            throw NotFoundError('Discount does not exits!!')
        }

        const result = await discount.findByIdAndUpdate(foundDiscount._id,{
            $pull:{ // remove
                discount_users_used: userId
            },
            $inc:{
                discount_max_uses: 1,
                discount_uses_count: -1
            }
        })
        return result
    }
}

module.exports = DiscountService