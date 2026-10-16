const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      required: true,
    },
  },
  { _id: false }
);

const careerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // one profile per user
    },
    education: {
      degree: { type: String, trim: true },
      specialization: { type: String, trim: true },
      institution: { type: String, trim: true },
      graduationYear: { type: Number, min: 1990, max: 2100 },
    },
    skills: [skillSchema],
    interests: [{ type: String, trim: true }],
    careerGoal: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CareerProfile', careerProfileSchema);