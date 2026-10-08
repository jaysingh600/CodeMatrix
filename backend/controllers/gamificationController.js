const Notification = require('../models/Notification');
const Achievement = require('../models/Achievement');
const User = require('../models/User');

exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (error) {
    next(error);
  }
};

exports.markNotificationRead = async (req, res, next) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

exports.markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

exports.getMyAchievements = async (req, res, next) => {
  try {
    const achievements = await Achievement.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(achievements);
  } catch (error) {
    next(error);
  }
};

exports.getLeaderboard = async (req, res, next) => {
  try {
    const users = await User.find({ role: 'USER' })
      .select('username avatar xp level streak problemsSolved')
      .sort({ xp: -1 })
      .limit(100);
    res.json(users);
  } catch (error) {
    next(error);
  }
};
