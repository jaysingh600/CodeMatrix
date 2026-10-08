const express = require('express');
const router = express.Router();
const {
  getFolders,
  createFolder,
  updateFolder,
  deleteFolder,
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote
} = require('../controllers/notesController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

// Folders
router.get('/folders', getFolders);
router.post('/folders', createFolder);
router.put('/folders/:id', updateFolder);
router.delete('/folders/:id', deleteFolder);

// Notes
router.get('/', getNotes);
router.post('/', createNote);
router.get('/:id', getNoteById);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);

module.exports = router;
