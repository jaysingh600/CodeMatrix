const mongoose = require('mongoose');

const aiConversationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
  title: { type: String, default: 'AI Mentor Chat' },
  mode: { type: String, default: 'General' },
}, { timestamps: true });

module.exports = mongoose.model('AIConversation', aiConversationSchema);
