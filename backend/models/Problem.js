const mongoose = require('mongoose');

const exampleSchema = new mongoose.Schema({
  input: { type: String, required: true },
  output: { type: String, required: true },
  explanation: { type: String, default: "" }
});

const problemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  topic: { type: [String], default: [] },
  tags: { type: [String], default: [] },
  acceptanceRate: { type: String, default: "0%" },
  description: { type: String, required: true },
  inputFormat: { type: String },
  outputFormat: { type: String },
  constraints: { type: [String], default: [] },
  examples: [exampleSchema],
  starterCodeJava: { type: String, default: "" },
  starterCodeCpp: { type: String, default: "" },
  starterCodePython: { type: String, default: "" },
  starterCodeJavaScript: { type: String, default: "" },
  timeLimit: { type: Number, default: 2000 }, // in milliseconds
  memoryLimit: { type: Number, default: 256000 }, // in kilobytes
  status: { type: String, enum: ['Draft', 'Published', 'Archived'], default: 'Draft' },
  isPublished: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Problem', problemSchema);
