import ErrorHandler from "../utils/errorHandler";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import nodemailer from "nodemailer";
import _ from "lodash";

exports.sendMail = catchAsyncErrors(async (req, res, next) => {
  const { to, subject, html } = req.body;
  if (!to) return next(new ErrorHandler("Required patient's email", 400));
  if (!subject) return next(new ErrorHandler("Required title email", 400));
  if (!html) return next(new ErrorHandler("Required message body email", 400));

  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  let mailOptions = {
    from: '"HealthCare" <daomanhhung1202@gmail.com>',
    to: to,
    subject: subject,
    html: html,
  };
  await transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).json({
        message: "Send mail faled",
        success: false,
      });
    }
  });
  res.status(200).json({
    message: "Send mail successfully",
    success: true,
  });
});
