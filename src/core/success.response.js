'use strict'
const httpStatusCode = require("../configs/httpStatusCode")
class SuccessResponse {
    constructor({message, statusCode = httpStatusCode.statusCode.OK, reasonStatusCode = httpStatusCode.reasonPhrases.OK, metadata={}}){
        this.message = message || reasonStatusCode
        this.status = statusCode
        this.metadata = metadata
    }

    send(res,headers = {} ) {
        return res.status(this.status).json(this)
    }
}
class OK extends SuccessResponse{
    constructor({message, metadata}){
        super({message, metadata})
    }
}

class CREATED extends SuccessResponse{
    constructor({options,message, statusCode = httpStatusCode.statusCode.CREATED,reasonStatusCode = httpStatusCode.reasonPhrases.CREATED, metadata}){
        super({message, metadata,statusCode,reasonStatusCode})
        this.options = options
    }
}

module.exports = {
    OK,
    CREATED,
    SuccessResponse
}