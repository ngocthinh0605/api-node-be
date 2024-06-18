'use strict'

//lev 0

const dev = {
    app: {
        port: process.env.DEV_APP_PORT || 3055
    },
    db:{
        host:  process.env.DEV_DB_HOST || '127.0.0.1',
        port:  process.env.DEV_DB_PORT || 27017,
        name:  process.env.DEV_DV_NAME || 'dbDev' //db dev
    }
}

//lv1
const pro = {
    app: {
        port:  process.env.PRO_APP_PORT || 3000
    },
    db:{
        host:  process.env.PRO_DB_PORT || '127.0.0.1',
        port:  process.env.PRO_DB_PORT || 27017,
        name:  process.env.PRO_DB_NAME || 'dbPro' // db prod
    }
}
const config = {dev,pro}
const env = process.env.NODE_ENV || 'dev'
console.log({config: config[env],env});
module.exports = config[env]