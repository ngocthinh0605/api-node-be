'use strict'

const {Types, model, Schema} = require('mongoose'); // Erase if already required
const DOCUMENT_NAME = 'Cart'
const COLLECTION_NAME = 'carts'

// Declare the Schema of the Mongo model
var cartSchema = new Schema({
    cart_state:{
        type: String,
        enum: ['active', 'completed', 'failed', 'pending'],
        default: 'active'
    },
    cart_products: {
        type: Array, 
        required: true,
        default: []
    },
    cart_count_product: {
        type: Number,
        default: 0
    },
    cart_userId:{
        type: Number,
        required: true,
    }
},
{
    collection: COLLECTION_NAME,
    timestamps:{
        createdAt: 'createOn',
        updatedAt: 'modifiedOn'
    }

});

//Export the model
module.exports = {
    cart: model(DOCUMENT_NAME, cartSchema)
}