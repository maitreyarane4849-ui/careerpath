const mongoose = require('mongoose');

const careerReportSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    // Copy of the profile at the time of analysis, so old reports stay accurate
    profileSnapshot: { type: mongoose.Schema.Types.Mixed, required: true },
    primary: { type: mongoose.Schema.Types.Mixed, required: true },
    alternatives: { type: [mongoose.Schema.Types.Mixed], default: [] },
    goalMatched: { type: Boolean, default: false },
    // Filled in Step 6 by Ollama
    aiSummary: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CareerReport', careerReportSchema);