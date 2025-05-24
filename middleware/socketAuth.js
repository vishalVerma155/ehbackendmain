const jwt = require('jsonwebtoken');
const cookie = require('cookie');
const User = require('../models/user/web/user.model.js');
const Admin = require('../models/admin/web/admin.model.js');

const socketAuth = async (socket, next) => {
  try {
    const cookies = cookie.parse(socket.handshake.headers.cookie || '');
    
    const token = cookies.AccessToken;
    
    if (!token) throw new Error("No token");

    jwt.verify(token, process.env.JWT_SECURITY_KEY, async (err, decoded) => {
     
      if (err) return next(new Error("Unauthorized"));
      
      const Model = decoded.role === 'admin' ? Admin : User;

      const user = await Model.findById(decoded._id);
     
      if (!user) return next(new Error("User not found"));
    
      socket.user = decoded;
  
      next();
    });
  } catch (err) {
    next(new Error("Socket auth failed"));
  }
};

module.exports = socketAuth;
