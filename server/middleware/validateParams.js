const objectIdParam = (req, res, next, value) => {
  if (!/^[a-f\d]{24}$/i.test(value)) {
    return res.status(400).json({ message: 'Invalid id' });
  }
  next();
};

module.exports = { objectIdParam };