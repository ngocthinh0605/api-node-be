'use strict'

const _ = require('lodash')
const { Types } = require('mongoose')
const getInfoData = ({fields = [], object = {}})=>{
    return _.pick(object,fields)
}

const getSelectData = (select = []) =>{
    return Object.fromEntries(select.map(el=> [el, 1]))
}

const getUnSelectData = (select = []) =>{
    return Object.fromEntries(select.map(el=> [el, 0]))
}
const removeUndefineObject = obj => {
    Object.keys(obj).forEach(k =>{
        if(obj[k] == null ){
            delete obj[k]
        }
    })
    return obj
}
/*
    const a = {
        b: 1,
        c: 2
        d: {
            e: 3
        }
    }

    db.collection.updateOne({
        d.e: 3
    })
*/
const updateNestedObjectParser = obj =>{
    const final = {}
    console.log('[1]::: ',final);
    Object.keys(obj || []).forEach(k =>{
        if( typeof obj[k] === 'object'  && !Array.isArray(obj[k])){
            const response = updateNestedObjectParser( obj[k])
            Object.keys(response || {}).forEach(a => {
                final[`${k}.${a}`] = response[a]
            })
        }else{
            final[k] = obj[k]
        }
    })

    console.log('[2]::: ',final);

    return final
}
const convertToObjectMongodb = id => {
    return new Types.ObjectId(id)
}

module.exports = {
    getInfoData,
    getSelectData,
    getUnSelectData,
    removeUndefineObject,
    updateNestedObjectParser,
    convertToObjectMongodb
}