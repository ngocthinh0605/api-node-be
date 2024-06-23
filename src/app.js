require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const {default: helmet} = require('helmet')
const compression = require('compression')
const app = express()

//init middlewares

app.use(morgan("dev"))
app.use(helmet())
app.use(compression())
app.use(express.json())
app.use(express.urlencoded({extended: true}))

// console.log(process.env);

// morgan("combined")
// morgan("common")
// morgan("dev")
// morgan("short")
// morgan("tiny")

//init db
require('./dbs/init.mongodb')
// const { checkOverLoad } = require('./helpers/check.connect')
// checkOverLoad()

// init router
app.use('',require('./routers'))
// app.get('/',(req, res,next)=>{
//     const strCompress = 'hello bro'
//     return res.status(500).json({
//         message: 'Wellcom to my chanal',
//         metadata: strCompress.repeat(1000)
//     })
// })

//handle err sau --> router
app.use((req,res,next)=>{
    const error = new Error('Not Found')
    error.status = 404
    next(error)
})

app.use((error, req, res, next)=>{
    const statusCode = error.status || 500
    return res.status(statusCode).json({
        status: 'error',
        code: statusCode,
        stack: error.stack,
        message: error.message || "Internal server error"
    })
})

module.exports = app