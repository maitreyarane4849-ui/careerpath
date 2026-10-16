const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['learn', 'practice', 'project'], default: 'learn' },
  done: { type: Boolean, default: false },
});

const phaseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  tasks: [taskSchema],
});

const roadmapSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    report: { type: mongoose.Schema.Types.ObjectId, ref: 'CareerReport', required: true },
    careerTitle: { type: String, required: true },
    summary: { type: String, default: '' },
    phases: [phaseSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Roadmap', roadmapSchema);