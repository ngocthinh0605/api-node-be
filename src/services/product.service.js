'use strict'

const { model } = require('mongoose')
const { BadRequestError } = require('../core/error.response')
const {clothing,electronic,product,furniture} = require('../models/product.model')
const { findAllDraftsForShop, publicProductByShop, findAllPublicsForShop, unPublicProductByShop, searchProductByUser, findAllProducts, findProductById , updateProductById} = require('../models/repositories/product.repo')
const { removeUndefineObject, updateNestedObjectParser } = require('../utils')
const { insertInventory } = require('../models/repositories/inventory.repo')
// factory patten
//define Factory class to create product
class ProductFactory {
      /*
        type: 'Clothing',
        */
    //key-class
    //productRegistry{ "electronics" : electronicClass}
    static productRegistry = {}

    static registerProductType(type, classRef){
        ProductFactory.productRegistry[type] = classRef
    }

    static async createProduct(type, payload){
        const productClass = ProductFactory.productRegistry[type]
        if(!productClass){
            throw new BadRequestError(`Invalid product types ${type}`)
        }
        return new productClass(payload).createProduct()
        // switch (type) {
        //     case "Electronics":
        //         return new Electronic(payload).createProduct()

        //     case "Clothing":
        //         return new Clothing(payload).createProduct()
                    
        //     default:
        //         throw new BadRequestError(`Invalid product types ${type}`)
        // }

    }

    //update product

    static async updateProduct(type,productId ,payload){
        const productClass = ProductFactory.productRegistry[type]
        if(!productClass){
            throw new BadRequestError(`Invalid product types ${type}`)
        }
        return new productClass( payload ).updateProduct(productId) // pass payload to set constructor
    }

    //put
    static async publicProductByShop({product_shop, product_id}){
        return await publicProductByShop({product_shop, product_id})
    }
    static async unPublicProductByShop({product_shop, product_id}){
        return await unPublicProductByShop({product_shop, product_id})
    }
    //end put

    //query
    static async findAllDraftsForShop({product_shop, limit = 0, skip = 0}){
        const query = {product_shop, isDraft: true}
        return await findAllDraftsForShop({query, limit, skip})
    }

    static async findAllPublicsForShop({product_shop, limit = 0, skip = 0}){
        const query = {product_shop, isPublic: true}
        return await findAllPublicsForShop({query, limit, skip})
    }

    static async searchProductByUser({keySearch}){
        return await searchProductByUser({keySearch})
    }

    static async findAllProducts({limit = 50, sort = 'ctime', page = 1, filter={isPublic: true} , select= ['product_name','product_price','product_thumb','product_shop']}){
        return await findAllProducts({limit, sort, page , filter, select})
    }

    static async findProductById({product_id, unSelect = ["createdAt","updatedAt","__v"]}){
        return await findProductById({product_id,unSelect})
    }
       

}

/*
   product_name: { type: String, required: true },
    product_thumb: { type: String, required: true },
    product_description: String,
    product_price: { type: Number, required: true },
    product_quantity: { type: Number, required: true },
    product_type: { type: String, required: true, enum: ['Electronics', 'Clothing', 'Furniture']},
    product_shop: {type: Schema.Types.ObjectId, ref: 'Shop'}, 
    product_attributes: {type: Schema.Types.Mixed, required: true}
*/

class Product {
    constructor({
        product_name, product_thumb, product_description, product_price, 
        product_quantity, product_type, product_shop, product_attributes
    }){
        this.product_name = product_name
        this.product_thumb = product_thumb
        this.product_description = product_description
        this.product_price = product_price
        this.product_quantity = product_quantity
        this.product_type = product_type
        this.product_shop = product_shop
        this.product_attributes = product_attributes
    }

    //create new product
    async createProduct(product_id){
        const newProduct = await product.create({
            ...this,
            _id: product_id
        })
        if(newProduct){
            //add inventory here
            await insertInventory({
                productId: newProduct._id,
                shopId: this.product_shop,
                stock: this.product_quantity,
            })
        }
        return newProduct
    }

    // update Product
    async updateProduct(productId, payload){
        return await updateProductById({productId,payload, model: product})
    }
}

// Define sub-class for different product types Clothing
class Clothing extends Product{

    async createProduct(){
        const newClothing = await clothing.create({
            ...this.product_attributes,
            product_shop: this.product_shop

        })
        if(!newClothing){
            throw new BadRequestError('create new Clothing error')
        }
        const newProduct = await super.createProduct(newClothing._id)
        if(!newProduct) {
            throw new BadRequestError('Create new product Error')
        }
        return newProduct
    }

    async updateProduct(productId){
        // verify payload null, undefine or empty
        //1. remove attr has null, undeffine or empty
        // console.log(`[this]: `,this);
        const objectParams = removeUndefineObject(this)  // this = properties
        // console.log(`[objectParams]: `,objectParams);

        //2 check where is updated

        if(objectParams.product_attributes){
            //update child
            await updateProductById({
                productId,
                payload: removeUndefineObject(updateNestedObjectParser(objectParams.product_attributes)),
                model: clothing
            })
        }

        const updateProduct = await super.updateProduct(productId, removeUndefineObject(updateNestedObjectParser(objectParams)))
        return updateProduct
    }
}

// Define sub-class for different product types Electronic
class Electronic extends Product{

    async createProduct(){
        const newElectronic = await electronic.create({
            ...this.product_attributes,
            product_shop: this.product_shop
        })
        if(!newElectronic){
            throw new BadRequestError('create new electronic error')
        }
        const newProduct = await super.createProduct(newElectronic?._id)
        if(!newProduct) {
            throw new BadRequestError('Create new electronic Error')
        }
        return newProduct
    }

    async updateProduct(productId){
        // verify payload null, undefine or empty
        //1. remove attr has null, undeffine or empty
        const objectParams = this

        //2 check where is updated

        if(objectParams.product_attributes){
            //update child
            await updateProductById({productId,objectParams,model: electronic})
        }

        const updateProduct = await super.updateProduct(productId, objectParams)
        return updateProduct
    }
}

// Define sub-class for different product types Electronic
class Furniture extends Product{

    async createProduct(){
        const newFurniture = await furniture.create({
            ...this.product_attributes,
            product_shop: this.product_shop
        })
        if(!newFurniture){
            throw new BadRequestError('create new electronic error')
        }
        const newProduct = await super.createProduct(newFurniture?._id)
        if(!newProduct) {
            throw new BadRequestError('Create new electronic Error')
        }
        return newProduct
    }

    async updateProduct(productId){
        // verify payload null, undefine or empty
        //1. remove attr has null, undeffine or empty
        const objectParams = this

        //2 check where is updated

        if(objectParams.product_attributes){
            //update child
            await updateProductById({productId,objectParams,model: furniture})
        }

        const updateProduct = await super.updateProduct(productId, objectParams)
        return updateProduct
    }
}

//register product type

ProductFactory.registerProductType('Electronics',Electronic)
ProductFactory.registerProductType('Clothing',Clothing)
ProductFactory.registerProductType('Furniture',Furniture)



module.exports = ProductFactory