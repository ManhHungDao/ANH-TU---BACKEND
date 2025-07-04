// Create and send token and save in the cookies.
const sendToken = (user, statusCode, res) => {
  //create jwt token
  const token = user.getJwtToken();

  // option for cookies
  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIES_EXPIRATION_TIME * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  user.password = undefined;
  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
    user,
  });
};

module.exports = sendToken;
