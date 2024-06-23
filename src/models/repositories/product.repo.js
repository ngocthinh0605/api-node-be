'use strict'

const { Types } = require('mongoose')
const {clothing,electronic,furniture,product} = require('../../models/product.model')
const { getSelectData, getUnSelectData, convertToObjectMongodb } = require('../../utils')
const findAllDraftsForShop = async ({query, limit, skip})=>{
    return await queryProduct({query, limit, skip})
}

const findAllPublicsForShop = async ({query, limit, skip})=>{
    return await queryProduct({query, limit, skip})
}

const searchProductByUser =  async ({keySearch}) =>{
    const regexSearch = new RegExp(keySearch)
    const results = await product.find({
        isPublic: true,
        $text: {
            $search: regexSearch,
        }
    },{
        score: {
            $meta: 'textScore'
        }
    }).sort({
        score: {
            $meta: 'textScore'
        }
    }).lean()

    return results
}

const publicProductByShop = async ({product_shop, product_id})=>{
    const foundShop = await product.findOne({
        product_shop: new Types.ObjectId(product_shop),
        _id: new Types.ObjectId(product_id)
    })
    if(!foundShop) return null

    foundShop.isDraft = false
    foundShop.isPublic = true

    const { modifiedCount } = await foundShop.updateOne(foundShop)
    return modifiedCount
}

const unPublicProductByShop = async ({product_shop, product_id})=>{
    const foundShop = await product.findOne({
        product_shop: new Types.ObjectId(product_shop),
        _id: new Types.ObjectId(product_id)
    })
    if(!foundShop) return null

    foundShop.isDraft = true
    foundShop.isPublic = false

    const { modifiedCount } = await foundShop.updateOne(foundShop)
    return modifiedCount
}

const findAllProducts = async ({limit, sort, page , filter, select})=>{
    const skip = (page - 1) * limit
    const sortBy = sort === 'ctime' ? {_id: -1} : {_id: 1}
    const products = await product.find(filter)
        .sort(sortBy)
        .skip(skip)
        .limit(limit)
        .select( getSelectData(select) )
        .lean()
    return products
}

const findProductById = async ({product_id, unSelect})=>{
    console.log({product_id});
    const detailProduct = await product.findById(product_id).select(getUnSelectData(unSelect)).lean()
    return detailProduct
}

const updateProductById = async({productId, payload, model, isNew = true})=>{
    return await model.findByIdAndUpdate(productId,payload,{new: isNew})
}


const queryProduct = async ({query, limit, skip}) => {
    return await product.find(query).
        populate('product_shop', 'name email -_id')
        .sort({updateAt: -1})
        .skip(skip)
        .limit(limit)
        .lean()
        .exec()
}

const getProductById = async (productId) => await product.findById(convertToObjectMongodb(productId)).lean() 

const checkProductByServer = async ({products})=>{
    return await Promise.all(
        products.map(async (product) => {
            const foundProduct = await getProductById(product.productId)
            if(foundProduct){
                return {
                    productId: foundProduct._id,
                    price: foundProduct.product_price,
                    quantity: foundProduct.quantity
                }
            }
        } )
    )
}

module.exports = {
    findAllDraftsForShop,
    publicProductByShop,
    findAllPublicsForShop,
    unPublicProductByShop,
    searchProductByUser,
    findAllProducts,
    findProductById,
    updateProductById,
    getProductById,
    checkProductByServer
}