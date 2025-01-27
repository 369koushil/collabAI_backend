import 'dotenv/config';
import http from 'http';
import app from './app.js';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import projectModel from './models/project.model.js';
import { generateResult } from './services/ai.service.js';

const port = process.env.PORT || 3000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ['*'], // Add local dev origin
    methods: ['GET', 'POST'], // Allow only specific methods
  },
});

// Middleware for authentication and project validation
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.split(' ')[1];
    const projectId = socket.handshake.query.projectId;

    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
      return next(new Error('Invalid or missing projectId'));
    }

    const project = await projectModel.findById(projectId);
    if (!project) {
      return next(new Error('Project not found'));
    }

    if (!token) {
      return next(new Error('Missing authentication token'));
    }

    const decoded = jwt.verify(token, process.env.SECRET);
    if (!decoded) {
      return next(new Error('Invalid authentication token'));
    }

    // Attach validated project and user to socket
    socket.project = project;
    socket.user = decoded;

    next();
  } catch (error) {
    console.error('Authentication Error:', error.message);
    next(new Error('Authentication failed'));
  }
});

// Socket.IO event handling
io.on('connection', (socket) => {
  const roomId = socket.project._id.toString();
  socket.roomId = roomId;

  console.log(`User connected: ${socket.user.email || 'Unknown User'}`);

  socket.join(roomId);

  // Handle project messages
  socket.on('project-message', async (data) => {
    try {
      const message = data.message || '';

      // Broadcast message to others in the room
      socket.broadcast.to(roomId).emit('project-message', data);

      // Check if AI interaction is requested
      if (message.includes('@ai')) {
        const prompt = message.replace('@ai', '').trim();
        const result = await generateResult(prompt);

        // Send AI-generated message to the room
        io.to(roomId).emit('project-message', {
          message: result,
          sender: { _id: 'ai', email: 'AI' },
        });
      }
    } catch (error) {
      console.error('Error handling project-message:', error.message);
    }
  });

  // Handle user disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.user.email || 'Unknown User'}`);
    socket.leave(roomId);
  });
});

// Start the server
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
