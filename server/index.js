require("dotenv").config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require("cors");
const { ExpressPeerServer } = require('peer');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
app.use(cors());

const io = new Server(server, {
  cors: {
    origin: ["http://127.0.0.1:5173", "http://localhost:5173"],
    methods: ["GET", "POST"],
  },
  transports: ["polling"], 
});

const peerServer = ExpressPeerServer(server, {
  debug: true,
  path: '/'  
});

app.use('/peerjs', peerServer);

const rooms = {};
const meetingAdmins = {};
const users = new Map();


app.get('/api/generate-meeting-id', (req, res) => {
  const meetingId = uuidv4();
  res.json({ meetingId });
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('setUsername', (username) => {
    socket.username = username;
    users.set(username, socket.id);
    console.log(`Username set for ${socket.id}: ${username}`);
  });

  socket.on('createRoom', (meetingId) => {
    rooms[meetingId] = [];
    meetingAdmins[meetingId] = [];
    socket.emit('roomCreated', { meetingId: meetingId });
    console.log(`Room created with meeting ID: ${meetingId}`);
  });





socket.on('joinRoom', ({ meetingId, peerId }) => {
  
  if (!socket.username) {
      return socket.emit('error', 'Username must be set before joining a room.');
  }

  if (!peerId) {
      console.error('Peer ID is missing for user:', socket.username);
      return socket.emit('error', 'Peer ID must be provided.');
  }

  console.log(`${socket.username} joined with ${peerId}`);

  
  socket.join(meetingId);

  
  if (!rooms[meetingId]) {
      rooms[meetingId] = [];
  }
m
  const userExists = rooms[meetingId].some(user => user.username === socket.username);

  if (!userExists) {
      
      rooms[meetingId].push({
        username: socket.username,
        peerId,
        isAudioEnabled: true, 
        isVideoEnabled: true  
      });
      console.log(`User joined: ${socket.username}, Room: ${meetingId}`);

      
      io.to(meetingId).emit('userJoined', { peerId, username: socket.username });

      
      io.to(meetingId).emit('chatMessage', { system: true, text: `${socket.username} joined the meeting.` });
  }

if (!meetingAdmins[meetingId] || meetingAdmins[meetingId].length === 0) {
  meetingAdmins[meetingId] = [peerId];  
  console.log(`Promoting ${socket.username} (${peerId}) to admin.`);  
  io.to(peerId).emit('adminPromoted', peerId);  
}

io.to(meetingId).emit('roomUsers', rooms[meetingId].map(user => ({
  id: user.peerId,  
  name: user.username,
  isAdmin: meetingAdmins[meetingId] ? meetingAdmins[meetingId].includes(user.peerId) : false
})));



  
});



socket.on("promoteAdmin", ({ userId, meetingId }) => {
  if (!meetingAdmins[meetingId]) {
    meetingAdmins[meetingId] = [];
  }
  meetingAdmins[meetingId].push(userId);

  socket.to(meetingId).emit("adminPromoted", userId);

  const updatedUserList = rooms[meetingId].map(user => ({
    id: user.peerId,
    name: user.username,
    isAdmin: meetingAdmins[meetingId] ? meetingAdmins[meetingId].includes(user.peerId) : false
  }));
  io.to(meetingId).emit('roomUsers', updatedUserList);
});


socket.on("demoteAdmin", ({ userId, meetingId }) => {
  if (meetingAdmins[meetingId]) {
    meetingAdmins[meetingId] = meetingAdmins[meetingId].filter(adminId => adminId !== userId);

    const updatedUserList = rooms[meetingId].map(user => ({
      id: user.peerId,
      name: user.username,
      isAdmin: meetingAdmins[meetingId].includes(user.peerId)
    }));

    io.to(meetingId).emit("roomUsers", updatedUserList); 
  }
});



socket.on("muteUser", ({ userId, mediaType, meetingId }) => {
  socket.to(meetingId).emit("muteMedia", { userId, mediaType });
});

socket.on("removeUser", ({ userId, meetingId }) => {
  const room = rooms[meetingId]; 
  if (room) {
    
    rooms[meetingId] = room.filter(user => user.peerId !== userId);

    socket.to(meetingId).emit("userRemoved", { userId });

    const updatedUserList = rooms[meetingId].map(user => ({
      id: user.peerId,
      name: user.username,
      isAdmin: meetingAdmins[meetingId]?.includes(user.peerId) || false
    }));
    io.to(meetingId).emit("roomUsers", updatedUserList); 
  }
});


socket.on("endMeeting", ({ meetingId }) => {
  
  io.to(meetingId).emit("meetingEnded");

  
  delete rooms[meetingId];  

  
  delete meetingAdmins[meetingId];

  console.log(`Meeting ${meetingId} has been ended.`);
});





socket.on('userMediaStatus', ({ meetingId, username, isAudioEnabled, isVideoEnabled }) => {
  
  if (rooms[meetingId]) {
    const user = rooms[meetingId].find(user => user.username === username);
    if (user) {
      user.isAudioEnabled = isAudioEnabled;
      user.isVideoEnabled = isVideoEnabled;

      io.to(meetingId).emit('userMediaStatus', { username, isAudioEnabled, isVideoEnabled });
      console.log(`${username}'s media status updated in room ${meetingId}: audio=${isAudioEnabled}, video=${isVideoEnabled}`);
    }
  }
});



  socket.on("muteMedia", ({ meetingId, mediaType, userId }) => {
  
  socket.to(meetingId).emit("muteMedia", { userId, mediaType });
});

socket.on("unmuteMedia", ({ meetingId, mediaType, userId }) => {
  
  socket.to(meetingId).emit("unmuteMedia", { userId, mediaType });
});





socket.on('leaveRoom', (meetingId) => {
  if (!socket.username || !rooms[meetingId]) {
    return;
  }

  const leavingUser = rooms[meetingId].find(user => user.username === socket.username);

  if (leavingUser) {
    socket.leave(meetingId);
    rooms[meetingId] = rooms[meetingId].filter(user => user.username !== socket.username);

    
    socket.to(meetingId).emit('user-left', { peerId: leavingUser.peerId });

    io.to(meetingId).emit('roomUsers', rooms[meetingId]);
    io.to(meetingId).emit('chatMessage', {
      system: true,
      text: `${socket.username} left the room.`,
    });

    
    if (rooms[meetingId].length === 0) {
      delete rooms[meetingId];
    }
  }
});


  socket.on("chatMessage", (message) => {
    if (message.recipient) {
      const recipientSocketId = users.get(message.recipient);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("chatMessage", {
          user: socket.username,
          text: message.text,
        });
      }
    } else {
      io.to(message.meetingId).emit("chatMessage", {
        user: socket.username,
        text: message.text,
      });
    }
  });
  
  


socket.on('startRecording', ({ meetingId }) => {
  io.to(meetingId).emit('recordingStarted', { message: `${socket.username} started recording` });
});

socket.on('stopRecording', ({ meetingId }) => {
  io.to(meetingId).emit('recordingStopped', { message: `${socket.username} stopped recording` });
});

socket.on("userSharedScreen", ({ meetingId, username }) => {
  io.to(meetingId).emit("screenShared", { username });
});


socket.on("sendEmoji", (reaction) => {
  const { meetingId, emoji, user } = reaction;
  socket.to(meetingId).emit("receiveEmoji", reaction);
  console.log(`${user} sent emoji ${emoji} in meeting ${meetingId}`);
});

  

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  
    for (const meetingId of Object.keys(rooms)) {
      rooms[meetingId] = rooms[meetingId].filter(user => user.username !== socket.username);
      socket.to(meetingId).emit('userLeft', { username: socket.username, peerId: socket.id });
  
      io.to(meetingId).emit('chatMessage', {
        system: true,
        text: `${socket.username} has disconnected`
      });
  
      io.to(meetingId).emit('roomUsers', rooms[meetingId]);
  
      if (rooms[meetingId].length === 0) {
        delete rooms[meetingId];
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});







