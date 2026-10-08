const express = require('express');
const { 
  getProblemRoom, 
  getRoomMessages, 
  togglePinMessage, 
  markAsSolution,
  createPrivateRoom,
  joinPrivateRoom,
  getRoom,
  leaveRoom,
  closeRoom,
  removeParticipant,
  searchMessages,
  deleteMessage,
  editMessage,
  getUserRooms,
  generateOTP
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/user/rooms', getUserRooms);
router.post('/rooms', createPrivateRoom);
router.post('/rooms/join', joinPrivateRoom);
router.get('/rooms/:roomId', getRoom);
router.post('/rooms/:roomId/leave', leaveRoom);
router.post('/rooms/:roomId/close', closeRoom);
router.post('/rooms/:roomId/generate-otp', generateOTP);
router.delete('/rooms/:roomId/participants/:userId', removeParticipant);
router.get('/rooms/:roomId/search', searchMessages);

router.get('/rooms/problem/:problemId', getProblemRoom);
router.get('/rooms/:roomId/messages', getRoomMessages);

router.put('/messages/:messageId/pin', togglePinMessage);
router.put('/messages/:messageId/solution', markAsSolution);
router.put('/messages/:messageId', editMessage);
router.delete('/messages/:messageId', deleteMessage);

module.exports = router;
