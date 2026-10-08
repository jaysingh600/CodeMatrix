const mongoose = require('mongoose');

const hintRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
  hintType: { type: String, required: true },
  language: { type: String, required: true },
  tokenUsage: { type: Number, default: 0 },
  responseTime: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('HintRequest', hintRequestSchema);
