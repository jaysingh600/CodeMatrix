const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
  language: { type: String, required: true },
  sourceCode: { type: String, required: true },
  status: { type: String, required: true }, // 'Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Runtime Error', 'Compilation Error', 'Pending'
  passedCount: { type: Number, default: 0 },
  totalCount: { type: Number, default: 0 },
  executionTime: { type: String }, // e.g., '0.12s'
  memory: { type: String }, // e.g., '15MB'
  failedTestCase: { type: mongoose.Schema.Types.ObjectId, ref: 'TestCase' },
  output: { type: String },
  error: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Submission', submissionSchema);
