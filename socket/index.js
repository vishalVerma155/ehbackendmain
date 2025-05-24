const { Server } = require('socket.io');
const socketAuth = require('../middleware/socketAuth.js');

let io;

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: ["http://localhost:5173", "http://localhost:5174"],
      credentials: true
    }
  });

  io.use(socketAuth);

  io.on('connection', (socket) => {
    const { role, _id } = socket.user;
    console.log(`${role} connected: ${_id}`);

    socket.join(`${role}:${_id}`);
    socket.join(role);
    if (role === 'admin') socket.join('admin');


    socket.on('disconnect', () => {
      console.log(`${role} disconnected: ${_id}`);
    });
  });
}

function getIO() {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
}

module.exports = { initSocket, getIO };
