require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const errorHandler = require('./middleware/errorMiddleware');
const connectDB = require('./config/db');
const http = require('http');
const { Server } = require('socket.io');
const socketHandler = require('./socketHandler');

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    credentials: true,
  }
});
socketHandler(io);

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(helmet());

// Prevent http param pollution
app.use(hpp());

// Trust proxy if behind load balancer (fixes IPv6 rate limiter warning)
app.set('trust proxy', 1);

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 100
});
app.use('/api', limiter);

// Routes
const problemRoutes = require('./routes/problemRoutes');
const codeRoutes = require('./routes/codeRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const aiRoutes = require('./routes/aiRoutes');
const mentorRoutes = require('./routes/mentorRoutes');
const chatRoutes = require('./routes/chatRoutes');
const evolutionRoutes = require('./routes/evolutionRoutes');
const visualizerRoutes = require('./routes/visualizerRoutes');
const notesRoutes = require('./routes/notesRoutes');
const contestRoutes = require('./routes/contestRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const gamificationRoutes = require('./routes/gamificationRoutes');

app.set('socketio', io);

app.use('/api/problems', problemRoutes);
app.use('/api/code', codeRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/mentor', mentorRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/evolution', evolutionRoutes);
app.use('/api/visualizer', visualizerRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/contests', contestRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/gamification', gamificationRoutes);

// Root Endpoint
app.get('/', (req, res) => {
  res.send('CodeMatrix API is running...');
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
