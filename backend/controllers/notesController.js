const Note = require('../models/Note');
const Folder = require('../models/Folder');

// ================= FOLDERS ================= //
exports.getFolders = async (req, res, next) => {
  try {
    const folders = await Folder.find({ userId: req.user.id });
    res.json(folders);
  } catch (error) {
    next(error);
  }
};

exports.createFolder = async (req, res, next) => {
  try {
    const { name, parentFolderId } = req.body;
    if (!name) return res.status(400).json({ message: 'Folder name is required' });

    const folder = await Folder.create({
      userId: req.user.id,
      name,
      parentFolderId: parentFolderId || null
    });
    res.status(201).json(folder);
  } catch (error) {
    next(error);
  }
};

exports.updateFolder = async (req, res, next) => {
  try {
    const folder = await Folder.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    if (!folder) return res.status(404).json({ message: 'Folder not found' });
    res.json(folder);
  } catch (error) {
    next(error);
  }
};

exports.deleteFolder = async (req, res, next) => {
  try {
    const folder = await Folder.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!folder) return res.status(404).json({ message: 'Folder not found' });

    // Optionally: cascade delete or move notes out of the folder
    await Note.updateMany({ folderId: folder._id }, { folderId: null });

    res.json({ message: 'Folder deleted' });
  } catch (error) {
    next(error);
  }
};

// ================= NOTES ================= //
exports.getNotes = async (req, res, next) => {
  try {
    const { folderId, tag, isArchived, isFavorite, isPinned, search } = req.query;
    let query = { userId: req.user.id };

    if (isArchived !== undefined) query.isArchived = isArchived === 'true';
    else query.isArchived = false; // Default to non-archived

    if (folderId) query.folderId = folderId;
    if (tag) query.tags = tag;
    if (isFavorite === 'true') query.isFavorite = true;
    if (isPinned === 'true') query.isPinned = true;

    if (search) {
      query.$text = { $search: search };
    }

    const notes = await Note.find(query)
      .sort(search ? { score: { $meta: "textScore" } } : { updatedAt: -1 })
      .populate('linkedProblems', 'title slug difficulty');

    res.json(notes);
  } catch (error) {
    next(error);
  }
};

exports.getNoteById = async (req, res, next) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user.id })
      .populate('linkedProblems', 'title slug difficulty');
      
    if (!note) return res.status(404).json({ message: 'Note not found' });

    note.lastOpened = Date.now();
    await note.save();

    res.json(note);
  } catch (error) {
    next(error);
  }
};

exports.createNote = async (req, res, next) => {
  try {
    const { title, content, folderId, tags, linkedProblems } = req.body;
    
    const note = await Note.create({
      userId: req.user.id,
      title: title || 'Untitled Note',
      content: content || '',
      folderId: folderId || null,
      tags: tags || [],
      linkedProblems: linkedProblems || []
    });

    res.status(201).json(note);
  } catch (error) {
    next(error);
  }
};

exports.updateNote = async (req, res, next) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    ).populate('linkedProblems', 'title slug difficulty');

    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json(note);
  } catch (error) {
    next(error);
  }
};

exports.deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json({ message: 'Note deleted' });
  } catch (error) {
    next(error);
  }
};
