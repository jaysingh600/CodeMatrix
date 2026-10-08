const User = require('../models/User');
const Notification = require('../models/Notification');
const Achievement = require('../models/Achievement');
const Submission = require('../models/Submission');

// Level Formula: xp = 100 * (level - 1)^1.5
// Simplified: level = Math.floor(Math.pow(xp / 100, 2/3)) + 1
const calculateLevel = (xp) => {
  return Math.floor(Math.pow(xp / 100, 2 / 3)) + 1;
};

exports.awardXP = async (userId, amount, reason, io) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    const oldLevel = user.level;
    user.xp += amount;
    const newLevel = calculateLevel(user.xp);
    user.level = newLevel;

    await user.save();

    // If leveled up, trigger notification and socket event
    if (newLevel > oldLevel) {
      const notif = await Notification.create({
        userId,
        type: 'level-up',
        title: 'Level Up! 🎉',
        message: `Congratulations! You reached Level ${newLevel}!`,
        data: { level: newLevel, xp: user.xp }
      });

      if (io) {
        io.to(`user_${userId}`).emit('level-up', { level: newLevel, xp: user.xp });
        io.to(`user_${userId}`).emit('notification', notif);
      }
    }
  } catch (err) {
    console.error('Error awarding XP:', err);
  }
};

// Define available achievements (pre-defined for easy checking)
const ACHIEVEMENTS = [
  { key: 'solve_1', title: 'First Steps', description: 'Solve your first problem', icon: '🎯', rarity: 'Common', xpReward: 50 },
  { key: 'solve_10', title: 'Getting Serious', description: 'Solve 10 problems', icon: '🚀', rarity: 'Common', xpReward: 100 },
  { key: 'solve_50', title: 'Half Century', description: 'Solve 50 problems', icon: '🔥', rarity: 'Rare', xpReward: 250 },
  { key: 'solve_100', title: 'Century Solver', description: 'Solve 100 problems', icon: '💯', rarity: 'Epic', xpReward: 500 },
];

exports.checkAchievements = async (userId, io) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    // Check problems solved achievements
    const solvedCount = await Submission.distinct('problemId', { userId, status: 'Accepted' });
    const count = solvedCount.length;

    for (let ach of ACHIEVEMENTS) {
      if (ach.key.startsWith('solve_')) {
        const threshold = parseInt(ach.key.split('_')[1]);
        if (count >= threshold) {
          // Check if already unlocked
          const exists = await Achievement.findOne({ userId, key: ach.key });
          if (!exists) {
            // Unlock
            const newAch = await Achievement.create({
              userId,
              key: ach.key,
              title: ach.title,
              description: ach.description,
              icon: ach.icon,
              rarity: ach.rarity,
              xpReward: ach.xpReward
            });

            // Award XP
            await this.awardXP(userId, ach.xpReward, `Unlocked achievement: ${ach.title}`, io);

            // Notify
            const notif = await Notification.create({
              userId,
              type: 'achievement',
              title: 'Achievement Unlocked! 🏆',
              message: `You unlocked: ${ach.title}`,
              data: { achievement: newAch }
            });

            if (io) {
              io.to(`user_${userId}`).emit('achievement', newAch);
              io.to(`user_${userId}`).emit('notification', notif);
            }
          }
        }
      }
    }
  } catch (err) {
    console.error('Error checking achievements:', err);
  }
};
