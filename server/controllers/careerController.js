const Career = require('../models/Career');

exports.getCareers = async (req, res, next) => {
  try {
    const careers = await Career.find().sort('title');
    res.json({ careers });
  } catch (err) {
    next(err);
  }
};

exports.getCareerById = async (req, res, next) => {
  try {
    const career = await Career.findById(req.params.id);
    if (!career) return res.status(404).json({ message: 'Career not found' });
    res.json({ career });
  } catch (err) {
    next(err);
  }
};