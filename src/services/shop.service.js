'use strict'

const shopModel = require("../models/shop.model")

const findByEmail = async ({email, select = {
email: 1, password: 2, name: 1, status: 1, roles: 1
} })=>{
    return await shopModel.findOne({email}).select(select).lean()
}

// .lean(): Trả về một đối tượng JavaScript thuần túy, không phải là một đối tượng Mongoose, giúp truy vấn nhanh hơn khi không cần các tính năng của Mongoose như các phương thức instance.

module.exports = {
    findByEmail
}