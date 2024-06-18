'use strict'

const _SECONDS = 5000
const mongoose = require('mongoose')
const os = require('os')
const process = require('process')
const countConnect =()=>{
    const numberConnection = mongoose.connections.length
    console.log(`number of connections:: ${numberConnection}`);

}

//check overload
const checkOverLoad = ()=>{
    setInterval(()=>{
    const numberConnection = mongoose.connections.length
    const numCores = os.cpus().length
    const memoryUsage = process.memoryUsage().rss
    //example maximum number of connections based on number of cores
    const maxConnections = numCores * 5
    console.log(`active connection:: ${numberConnection}`);
    console.log(`memory usage:: ${memoryUsage /1024 /1024} MB`);
    if(numberConnection > maxConnections){
        console.log(`connection overload`);
    }
    },_SECONDS)
}

module.exports ={
    countConnect,
    checkOverLoad
}