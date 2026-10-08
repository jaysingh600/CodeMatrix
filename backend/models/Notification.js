const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
  type: { 
    type: String, 
    enum: ['mention', 'invite', 'ai_reply', 'system', 'achievement', 'level-up', 'contest', 'streak'], 
    required: true 
  },
  title: { 
    type: String,
    default: 'Notification'
  },
  message: { 
    type: String, 
    required: true 
  },
  data: { 
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  isRead: { 
    type: Boolean, 
    default: false 
  },
  relatedId: { 
    type: mongoose.Schema.Types.ObjectId 
  }, // Kept for backward compatibility
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
