const Patient = require('../models/patient');
//check if user is authenticated or not
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('./catchAsyncErrors');
const jwt = require('jsonwebtoken');

exports.isAuthunticatedUser = catchAsyncErrors( async(req, res, next)=>{
    const { token } = req.cookies;

    if(!token){
        return next(new ErrorHandler('Login first to access this resource.',401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.patient = await Patient.findById(decoded.id)
    next()
})
