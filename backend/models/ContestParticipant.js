const mongoose = require('mongoose');

const contestParticipantSchema = new mongoose.Schema({
  contestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contest', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  score: { type: Number, default: 0 },
  penalty: { type: Number, default: 0 }, // in minutes
  
  // Object tracking solving status per problem
  // Key: problemId, Value: { isSolved: boolean, failedAttempts: number, solveTime: number (minutes from start) }
  problemStats: {
    type: Map,
    of: new mongoose.Schema({
      isSolved: { type: Boolean, default: false },
      failedAttempts: { type: Number, default: 0 },
      solveTime: { type: Number, default: null } // Time elapsed from contest start in minutes
    }, { _id: false }),
    default: {}
  }
}, { timestamps: true });

contestParticipantSchema.index({ contestId: 1, userId: 1 }, { unique: true });
contestParticipantSchema.index({ contestId: 1, score: -1, penalty: 1 }); // For Leaderboard

module.exports = mongoose.model('ContestParticipant', contestParticipantSchema);
