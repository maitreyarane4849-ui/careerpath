const CareerProfile = require('../models/CareerProfile');
const CareerReport = require('../models/CareerReport');
const Roadmap = require('../models/Roadmap');

const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

// Get the logged-in user's profile
exports.getProfile = async (req, res, next) => {
  try {
    const profile = await CareerProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not created yet' });
    }
    res.json({ profile });
  } catch (err) {
    next(err);
  }
};

// Create or update the profile (one endpoint for both)
exports.saveProfile = async (req, res, next) => {
  try {
    const { education = {}, skills = [], interests = [], careerGoal = '' } = req.body;

    if (!education.degree) {
      return res.status(400).json({ message: 'Degree is required' });
    }
    if (!Array.isArray(skills) || skills.length === 0) {
      return res.status(400).json({ message: 'Add at least one skill' });
    }

    // Clean skills: trim, validate level, remove duplicates (case-insensitive)
    const seen = new Set();
    const cleanSkills = [];
    for (const s of skills) {
      const name = (s.name || '').trim();
      if (!name) continue;
      if (!LEVELS.includes(s.level)) {
        return res
          .status(400)
          .json({ message: `Skill level for "${name}" must be Beginner, Intermediate or Advanced` });
      }
      const key = name.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      cleanSkills.push({ name, level: s.level });
    }

    const cleanInterests = [
      ...new Set((interests || []).map((i) => String(i).trim()).filter(Boolean)),
    ];

    const profile = await CareerProfile.findOneAndUpdate(
      { user: req.user._id },
      {
        user: req.user._id,
        education,
        skills: cleanSkills,
        interests: cleanInterests,
        careerGoal: String(careerGoal).trim(),
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    res.json({ profile });
  } catch (err) {
    next(err);
  }
};
// Merge new interests into the saved profile (used by the interest quiz)
exports.addInterests = async (req, res, next) => {
  try {
    const incoming = Array.isArray(req.body.interests) ? req.body.interests : [];
    const clean = incoming.map((i) => String(i).trim()).filter(Boolean).slice(0, 20);
    if (clean.length === 0) {
      return res.status(400).json({ message: 'No interests provided' });
    }

    const profile = await CareerProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({ message: 'Save your profile first' });
    }

    const have = new Set(profile.interests.map((i) => i.toLowerCase()));
    for (const i of clean) {
      if (!have.has(i.toLowerCase())) {
        profile.interests.push(i);
        have.add(i.toLowerCase());
      }
    }
    await profile.save();
    res.json({ profile });
  } catch (err) {
    next(err);
  }
};
// Delete the profile; optionally delete reports and roadmaps too
exports.deleteProfile = async (req, res, next) => {
  try {
    await CareerProfile.deleteOne({ user: req.user._id });

    if (req.query.includeReports === 'true') {
      await Promise.all([
        CareerReport.deleteMany({ user: req.user._id }),
        Roadmap.deleteMany({ user: req.user._id }),
      ]);
    }

    res.json({ message: 'Profile deleted' });
  } catch (err) {
    next(err);
  }
};