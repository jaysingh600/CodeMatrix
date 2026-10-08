const mongoose = require('mongoose');

const contestSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  contestCode: { type: String, sparse: true, unique: true },
  type: { type: String, enum: ['Public', 'Private'], default: 'Public' },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  duration: { type: Number, required: true }, // in minutes
  status: { type: String, enum: ['Upcoming', 'Waiting', 'Running', 'Active', 'Ended', 'Finished'], default: 'Upcoming' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  problems: [
    {
      problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem' },
      points: { type: Number, required: true },
      order: { type: Number, required: true }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Contest', contestSchema);
