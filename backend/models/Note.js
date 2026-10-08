const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, default: 'Untitled Note' },
  content: { type: String, default: '' },
  folderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', default: null },
  tags: [{ type: String }],
  linkedProblems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Problem' }],
  isPinned: { type: Boolean, default: false },
  isFavorite: { type: Boolean, default: false },
  isArchived: { type: Boolean, default: false },
  lastOpened: { type: Date, default: Date.now }
}, { timestamps: true });

noteSchema.index({ userId: 1, isArchived: 1 });
noteSchema.index({ userId: 1, title: 'text', content: 'text' }); // For text search

module.exports = mongoose.model('Note', noteSchema);
