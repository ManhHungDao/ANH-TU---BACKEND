const ErrorHandler = require('../utils/errorHandler');

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;


    if (process.env.NODE_ENV === 'development') {
        res.status(err.statusCode).json({
            success: false,
            error: err,
            errMessage: err.message,
            stack: err.stack
        })
    }

    if (process.env.NODE_ENV === 'PRODUCTION') {
        let error = { ...err }

        error.message = err.message;

        // Wrong mongoose object id
        if(err.name === 'CastError'){
            const message = `Resource not found. Invalid: ${err.path}`;
            error = new ErrorHandler(message, 400);
        }

        //Handling mongoose Validation ErrorHandler
        if(err.name === 'ValidationError'){
            const message = Object.values(err.errors).map(value => value.message);
            error = new ErrorHandler(message, 400);
        }

        //Handlign duplicate mongoose key erro
        if(err.code === 11000){
            const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
            error = new ErrorHandler(message,400)
        }

        //Handling wrong JWT erro
        if(err.name === 'JsonWebTokenError'){
            const message = `Json web is invalid`;
            error = new ErrorHandler(message, 400);
        }

        //Handling expire token ErrorHandler
        if(err.name === 'TokenExpiredError'){
            const message = `Token has been expired`;
            error = new ErrorHandler(message, 400);
        }

        res.status(error.statusCode).json({
            success: false,
            message: error.message || 'Internal Server Error'
        })
    }
}