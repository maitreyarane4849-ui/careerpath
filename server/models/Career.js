const mongoose = require('mongoose');

const requiredSkillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    importance: { type: Number, min: 1, max: 3, required: true }, // 3 = core, 1 = nice to have
    minLevel: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      required: true,
    },
  },
  { _id: false }
);

const careerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true, trim: true },
    category: { type: String, trim: true },
    description: { type: String, required: true },
    requiredSkills: [requiredSkillSchema],
    interestTags: [{ type: String, trim: true }], // used to match student interests
  },
  { timestamps: true }
);

module.exports = mongoose.model('Career', careerSchema);