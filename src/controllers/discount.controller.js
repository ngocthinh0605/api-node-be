'use strict'

const { SuccessResponse } = require("../core/success.response")
const DiscountService = require("../services/discount.service")

class DiscountController {
    //Create a Discount code
    createDiscountCode = async (req,res,next)=>{
        new SuccessResponse({
            message: 'Create discount code successfully!',
            metadata: await DiscountService.createDiscountCode({
                ...req.body,
                shopId: req.user.userId
            })
        }).send(res)
    }

    getAllDiscountCodeByShop = async (req,res,next)=>{
        new SuccessResponse({
            message: 'getAllDiscountCodeByShop successfully!',
            metadata: await DiscountService.getAllDiscountCodeByShop({
                ...req.query,
                shopId: req.user.userId
            })
        }).send(res)
    }

    getAllDiscountCodesWithProduct = async (req,res,next)=>{
        new SuccessResponse({
            message: 'getAllDiscountCodesWithProduct successfully!',
            metadata: await DiscountService.getAllDiscountCodesWithProduct({
                ...req.query,
            })
        }).send(res)
    }

    getDiscountAmount = async (req,res,next)=>{
        new SuccessResponse({
            message: 'getDiscountAmount successfully!',
            metadata: await DiscountService.getDiscountAmount({
                ...req.body,
            })
        }).send(res)
    }

    // deleteDiscountByCode = async (req,res,next)=>{
    //     new SuccessResponse({
    //         message: 'deleteDiscountByCode successfully!',
    //         metadata: await DiscountService.deleteDiscountByCode({
    //             ...req.query,
    //             shopId: req.user.userId
    //         })
    //     }).send(res)
    // }

    // cancelDiscountByCode = async (req,res,next)=>{
    //     new SuccessResponse({
    //         message: 'deleteDiscountByCode successfully!',
    //         metadata: await DiscountService.cancelDiscountByCode({
    //             ...req.query,
    //             shopId: req.user.userId
    //         })
    //     }).send(res)
    // }

}

module.exports = new DiscountController()