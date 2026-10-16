const CareerReport = require('../models/CareerReport');
const Roadmap = require('../models/Roadmap');
const { generateRoadmap } = require('../services/ollamaService');

// Generate a roadmap for a report (defaults to the user's latest report)
exports.generate = async (req, res, next) => {
  try {
    const { reportId } = req.body;
    const report = reportId
      ? await CareerReport.findOne({ _id: reportId, user: req.user._id })
      : await CareerReport.findOne({ user: req.user._id }).sort('-createdAt');

    if (!report) {
      return res.status(400).json({ message: 'Run a career analysis first' });
    }

    let ai;
    try {
      ai = await generateRoadmap(report.profileSnapshot, report.primary);
    } catch (err) {
      return res.status(502).json({ message: err.message });
    }

    const roadmap = await Roadmap.create({
      user: req.user._id,
      report: report._id,
      careerTitle: report.primary.title,
      summary: ai.summary,
      phases: ai.phases,
    });

    report.aiSummary = ai.summary;
    await report.save();

    res.status(201).json({ roadmap });
  } catch (err) {
    next(err);
  }
};

// Latest roadmap of the logged-in user
exports.getLatest = async (req, res, next) => {
  try {
    const roadmap = await Roadmap.findOne({ user: req.user._id }).sort('-createdAt');
    if (!roadmap) return res.status(404).json({ message: 'No roadmap yet' });
    res.json({ roadmap });
  } catch (err) {
    next(err);
  }
};

// One roadmap by id (only if it belongs to the user)
exports.getById = async (req, res, next) => {
  try {
    const roadmap = await Roadmap.findOne({ _id: req.params.id, user: req.user._id });
    if (!roadmap) return res.status(404).json({ message: 'Roadmap not found' });
    res.json({ roadmap });
  } catch (err) {
    next(err);
  }
};
// Mark a task done or not done
exports.toggleTask = async (req, res, next) => {
  try {
    const { done } = req.body;
    if (typeof done !== 'boolean') {
      return res.status(400).json({ message: '"done" must be true or false' });
    }

    const roadmap = await Roadmap.findOne({ _id: req.params.id, user: req.user._id });
    if (!roadmap) return res.status(404).json({ message: 'Roadmap not found' });

    let task = null;
    for (const phase of roadmap.phases) {
      task = phase.tasks.id(req.params.taskId);
      if (task) break;
    }
    if (!task) return res.status(404).json({ message: 'Task not found' });

    task.done = done;
    await roadmap.save();
    res.json({ task, progress: calcProgress(roadmap) });
  } catch (err) {
    next(err);
  }
};

// Progress numbers for one roadmap
exports.getProgress = async (req, res, next) => {
  try {
    const roadmap = await Roadmap.findOne({ _id: req.params.id, user: req.user._id });
    if (!roadmap) return res.status(404).json({ message: 'Roadmap not found' });
    res.json({ progress: calcProgress(roadmap) });
  } catch (err) {
    next(err);
  }
};

function calcProgress(roadmap) {
  const phases = roadmap.phases.map((p) => {
    const total = p.tasks.length;
    const done = p.tasks.filter((t) => t.done).length;
    return { title: p.title, total, done, percent: total ? Math.round((done / total) * 100) : 0 };
  });
  const total = phases.reduce((n, p) => n + p.total, 0);
  const done = phases.reduce((n, p) => n + p.done, 0);
  return { total, done, pending: total - done, percent: total ? Math.round((done / total) * 100) : 0, phases };
}
exports.calcProgress = calcProgress;
// Roadmap that belongs to a specific report
exports.getByReport = async (req, res, next) => {
  try {
    const roadmap = await Roadmap.findOne({ report: req.params.reportId, user: req.user._id }).sort('-createdAt');
    if (!roadmap) return res.status(404).json({ message: 'No roadmap for this report' });
    res.json({ roadmap });
  } catch (err) {
    next(err);
  }
};