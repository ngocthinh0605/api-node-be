'use strict'

const {Types, Schema, model} = require('mongoose'); // Erase if already required

const DOCUMENT_NAME = 'Order'
const COLLECTION_NAME = 'orders'


// Declare the Schema of the Mongo model
var orderSchema = new Schema({
    order_userId: {
        type: Number,
        required: true
    },
    /* 
        order_checkout:{
        totalPrice,
        totalApplyDiscount,
        feeShip
        }
    */
    order_checkout: {
        type: Object,
        default: {}
    },

    /*
    order_shipping: {
        street,
        city,
        state,
        country
    }
    */
    order_shipping:{
        type: Object,
        default: {}
    },

    order_payment:{
        type: Object,
        default: {}
    },
    order_products:{
        type: Array,
        required: true
    },
    order_trackingNumber:{
        type: String,
        default: '$000001112024'
    },
    order_status: {
        type: String,
        enum: ['pending','confirmed','shipped', 'cancelled', 'delivered'],
        default: 'pending'
    }

},{
    collection: COLLECTION_NAME,
    timestamps: {
        createdAt: 'createOn',
        updatedAt: 'updateOn'
    },
});

//Export the model
module.exports = model(DOCUMENT_NAME, orderSchema);