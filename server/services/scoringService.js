const LEVEL_VALUE = { Beginner: 1, Intermediate: 2, Advanced: 3 };
const SKILL_WEIGHT = 0.8;
const INTEREST_WEIGHT = 0.2;

// Small alias list so "JS" and "JavaScript" count as the same skill. Extend as needed.
const ALIASES = {
  js: 'javascript',
  reactjs: 'react',
  'react.js': 'react',
  nodejs: 'node.js',
  node: 'node.js',
  ml: 'machine learning',
  dl: 'deep learning',
  'rest api': 'rest apis',
  restapi: 'rest apis',
  mongo: 'mongodb',
  tf: 'tensorflow',
  powerbi: 'power bi',
  html5: 'html',
  css3: 'css',
  k8s: 'kubernetes',
  maths: 'mathematics',
  math: 'mathematics',
};

const normalize = (str) => {
  const s = String(str).trim().toLowerCase();
  return ALIASES[s] || s;
};

const round = (n) => Math.round(n * 10) / 10;

function scoreCareer(profile, career) {
  const studentSkills = new Map(
    profile.skills.map((s) => [normalize(s.name), LEVEL_VALUE[s.level]])
  );

  let earned = 0;
  let maxPossible = 0;
  const skillGaps = [];
  const matchedSkills = [];

  for (const req of career.requiredSkills) {
    const needed = LEVEL_VALUE[req.minLevel];
    const have = studentSkills.get(normalize(req.name)) || 0;
    const credit = have === 0 ? 0 : Math.min(have / needed, 1);

    earned += credit * req.importance;
    maxPossible += req.importance;

    if (have === 0) {
      skillGaps.push({
        skill: req.name,
        status: 'Missing',
        importance: req.importance,
        requiredLevel: req.minLevel,
        currentLevel: null,
      });
    } else if (have < needed) {
      const current = Object.keys(LEVEL_VALUE).find((k) => LEVEL_VALUE[k] === have);
      skillGaps.push({
        skill: req.name,
        status: 'Improve',
        importance: req.importance,
        requiredLevel: req.minLevel,
        currentLevel: current,
      });
    } else {
      matchedSkills.push(req.name);
    }
  }

  const skillScore = maxPossible === 0 ? 0 : earned / maxPossible;

  const studentInterests = new Set(profile.interests.map(normalize));
  const tags = career.interestTags || [];
  const matchedTags = tags.filter((t) => studentInterests.has(normalize(t)));
  const interestScore = tags.length === 0 ? 0 : matchedTags.length / tags.length;

  const total = (SKILL_WEIGHT * skillScore + INTEREST_WEIGHT * interestScore) * 100;

  // Most important gaps first, then missing before improve
  skillGaps.sort(
    (a, b) =>
      b.importance - a.importance ||
      (a.status === 'Missing' ? -1 : 1) - (b.status === 'Missing' ? -1 : 1)
  );

  return {
    careerId: career._id,
    title: career.title,
    category: career.category,
    description: career.description,
    score: round(total),
    skillScore: round(skillScore * 100),
    interestScore: round(interestScore * 100),
    matchedSkills,
    skillGaps,
  };
}

// Find the career the student typed as their goal (loose match on title)
function findGoalCareer(careers, goal) {
  const g = String(goal || '').trim().toLowerCase();
  if (!g) return null;
  return (
    careers.find((c) => c.title.toLowerCase() === g) ||
    careers.find(
      (c) => c.title.toLowerCase().includes(g) || g.includes(c.title.toLowerCase())
    ) ||
    null
  );
}

function analyzeProfile(profile, careers, alternativeCount = 3) {
  const ranked = careers.map((c) => scoreCareer(profile, c)).sort((a, b) => b.score - a.score);

  const goalCareer = findGoalCareer(careers, profile.careerGoal);
  const goalResult = goalCareer
    ? ranked.find((r) => String(r.careerId) === String(goalCareer._id))
    : null;

  const primary = goalResult || ranked[0];
  const alternatives = ranked
    .filter((r) => String(r.careerId) !== String(primary.careerId))
    .slice(0, alternativeCount);

  return {
    primary,
    alternatives,
    goalMatched: Boolean(goalResult),
    topOverall: ranked[0].title,
  };
}

module.exports = { analyzeProfile, scoreCareer, normalize };