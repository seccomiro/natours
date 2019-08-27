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
  return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);

  const message = `Invalid input data. ${errors.join('. ')}.`;
  return new AppError(message, 400);
};

const handleJWTError = () => new AppError('Invalid token. Please login again!', 401);

const handleJWTExpiredError = () => new AppError('Yout token has expired. Please login again!', 401);

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
    // let error = { ...err };
    let error;

    if (err.name === 'CastError' || err.constructor.name === 'CastError') {
      error = handleCastErrorDB(err);
    } else if (err.name === 'ValidationError' || err.constructor.name === 'ValidationError') {
      error = handleValidationErrorDB(err);
    } else if (err.code === 11000) {
      error = handleDuplicateFields(err);
    } else if (err.name === 'JsonWebTokenError' || err.constructor.name === 'JsonWebTokenError') {
      error = handleJWTError(err);
    } else if (err.name === 'TokenExpiredError' || err.constructor.name === 'TokenExpiredError') {
      error = handleJWTExpiredError(err);
    } else {
      error = err;
    }

    sendErrorProd(res, error);
  }
};
