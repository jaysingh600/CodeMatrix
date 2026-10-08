const mongoose = require('mongoose');

const codeVersionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
  versionNumber: { type: Number, required: true },
  title: { type: String, default: null }, // Optional title for manual checkpoints
  language: { type: String, required: true },
  sourceCode: { type: String, required: true },
  status: { type: String }, // 'Accepted', 'Wrong Answer', etc.
  runtime: { type: String }, // e.g., '24ms'
  memory: { type: String }, // e.g., '18MB'
  timeComplexity: { type: String }, // e.g., 'O(n)'
  spaceComplexity: { type: String }, // e.g., 'O(1)'
  note: { type: String, default: '' },
  aiAnalysis: {
    whatImproved: String,
    needsWork: String,
    readiness: String,
  },
  parentVersion: { type: mongoose.Schema.Types.ObjectId, ref: 'CodeVersion' },
}, { timestamps: true });

// Compound index to quickly find the latest version number for a user's problem
codeVersionSchema.index({ userId: 1, problemId: 1, versionNumber: -1 });

module.exports = mongoose.model('CodeVersion', codeVersionSchema);
