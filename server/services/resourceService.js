const Resource = require('../models/Resource');
const { normalize } = require('./scoringService');

async function getRecommendations(report) {
  const all = await Resource.find().lean();
  const title = report.primary.title;

  const learning = report.primary.skillGaps.map((gap) => ({
    skill: gap.skill,
    status: gap.status,
    resources: all.filter(
      (r) => r.type === 'learning' && r.skills.some((s) => normalize(s) === normalize(gap.skill))
    ),
  }));

  return {
    career: title,
    learning,
    projects: all.filter((r) => r.type === 'project' && r.careers.includes(title)),
    certifications: all.filter((r) => r.type === 'certification' && r.careers.includes(title)),
  };
}

module.exports = { getRecommendations };