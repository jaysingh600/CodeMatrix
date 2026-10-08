const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatRoom', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // null if AI
  senderType: { type: String, enum: ['user', 'ai', 'system'], default: 'user' },
  message: { type: String, required: true },
  messageType: { type: String, enum: ['text', 'code', 'system', 'question', 'solution', 'error'], default: 'text' },
  language: { type: String }, // For code snippets
  replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatMessage' },
  reactions: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    emoji: { type: String }
  }],
  isPinned: { type: Boolean, default: false },
  isSolution: { type: Boolean, default: false },
  edited: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date },
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
