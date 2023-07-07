const ErrorHander = require("../utils/ErrorHander");

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "internal server error";

  // Wrong mongodb id error
  if (err.name === "CastError") {
    const message = `Resource not found.invalid:${err.path}`;
    err = new ErrorHander(message, 400);
  }

  //mongooes duplicate key error
  if (err.code == 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue)} Entered`;
    err = new ErrorHander(message, 400);
  }

  // Wrong jwt error
  if (err.name === "JsonWebTokenError") {
    const message = `Json web token is invalid try again`;
    err = new ErrorHander(message, 400);
  }
  // Wrong Expire error
  if (err.name === " ") {
    const message = `Json web token is Expire try again`;
    err = new ErrorHander(message, 400);
  }

  res.status(err.statusCode).json({
    success: false,
    error: err.stack,
    message: err.message,
  });
};
