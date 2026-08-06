const http = require("http");
const app = require("./app.js");
const { initSocket } = require("./controllers/socket.controller.js");

const PORT = process.env.PORT || 5000;

// Wrap Express app inside native HTTP server
const server = http.createServer(app);

// Initialize Socket.io on the server instance
initSocket(server);

server.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});