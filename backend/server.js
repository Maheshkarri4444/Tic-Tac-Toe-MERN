// import express from "express";
// import dotenv from "dotenv";
// import cors from "cors"; 
// import connectToMongoDB from "./db/connectToMongoDb.js";
// import gameRotes from "./routes/game.routes.js";
// import cookieParser from "cookie-parser";
// import { Server } from 'socket.io';
// import http from 'http';

// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 5000;

// app.use(cors({ 
//     origin: 'http://localhost:5173', // Allow requests from your frontend
//     credentials: true // Allow cookies to be sent with requests
//   }));
// app.use(express.json());
// app.use(cookieParser());
// // console.log("MongoDB URI:", process.env.MONGO_DB_URI);
// // console.log("MongoDB port:", process.env.PORT);

// app.use("/api/game",gameRotes);

// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: 'http://localhost:5173',
//     methods: ['GET', 'POST'],
//     credentials: true,
//   },
// });

// const rooms = {};

// io.on('connection',(socket)=>{
//   console.log('A user connected:', socket.id);
//   // Event for joining a room
//   socket.on('joinRoom',(roomId)=>{
//     socket.join(roomId);
//     rooms[roomId] = rooms[roomId] ? rooms[roomId] + 1 : 1;

//     console.log(`User ${socket.id} joined room ${roomId}`);
//     console.log(`Room ${roomId} has ${rooms[roomId]} players`);

//     if (rooms[roomId] === 2) {
//       io.to(roomId).emit('startGame');
//     }
//   });

//   socket.on('disconnect',()=>{
//     console.log('User disconnected:', socket.id);
//     for (const room in rooms) {
//       if (rooms.hasOwnProperty(room)) {
//         if (rooms[room] > 0) rooms[room] -= 1;
//       }
//     }
//   });
// });



// server.listen(PORT,()=>{
//     connectToMongoDB();
//     console.log(`server running on the port ${PORT}`);
// });

// chatgpt 2
// import express from "express";
// import dotenv from "dotenv";
// import cors from "cors";
// import connectToMongoDB from "./db/connectToMongoDb.js";
// import gameRotes from "./routes/game.routes.js";
// import cookieParser from "cookie-parser";
// import { Server } from 'socket.io';
// import http from 'http';

// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 5000;

// // Middleware setup
// app.use(cors({
//   origin: 'http://localhost:5173', // Allow requests from your frontend
//   credentials: true // Allow cookies to be sent with requests
// }));
// app.use(express.json());
// app.use(cookieParser());

// // Routes
// app.use("/api/game", gameRotes);

// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: 'http://localhost:5173',
//     methods: ['GET', 'POST'],
//     credentials: true,
//   },
// });

// const rooms = {};

// io.on('connection', (socket) => {
//   console.log('A user connected:', socket.id);

//   // Event for joining a room
//   socket.on('joinRoom', ({ roomId, user }) => {
//     if (!roomId || !user) return;

//     socket.join(roomId);
//     rooms[roomId] = rooms[roomId] ? rooms[roomId] + 1 : 1;

//     console.log(`User ${user.username || 'Unknown'} (${socket.id}) joined room ${roomId}`);
//     console.log(`Room ${roomId} now has ${rooms[roomId]} players`);

//     // Emit player assignment
//     const assignedPlayer = rooms[roomId] === 1 ? 'X' : 'O';
//     socket.emit('playerAssignment', { assignedPlayer });

//     // Start the game if two players have joined
//     if (rooms[roomId] === 2) {
//       io.to(roomId).emit('startGame');
//     }
//   });

//   // Listen for player move
//   socket.on('playerMoved', ({ roomId }) => {
//     if (roomId) {
//       socket.to(roomId).emit('gameUpdated');
//     }
//   });

//   // Listen for game reset
//   socket.on('gameReset', ({ roomId }) => {
//     if (roomId) {
//       io.to(roomId).emit('resetGame');
//     }
//   });

//   // Handle user disconnection
//   socket.on('disconnect', () => {
//     console.log('User disconnected:', socket.id);
//     for (const room in rooms) {
//       if (rooms.hasOwnProperty(room) && rooms[room] > 0) {
//         rooms[room] -= 1;
//         if (rooms[room] === 0) {
//           delete rooms[room];
//         }
//       }
//     }
//   });
// });

// // Start the server
// server.listen(PORT, async () => {
//   await connectToMongoDB();
//   console.log(`Server running on port ${PORT}`);
// });


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
  origin: 'http://localhost:5173',
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

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('joinRoom', ({ roomId, user }) => {
    if (!roomId || !user) return;

    socket.join(roomId);
    
    if (!rooms.has(roomId)) {
      rooms.set(roomId, { players: new Set(), moves: [] });
    }
    
    const room = rooms.get(roomId);
    room.players.add(socket.id);

    const assignedPlayer = room.players.size === 1 ? 'X' : 'O';
    socket.emit('playerAssignment', { assignedPlayer });

    console.log(`User ${user.username || 'Unknown'} (${socket.id}) joined room ${roomId}`);
    console.log(`Room ${roomId} now has ${room.players.size} players`);

    if (room.players.size === 2) {
      io.to(roomId).emit('startGame');
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

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    rooms.forEach((room, roomId) => {
      if (room.players.has(socket.id)) {
        room.players.delete(socket.id);
        if (room.players.size === 0) {
          rooms.delete(roomId);
        }
      }
    });
  });
});

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