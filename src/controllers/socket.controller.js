const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
    // Force long-polling for Vercel serverless functions, or allow both if hosted on traditional VPS
    transports: process.env.VERCEL ? ["polling"] : ["polling", "websocket"],
    allowEIO3: true,
  });

  io.use((socket, next) => {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.split(" ")[1] ||
      socket.handshake.query?.token;

    if (!token) {
      return next(new Error("Authentication error: Token missing"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user_id = decoded.id;
      socket.role = decoded.role;
      next();
    } catch (err) {
      next(new Error("Authentication error: Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    // Personal room for direct notification alerts
    socket.join(`user:${socket.user_id}`);

    // Room subscription for live complaint thread updates
    socket.on("join_complaint_room", (complaintId) => {
      if (complaintId) {
        socket.join(`complaint:${complaintId}`);
      }
    });

    socket.on("leave_complaint_room", (complaintId) => {
      if (complaintId) {
        socket.leave(`complaint:${complaintId}`);
      }
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized!");
  return io;
};

// Push direct alert to user personal room
const sendLiveNotification = (userId, notificationData) => {
  if (io) {
    io.to(`user:${userId}`).emit("notification", notificationData);
  }
};

// Broadcast complaint upvote/downvote updates to thread room
const broadcastComplaintVote = (complaintId, voteData) => {
  if (io) {
    io.to(`complaint:${complaintId}`).emit("complaint_voted", voteData);
  }
};

// Broadcast comment upvote/downvote updates to thread room
const broadcastCommentVote = (complaintId, voteData) => {
  if (io) {
    io.to(`complaint:${complaintId}`).emit("comment_voted", voteData);
  }
};

// Broadcast new comment posted to thread room
const broadcastNewComment = (complaintId, commentData) => {
  if (io) {
    io.to(`complaint:${complaintId}`).emit("new_comment", commentData);
  }
};

module.exports = {
  initSocket,
  getIO,
  sendLiveNotification,
  broadcastComplaintVote,
  broadcastCommentVote,
  broadcastNewComment,
};