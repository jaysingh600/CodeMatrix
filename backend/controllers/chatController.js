const ChatRoom = require('../models/ChatRoom');
const ChatMessage = require('../models/ChatMessage');
const Problem = require('../models/Problem');

// @desc    Get or create a public room for a problem
// @route   GET /api/chat/rooms/problem/:problemId
// @access  Private
exports.getProblemRoom = async (req, res, next) => {
  try {
    const { problemId } = req.params;
    
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    let room = await ChatRoom.findOne({ problemId, type: 'public' }).populate('participants', 'username avatar');
    
    if (!room) {
      room = await ChatRoom.create({
        problemId,
        type: 'public',
        name: `${problem.title} Discussion`,
        participants: []
      });
    }

    res.json(room);
  } catch (error) {
    next(error);
  }
};

// @desc    Get messages for a room with pagination
// @route   GET /api/chat/rooms/:roomId/messages
// @access  Private
exports.getRoomMessages = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const skip = parseInt(req.query.skip) || 0;

    const messages = await ChatMessage.find({ roomId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'username avatar')
      .populate('reactions.userId', 'username');

    // Reverse to chronological order
    res.json(messages.reverse());
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle pin a message
// @route   PUT /api/chat/messages/:messageId/pin
// @access  Private (Admins or Owners)
exports.togglePinMessage = async (req, res, next) => {
  try {
    const message = await ChatMessage.findById(req.params.messageId);
    if (!message) return res.status(404).json({ message: 'Message not found' });

    // TODO: Verify permissions
    
    message.isPinned = !message.isPinned;
    await message.save();

    res.json(message);
  } catch (error) {
    next(error);
  }
};

// @desc    Mark a message as the accepted solution
// @route   PUT /api/chat/messages/:messageId/solution
// @access  Private
exports.markAsSolution = async (req, res, next) => {
  try {
    const message = await ChatMessage.findById(req.params.messageId);
    if (!message) return res.status(404).json({ message: 'Message not found' });

    // Unmark any previous solution in this room
    await ChatMessage.updateMany({ roomId: message.roomId, isSolution: true }, { isSolution: false });

    message.isSolution = true;
    await message.save();

    res.json(message);
  } catch (error) {
    next(error);
  }
};

// --- Private Room Handlers ---

const generateRoomCode = async () => {
  let code;
  let exists = true;
  while (exists) {
    code = Math.floor(100000 + Math.random() * 900000).toString();
    exists = await ChatRoom.exists({ roomCode: code });
  }
  return code;
};

exports.createPrivateRoom = async (req, res, next) => {
  try {
    const { name, description, topic, linkedQuestion, maxParticipants } = req.body;
    
    if (!name) return res.status(400).json({ message: 'Room name is required' });
    
    const roomCode = await generateRoomCode();
    
    const room = await ChatRoom.create({
      name,
      description,
      topic,
      roomCode,
      otpExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      linkedQuestion: linkedQuestion || null,
      maxParticipants: maxParticipants || 10,
      type: 'private',
      status: 'ACTIVE',
      createdBy: req.user._id,
      participants: [req.user._id]
    });
    
    const populatedRoom = await ChatRoom.findById(room._id).populate('participants', 'username avatar status').populate('createdBy', 'username avatar');
    res.status(201).json(populatedRoom);
  } catch (error) {
    next(error);
  }
};

exports.joinPrivateRoom = async (req, res, next) => {
  try {
    const { roomCode } = req.body;
    if (!roomCode) return res.status(400).json({ message: 'Room code is required' });
    
    const room = await ChatRoom.findOne({ roomCode, type: 'private' }).populate('createdBy', 'username avatar');
    if (!room) return res.status(404).json({ message: 'Invalid room code.' });
    if (room.status !== 'ACTIVE') return res.status(403).json({ message: 'This room is no longer active.' });
    
    // OTP Expiration Check
    if (room.otpExpiresAt && room.otpExpiresAt < new Date()) {
      return res.status(403).json({ message: 'This OTP has expired. Please request a new one.' });
    }
    
    if (room.participants.includes(req.user._id)) {
      return res.status(400).json({ message: 'You are already a member of this room.' });
    }
    
    room.participants.push(req.user._id);
    await room.save();
    
    const populatedRoom = await ChatRoom.findById(room._id).populate('participants', 'username avatar status').populate('createdBy', 'username avatar');
    res.json(populatedRoom);
  } catch (error) {
    next(error);
  }
};

exports.getUserRooms = async (req, res, next) => {
  try {
    const rooms = await ChatRoom.find({ 
      participants: req.user._id,
      type: 'private'
    }).populate('createdBy', 'username avatar').populate('participants', 'username avatar status').sort({ createdAt: -1 });
    res.json(rooms);
  } catch (error) {
    next(error);
  }
};

exports.getRoom = async (req, res, next) => {
  try {
    const room = await ChatRoom.findById(req.params.roomId)
      .populate('createdBy', 'username avatar')
      .populate('participants', 'username avatar status')
      .populate('linkedQuestion', 'title difficulty topic');
      
    if (!room) return res.status(404).json({ message: 'Room not found' });
    if (!room.participants.some(p => p._id.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    res.json(room);
  } catch (error) {
    next(error);
  }
};

exports.leaveRoom = async (req, res, next) => {
  try {
    const room = await ChatRoom.findById(req.params.roomId);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    
    room.participants = room.participants.filter(id => id.toString() !== req.user._id.toString());
    await room.save();
    
    res.json({ message: 'Left room successfully' });
  } catch (error) {
    next(error);
  }
};

exports.closeRoom = async (req, res, next) => {
  try {
    const room = await ChatRoom.findById(req.params.roomId);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    if (room.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only host can close the room' });
    }
    
    room.status = 'CLOSED';
    await room.save();
    
    res.json(room);
  } catch (error) {
    next(error);
  }
};

exports.removeParticipant = async (req, res, next) => {
  try {
    const room = await ChatRoom.findById(req.params.roomId);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    if (room.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only host can remove participants' });
    }
    
    room.participants = room.participants.filter(id => id.toString() !== req.params.userId);
    await room.save();
    
    res.json({ message: 'Participant removed' });
  } catch (error) {
    next(error);
  }
};

exports.searchMessages = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);
    
    const room = await ChatRoom.findById(req.params.roomId);
    if (!room || !room.participants.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const messages = await ChatMessage.find({
      roomId: req.params.roomId,
      message: { $regex: q, $options: 'i' },
      isDeleted: false
    }).populate('sender', 'username avatar');
    
    res.json(messages);
  } catch (error) {
    next(error);
  }
};

exports.editMessage = async (req, res, next) => {
  try {
    const msg = await ChatMessage.findById(req.params.messageId);
    if (!msg) return res.status(404).json({ message: 'Message not found' });
    if (msg.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (msg.isDeleted) return res.status(400).json({ message: 'Cannot edit deleted message' });
    
    msg.message = req.body.message;
    msg.edited = true;
    await msg.save();
    
    res.json(msg);
  } catch (error) {
    next(error);
  }
};

exports.deleteMessage = async (req, res, next) => {
  try {
    const msg = await ChatMessage.findById(req.params.messageId).populate('roomId');
    if (!msg) return res.status(404).json({ message: 'Message not found' });
    
    const room = await ChatRoom.findById(msg.roomId);
    const isOwner = room && room.createdBy.toString() === req.user._id.toString();
    const isSender = msg.sender.toString() === req.user._id.toString();
    
    if (!isOwner && !isSender) {
      return res.status(403).json({ message: 'Not authorized to delete' });
    }
    
    msg.isDeleted = true;
    msg.deletedAt = new Date();
    msg.deletedBy = req.user._id;
    await msg.save();
    
    res.json({ message: 'Message deleted' });
  } catch (error) {
    next(error);
  }
};

exports.generateOTP = async (req, res, next) => {
  try {
    const room = await ChatRoom.findById(req.params.roomId);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    
    // Allow any participant to generate OTP, or restrict to owner.
    // Given the prompt "When a user clicks Generate OTP, generate a unique 6-digit OTP", any member can probably do it, 
    // but let's allow it for members.
    if (!room.participants.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const roomCode = await generateRoomCode();
    room.roomCode = roomCode;
    room.otpExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours expiry
    await room.save();
    
    const populatedRoom = await ChatRoom.findById(room._id).populate('participants', 'username avatar status').populate('createdBy', 'username avatar');
    res.json(populatedRoom);
  } catch (error) {
    next(error);
  }
};
