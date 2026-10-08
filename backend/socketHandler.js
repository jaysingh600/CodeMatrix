const jwt = require('jsonwebtoken');
const User = require('./models/User');
const ChatMessage = require('./models/ChatMessage');
const ChatRoom = require('./models/ChatRoom');
const mentorService = require('./services/mentorService');
const Problem = require('./models/Problem');

const socketHandler = (io) => {
  // Authentication Middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers.cookie?.split('token=')[1]?.split(';')[0];
      
      if (!token || token === 'none') {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  const onlineUsers = new Map(); // socket.id -> { user, status }

  io.on('connection', (socket) => {
    
    onlineUsers.set(socket.id, { user: socket.user, status: 'Online' });
    io.emit('online-users-update', Array.from(onlineUsers.values()));

    socket.on('join-room', async (roomId) => {
      // Security check: Verify room membership
      try {
        const room = await ChatRoom.findById(roomId);
        if (!room) return;
        
        if (room.type === 'private' && !room.participants.includes(socket.user._id)) {
          return; // Unauthorized
        }

        socket.join(roomId);
        // Notify room
        io.to(roomId).emit('system-message', `${socket.user.username} joined the discussion.`);
      } catch (err) {
        console.error('Join room error:', err);
      }
    });

    socket.on('leave-room', (roomId) => {
      socket.leave(roomId);
      io.to(roomId).emit('system-message', `${socket.user.username} left the discussion.`);
    });

    socket.on('send-message', async (data) => {
      const { roomId, message, messageType, language, problemId, replyTo } = data;

      try {
        // Security check: Verify room membership
        const room = await ChatRoom.findById(roomId);
        if (!room || (room.type === 'private' && !room.participants.includes(socket.user._id))) {
          return; // Unauthorized
        }

        const chatMsg = await ChatMessage.create({
          roomId,
          sender: socket.user._id,
          senderType: 'user',
          message,
          messageType: messageType || 'text',
          language,
          replyTo: replyTo || null
        });

        const populatedMsg = await ChatMessage.findById(chatMsg._id)
          .populate('sender', 'username avatar')
          .populate({
            path: 'replyTo',
            select: 'message messageType sender',
            populate: { path: 'sender', select: 'username' }
          });
        
        io.to(roomId).emit('receive-message', populatedMsg);

        // Check for AI Mentor mention
        if (message.includes('@mentor') && problemId) {
          handleAiMentorMention(io, roomId, problemId, socket.user, message);
        }

      } catch (error) {
        console.error('Socket send-message error:', error);
      }
    });

    socket.on('edit-message', async (data) => {
      const { roomId, messageId, newText } = data;
      try {
        const msg = await ChatMessage.findById(messageId);
        if (msg && msg.sender.toString() === socket.user._id.toString() && !msg.isDeleted) {
          msg.message = newText;
          msg.edited = true;
          await msg.save();
          io.to(roomId).emit('message-edited', { messageId, newText });
        }
      } catch (err) {
        console.error(err);
      }
    });

    socket.on('delete-message', async (data) => {
      const { roomId, messageId } = data;
      try {
        const msg = await ChatMessage.findById(messageId);
        if (!msg) return;

        const room = await ChatRoom.findById(roomId);
        const isOwner = room && room.createdBy.toString() === socket.user._id.toString();
        const isSender = msg.sender.toString() === socket.user._id.toString();

        if (isOwner || isSender) {
          msg.isDeleted = true;
          msg.deletedAt = new Date();
          msg.deletedBy = socket.user._id;
          await msg.save();
          io.to(roomId).emit('message-deleted', { messageId, deletedBy: socket.user.username });
        }
      } catch (err) {
        console.error(err);
      }
    });

    socket.on('typing', ({ roomId, isTyping }) => {
      socket.to(roomId).emit('typing-indicator', {
        userId: socket.user._id,
        username: socket.user.username,
        isTyping
      });
    });

    socket.on('react-message', async ({ messageId, roomId, emoji }) => {
      try {
        const msg = await ChatMessage.findById(messageId);
        if (!msg) return;

        const existingReactionIndex = msg.reactions.findIndex(
          r => r.userId.toString() === socket.user._id.toString() && r.emoji === emoji
        );

        if (existingReactionIndex > -1) {
          msg.reactions.splice(existingReactionIndex, 1);
        } else {
          msg.reactions.push({ userId: socket.user._id, emoji });
        }

        await msg.save();
        const populatedMsg = await msg.populate('sender', 'username avatar');
        
        io.to(roomId).emit('message-reaction-update', {
          messageId,
          reactions: populatedMsg.reactions
        });
      } catch (error) {
        console.error('Socket react-message error:', error);
      }
    });

    socket.on('disconnect', () => {
      onlineUsers.delete(socket.id);
      io.emit('online-users-update', Array.from(onlineUsers.values()));
    });
  });
};

async function handleAiMentorMention(io, roomId, problemId, user, messageText) {
  try {
    io.to(roomId).emit('typing-indicator', {
      userId: 'mentor',
      username: 'CodeMatrix Mentor',
      isTyping: true
    });

    const problem = await Problem.findById(problemId);
    if (!problem) return;

    const aiResponse = await mentorService.chatWithMentor(
      problem,
      'unknown',
      'No code provided in chat room context.',
      messageText,
      [],
      `User ${user.username} mentioned you in the public chat room.`
    );

    const chatMsg = await ChatMessage.create({
      roomId,
      sender: null,
      senderType: 'ai',
      message: aiResponse.text,
      messageType: 'text'
    });

    io.to(roomId).emit('receive-message', chatMsg);
  } catch (error) {
    console.error('AI Mentor Room Error:', error);
  } finally {
    io.to(roomId).emit('typing-indicator', {
      userId: 'mentor',
      username: 'CodeMatrix Mentor',
      isTyping: false
    });
  }
}

module.exports = socketHandler;
