'use strict'

const {Schema, model} = require('mongoose'); // Erase if already required
const DOCUMENT_NAME = 'Key'
const COLLECTION_NAME = 'Keys'
// Declare the Schema of the Mongo model
var KeyStoreSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'ShopDEV'
    },
    publicKey:{
        type: String,
        required: true
    },
    privateKey:{
        type: String,
        required: true
    },
    refreshTokensUsed: {
        type: Array,
        default: [] // nhung reToken da sử dụng
    },
    refreshToken: {
        type: String,
        required: true // thang dang su dung
    }
    // name:{
    //     type:String,
    //     trim: true,
    //     maxLength: 150
    // },
    // email:{
    //     type:String,
    //     unique:true,
    //     trim: true
    // },
    // password:{
    //     type:String,
    //     required:true,
    // },
},{
    timestamps: true, 
    collection: COLLECTION_NAME
});

//Export the model
module.exports = model(DOCUMENT_NAME, KeyStoreSchema);