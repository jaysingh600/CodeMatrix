const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
  key: { 
    type: String, 
    required: true 
  },
  title: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  icon: { 
    type: String, 
    required: true 
  },
  rarity: { 
    type: String, 
    enum: ['Common', 'Rare', 'Epic', 'Legendary'], 
    default: 'Common' 
  },
  xpReward: { 
    type: Number, 
    default: 0 
  }
}, { timestamps: true });

// Prevent duplicate achievements for the same user
achievementSchema.index({ userId: 1, key: 1 }, { unique: true });

module.exports = mongoose.model('Achievement', achievementSchema);
