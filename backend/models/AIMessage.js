const mongoose = require('mongoose');

const aiMessageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'AIConversation', required: true },
  role: { type: String, enum: ['user', 'model'], required: true },
  content: { type: String, required: true },
  tokenUsage: { type: Number, default: 0 },
  responseTime: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('AIMessage', aiMessageSchema);
