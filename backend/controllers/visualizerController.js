const User = require('../models/User');

exports.getPreferences = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('visualizerPreferences visualizerProgress');
    res.json({
      preferences: user.visualizerPreferences,
      progress: user.visualizerProgress
    });
  } catch (error) {
    next(error);
  }
};

exports.updatePreferences = async (req, res, next) => {
  try {
    const { speed, theme } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (speed !== undefined) user.visualizerPreferences.speed = speed;
    if (theme !== undefined) user.visualizerPreferences.theme = theme;
    
    await user.save();
    
    res.json(user.visualizerPreferences);
  } catch (error) {
    next(error);
  }
};

exports.trackAlgorithm = async (req, res, next) => {
  try {
    const { algorithmId } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (!user.visualizerProgress.watchedAlgorithms.includes(algorithmId)) {
      user.visualizerProgress.watchedAlgorithms.push(algorithmId);
    }
    
    await user.save();
    
    res.json(user.visualizerProgress);
  } catch (error) {
    next(error);
  }
};
