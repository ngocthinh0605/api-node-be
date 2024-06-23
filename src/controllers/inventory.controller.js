'use strict'

const { SuccessResponse } = require("../core/success.response")
const InventoryService = require("../services/inventory.service")

class InventoryController{
    /**
     * 
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    addStockToInventory = async (req,res,next)=>{
        new SuccessResponse({
            message: 'addStockToInventory successfully!',
            metadata: await InventoryService.addStockToInventory(req.body)
        }).send(res)
    }
}

module.exports = new InventoryController()