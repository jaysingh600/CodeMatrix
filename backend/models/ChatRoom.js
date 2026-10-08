const mongoose = require('mongoose');

const chatRoomSchema = new mongoose.Schema({
  problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem' }, // Legacy public rooms
  type: { type: String, enum: ['public', 'private', 'team'], default: 'public' },
  name: { type: String, required: true },
  description: { type: String },
  roomCode: { type: String, sparse: true, unique: true },
  topic: { type: String },
  linkedQuestion: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem' },
  maxParticipants: { type: Number, default: 10 },
  status: { type: String, enum: ['ACTIVE', 'CLOSED'], default: 'ACTIVE' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isLocked: { type: Boolean, default: false },
  otpExpiresAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('ChatRoom', chatRoomSchema);
