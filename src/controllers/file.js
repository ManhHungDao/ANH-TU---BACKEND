import ErrorHandler from "../utils/errorHandler";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";

exports.createFile = catchAsyncErrors(async (req, res, next) => {});
exports.uploadFile = catchAsyncErrors(async (req, res, next) => {});
exports.getDetailFile = catchAsyncErrors(async (req, res, next) => {});
exports.updateFile = catchAsyncErrors(async (req, res, next) => {});
exports.deleteFile = catchAsyncErrors(async (req, res, next) => {});
exports.downloadFile = catchAsyncErrors(async (req, res, next) => {});
