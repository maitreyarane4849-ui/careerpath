const CareerProfile = require('../models/CareerProfile');
const CareerReport = require('../models/CareerReport');
const Roadmap = require('../models/Roadmap');
const { calcProgress } = require('./roadmapController');

exports.getDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const [profile, reports, roadmap] = await Promise.all([
      CareerProfile.findOne({ user: userId }).lean(),
      CareerReport.find({ user: userId }).sort('-createdAt').lean(),
      Roadmap.findOne({ user: userId }).sort('-createdAt'),
    ]);

    const latest = reports[0] || null;

    res.json({
      user: { name: req.user.name },
      profile: profile
        ? {
            degree: profile.education?.degree || '',
            careerGoal: profile.careerGoal || '',
            skillCount: profile.skills.length,
            interestCount: profile.interests.length,
          }
        : null,
      // true when the profile was edited after the latest analysis
      profileChanged: Boolean(profile && latest && profile.updatedAt > latest.createdAt),
      latestReport: latest && {
        id: latest._id,
        createdAt: latest.createdAt,
        primary: {
          title: latest.primary.title,
          score: latest.primary.score,
          skillScore: latest.primary.skillScore,
          interestScore: latest.primary.interestScore,
          matchedCount: latest.primary.matchedSkills.length,
          gapCount: latest.primary.skillGaps.length,
        },
        topGaps: latest.primary.skillGaps.slice(0, 5),
        alternatives: latest.alternatives.map((a) => ({ title: a.title, score: a.score })),
      },
      roadmap: roadmap && { id: roadmap._id, careerTitle: roadmap.careerTitle, progress: calcProgress(roadmap) },
      stats: { totalReports: reports.length },
      // oldest first, last 10, ready for a line chart
      scoreHistory: reports
        .slice(0, 10)
        .reverse()
        .map((r) => ({ id: r._id, date: r.createdAt, title: r.primary.title, score: r.primary.score })),
    });
  } catch (err) {
    next(err);
  }
};