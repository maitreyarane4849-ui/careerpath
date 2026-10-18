const errorHandler = (err, req, res, next) => {
  console.error(err);

  let status = err.statusCode || 500;
  let message = err.message || 'Server error';

  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  } else if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid value';
  } else if (err.code === 11000) {
    status = 409;
    message = 'Already exists';
  }

  if (status === 500 && process.env.NODE_ENV === 'production') {
    message = 'Server error';
  }

  res.status(status).json({ message });
};

module.exports = errorHandler;