const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['learning', 'project', 'certification'], required: true },
    title: { type: String, required: true, trim: true },
    provider: { type: String, trim: true },
    url: { type: String, trim: true },
    description: { type: String, default: '' },
    skills: [{ type: String, trim: true }],   // for 'learning': which skills it teaches
    careers: [{ type: String, trim: true }],  // for 'project' and 'certification': which careers it suits
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resource', resourceSchema);