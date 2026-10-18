const mongoose = require('mongoose');

const careerReportSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    
    profileSnapshot: { type: mongoose.Schema.Types.Mixed, required: true },
    primary: { type: mongoose.Schema.Types.Mixed, required: true },
    alternatives: { type: [mongoose.Schema.Types.Mixed], default: [] },
    goalMatched: { type: Boolean, default: false },
    
    aiSummary: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CareerReport', careerReportSchema);