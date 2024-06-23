'use strict'

const { BadRequestError } = require("../core/error.response")
const { inventory } = require("../models/inventory.model")
const { getProductById } = require("../models/repositories/product.repo")

class InventoryService {
    static async addStockToInventory({
        productId,
        stock,
        shopId,
        location= '123, trần phú, hcm city'
    }){
        const foundProduct = await getProductById(productId)
        if(!foundProduct){
            throw BadRequestError('Product not found')
        }

        const query = {
            inven_shopId: shopId,
            invent_productId: productId
        }
        const updateSet = {
            $inc: {
                inven_stock: stock
            },
            $set : {
                inven_location: location
            }
        }
        const options = {
            upsert: true,
            new: true
        }

        return await inventory.findOneAndUpdate(query, updateSet,options)
    }

}

module.exports =  InventoryService