const Resource = require('../models/Resource');
const CareerReport = require('../models/CareerReport');
const { normalize } = require('../services/scoringService');

exports.recommend = async (req, res, next) => {
  try {
    const report = req.query.reportId
      ? await CareerReport.findOne({ _id: req.query.reportId, user: req.user._id })
      : await CareerReport.findOne({ user: req.user._id }).sort('-createdAt');

    if (!report) return res.status(400).json({ message: 'Run a career analysis first' });

    const all = await Resource.find().lean();
    const title = report.primary.title;

    const learning = report.primary.skillGaps.map((gap) => ({
      skill: gap.skill,
      status: gap.status,
      resources: all.filter(
        (r) => r.type === 'learning' && r.skills.some((s) => normalize(s) === normalize(gap.skill))
      ),
    }));

    const projects = all.filter((r) => r.type === 'project' && r.careers.includes(title));
    const certifications = all.filter((r) => r.type === 'certification' && r.careers.includes(title));

    res.json({ career: title, learning, projects, certifications });
  } catch (err) {
    next(err);
  }
};