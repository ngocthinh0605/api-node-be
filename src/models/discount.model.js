'use strict' //giam rò rỉ bộ nhớ trong nodejs

const {Types, model, Schema} = require('mongoose'); // Erase if already required
const DOCUMENT_NAME = 'Discount'
const COLLECTION_NAME = 'discounts'


// Declare the Schema of the Mongo model
var discountSchema = new Schema({
    discount_name:{
        type: String,
        required: true,
    },
    discount_description:{
        type: String,
        required: true,
    },
    discount_type: {
        type: String,
        default: 'fixed_amount' // percentage
    },
    discount_value:{ // 10.000, 10%
        type: Number,
        required: true,
    },
    discount_code:{
        type: String, 
        required: true,
    },
    discount_start_date:{
        type: Date,
        required: true
    },
    discount_end_date:{
        type: Date,
        required: true
    },
    discount_max_uses:{ // max number of apply discount
        type: Number,
        required: true,
    },
    discount_uses_count:{ // number of used discount
        type: Number,
        required: true,
    },
    discount_users_used:{ // list user used discount
        type: Array,
        default: []
    },
    discount_max_uses_per_user:{ // number of user can uses
        type: Number,
        required: true,
    },
    discount_min_order_value:{
        type: Number,
        required: true,
    },
    discount_shopId: {
        type: Schema.Types.ObjectId,
        ref: 'ShopDEV'
    },
    discount_is_active: {
        type: Boolean,
        default: true
    },
    discount_applies_to:{
        type: String,
        required: true,
        enum: ['all','specific']
    },
    discount_product_ids:{ // list of product can be discount
        type: Array,
        default: []
    }

},{
    collection: COLLECTION_NAME,
    timestamps: true //automatically adds 'createAt` and 'updateAt'
});

//Export the model
module.exports = {
    discount: model(DOCUMENT_NAME, discountSchema)
}