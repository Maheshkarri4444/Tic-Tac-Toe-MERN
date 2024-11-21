import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectToMongoDB from './db/connectToMongoDb.js';
import gameRoutes from './routes/game.routes.js';
import cookieParser from 'cookie-parser';
import { Server } from 'socket.io';
import http from 'http';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 7000;

// Middleware setup
app.use(cors({
  origin: 'https://tictactoemern.netlify.app/',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/game', gameRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const rooms = new Map();
const userSocketMap = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('joinRoom', ({ roomId, user }) => {
    if (!roomId || !user) return;

    socket.join(roomId);
    
    if (!rooms.has(roomId)) {
      rooms.set(roomId, { players: new Map(), moves: [] });
    }
    
    const room = rooms.get(roomId);
    room.players.set(socket.id);
    userSocketMap.set(user, socket.id);


    console.log(`User ${user || 'Unknown'} (${socket.id}) joined room ${roomId}`);
    console.log(`Room ${roomId} now has ${room.players.size} players`);

    if (room.players.size === 2) {
      io.to(roomId).emit('startGame');
    }

    if (room.players.size === 2) {
      socket.to(roomId).emit('opponentReconnected');
    }
  });

  socket.on('playerMoved', ({ roomId }) => {
    if (roomId && rooms.has(roomId)) {
      socket.to(roomId).emit('gameUpdated');
    }
  });

  socket.on('gameReset', ({ roomId }) => {
    if (roomId && rooms.has(roomId)) {
      const room = rooms.get(roomId);
      room.moves = [];
      io.to(roomId).emit('resetGame');
    }
  });

  socket.on('leaveRoom', ({ roomId, user }) => {
    if (roomId && rooms.has(roomId)) {
      const room = rooms.get(roomId);
      room.players.delete(socket.id);
      userSocketMap.delete(user);
      
      // Notify remaining player
      socket.to(roomId).emit('opponentDisconnected');
      
      if (room.players.size === 0) {
        rooms.delete(roomId);
      }
      
      socket.leave(roomId);
    }
  });


  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // socket.to(roomId).emit('opponentDisconnected');
    // rooms.forEach((room, roomId) => {
    //   if (room.players.has(socket.id)) {
    //     room.players.delete(socket.id);
    //     if (room.players.size === 0) {
    //       rooms.delete(roomId);
    //     }
    //   }
    // });

    rooms.forEach((room, roomId) => {
      if (room.players.has(socket.id)) {
        const user = room.players.get(socket.id);
        handlePlayerDisconnection(socket, roomId, user);
      }
    });
  });
});

const handlePlayerDisconnection = (socket, roomId, user) => {
  if (roomId && rooms.has(roomId)) {
    const room = rooms.get(roomId);
    room.players.delete(socket.id);
    userSocketMap.delete(user);
    
    // Notify remaining player about disconnection
    socket.to(roomId).emit('opponentDisconnected');
    
    if (room.players.size === 0) {
      rooms.delete(roomId);
    }
    
    socket.leave(roomId);
  }
}

const startServer = async () => {
  try {
    await connectToMongoDB();
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
