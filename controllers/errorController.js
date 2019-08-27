const AppError = require('./../utils/appError');

const handleCastErrorDB = err => {
  const field = err.path === '_id' ? 'id' : err.path;
  const message = `Invalid ${field}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFields = err => {
  // const field = err.path === '_id' ? 'id' : err.path;
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0].replace(/"/g, "'");
  const message = `The value ${value} has already been used.`;
  console.log(message);
  return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);

  const message = `Invalid input data. ${errors.join('. ')}.`;
  return new AppError(message, 400);
};

const sendError = (res, err, statusCode, status, statusMessage) =>
  res.status(statusCode || err.statusCode).json({
    status: status || err.status,
    error: err,
    message: statusMessage || err.message,
    stack: err ? err.stack : undefined
  });

const sendErrorDev = sendError;

const sendErrorProd = (res, err) => {
  if (err.isOperational) {
    console.error('ERROR:', err.message);
    sendError(res, undefined, err.statusCode, err.status, err.message);
  } else {
    sendError(res, undefined, err.statusCode, err.status, 'Something were very wrong!');
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(res, err);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFields(error);

    sendErrorProd(res, error);
  }
};
