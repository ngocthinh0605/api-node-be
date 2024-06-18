'use strict'

const httpStatusCode = require("../configs/httpStatusCode")

class ErrorResponse extends Error{
    constructor(message,status){
        super(message)
        this.status = status
    }
}

class ConflictRequestError extends ErrorResponse{
    constructor(message = httpStatusCode.reasonPhrases.CONFLICT, statusCode = httpStatusCode.statusCode.CONFLICT){
        super(message, statusCode)
    }
}

class BadRequestError extends ErrorResponse{
    constructor(message = httpStatusCode.reasonPhrases.CONFLICT, statusCode = httpStatusCode.statusCode.CONFLICT){
        super(message, statusCode)
    }
}

class AuthFailureError extends ErrorResponse{
    constructor(message = httpStatusCode.reasonPhrases.UNAUTHORIZED, statusCode = httpStatusCode.statusCode.UNAUTHORIZED){
        super(message, statusCode)
    }
}

class NotFoundError extends ErrorResponse{
    constructor(message = httpStatusCode.reasonPhrases.NOT_FOUND, statusCode = httpStatusCode.statusCode.NOT_FOUND){
        super(message, statusCode)
    }
}

class ForbiddenError extends ErrorResponse{
    constructor(message = httpStatusCode.reasonPhrases.FAILED_DEPENDENCY, statusCode = httpStatusCode.statusCode.FAILED_DEPENDENCY){
        super(message, statusCode)
    }
}



module.exports = {
    ConflictRequestError,
    BadRequestError,
    AuthFailureError,
    NotFoundError,
    ForbiddenError
}