const CareerProfile = require('../models/CareerProfile');
const Career = require('../models/Career');
const CareerReport = require('../models/CareerReport');
const Roadmap = require('../models/Roadmap');
const { analyzeProfile } = require('../services/scoringService');
const { generateRoadmap } = require('../services/ollamaService');

const httpError = (status, message) => {
  const e = new Error(message);
  e.statusCode = status;
  return e;
};

async function createReport(userId) {
  const profile = await CareerProfile.findOne({ user: userId }).lean();
  if (!profile) throw httpError(400, 'Create your career profile first');

  const careers = await Career.find().lean();
  if (careers.length === 0) throw httpError(500, 'No careers in database. Run the seed script.');

  const result = analyzeProfile(profile, careers);

  return CareerReport.create({
    user: userId,
    profileSnapshot: {
      education: profile.education,
      skills: profile.skills,
      interests: profile.interests,
      careerGoal: profile.careerGoal,
    },
    primary: result.primary,
    alternatives: result.alternatives,
    goalMatched: result.goalMatched,
  });
}

// Analysis only (no AI)
exports.runAnalysis = async (req, res, next) => {
  try {
    const report = await createReport(req.user._id);
    res.status(201).json({ report });
  } catch (err) {
    next(err);
  }
};

// Analysis + roadmap in one call (used after a profile update)
exports.runFull = async (req, res, next) => {
  try {
    const report = await createReport(req.user._id);

    try {
      const ai = await generateRoadmap(report.profileSnapshot, report.primary);
      const roadmap = await Roadmap.create({
        user: req.user._id,
        report: report._id,
        careerTitle: report.primary.title,
        summary: ai.summary,
        phases: ai.phases,
      });
      report.aiSummary = ai.summary;
      await report.save();
      return res.status(201).json({ report, roadmap });
    } catch (err) {
      return res.status(201).json({
        report,
        roadmap: null,
        warning: `Report saved, but roadmap generation failed: ${err.message}`,
      });
    }
  } catch (err) {
    next(err);
  }
};

exports.getReports = async (req, res, next) => {
  try {
    const reports = await CareerReport.find({ user: req.user._id })
      .sort('-createdAt')
      .select('primary.title primary.score goalMatched createdAt');
    res.json({ reports });
  } catch (err) {
    next(err);
  }
};

exports.getReportById = async (req, res, next) => {
  try {
    const report = await CareerReport.findOne({ _id: req.params.id, user: req.user._id });
    if (!report) return res.status(404).json({ message: 'Report not found' });
    res.json({ report });
  } catch (err) {
    next(err);
  }
};