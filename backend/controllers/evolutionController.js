const CodeVersion = require('../models/CodeVersion');

exports.getProblemVersions = async (req, res, next) => {
  try {
    const { problemId } = req.params;
    const versions = await CodeVersion.find({ problemId, userId: req.user.id })
      .sort({ versionNumber: -1 });
    res.json(versions);
  } catch (error) {
    next(error);
  }
};

exports.getVersionById = async (req, res, next) => {
  try {
    const { versionId } = req.params;
    const version = await CodeVersion.findOne({ _id: versionId, userId: req.user.id });
    if (!version) {
      return res.status(404).json({ message: 'Version not found' });
    }
    res.json(version);
  } catch (error) {
    next(error);
  }
};

exports.createCheckpoint = async (req, res, next) => {
  try {
    const { problemId, language, sourceCode, title, note } = req.body;
    
    if (!problemId || !language || !sourceCode) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const latestVersion = await CodeVersion.findOne({ problemId, userId: req.user.id })
      .sort({ versionNumber: -1 });
    
    const versionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;

    const newVersion = await CodeVersion.create({
      userId: req.user.id,
      problemId,
      versionNumber,
      title: title || `Checkpoint v${versionNumber}`,
      language,
      sourceCode,
      note,
      status: 'Checkpoint',
      parentVersion: latestVersion ? latestVersion._id : null
    });

    res.status(201).json(newVersion);
  } catch (error) {
    next(error);
  }
};

exports.restoreVersion = async (req, res, next) => {
  try {
    const { versionId } = req.params;
    
    const oldVersion = await CodeVersion.findOne({ _id: versionId, userId: req.user.id });
    if (!oldVersion) {
      return res.status(404).json({ message: 'Version not found' });
    }

    const latestVersion = await CodeVersion.findOne({ problemId: oldVersion.problemId, userId: req.user.id })
      .sort({ versionNumber: -1 });

    const versionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;

    const newVersion = await CodeVersion.create({
      userId: req.user.id,
      problemId: oldVersion.problemId,
      versionNumber,
      title: `Restored from v${oldVersion.versionNumber}`,
      language: oldVersion.language,
      sourceCode: oldVersion.sourceCode,
      status: 'Restored',
      parentVersion: oldVersion._id
    });

    res.status(201).json(newVersion);
  } catch (error) {
    next(error);
  }
};

exports.updateVersionNote = async (req, res, next) => {
  try {
    const { versionId } = req.params;
    const { note, title } = req.body;

    const version = await CodeVersion.findOneAndUpdate(
      { _id: versionId, userId: req.user.id },
      { note, title },
      { new: true }
    );

    if (!version) {
      return res.status(404).json({ message: 'Version not found' });
    }

    res.json(version);
  } catch (error) {
    next(error);
  }
};

exports.deleteVersion = async (req, res, next) => {
  try {
    const { versionId } = req.params;
    const version = await CodeVersion.findOneAndDelete({ _id: versionId, userId: req.user.id });
    
    if (!version) {
      return res.status(404).json({ message: 'Version not found' });
    }

    res.json({ message: 'Version deleted' });
  } catch (error) {
    next(error);
  }
};
