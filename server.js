const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, "public")));

const botName = "ChatCord Bot";

// Run when client connects
io.on("connection", socket => {

  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    // Welcome current user (only shows for one user)
    socket.emit("message", formatMessage(botName, "Welcome to ChatCord!"));
  
    // Broadcast when a user connects (shows to all users)
    // socket.broadcast.emit("message", formatMessage(botName, "A user has joined the chat"));
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(botName, `${user.username} user has joined the chat`)
      );
  });

  // Listen for chatMessage (shows up for everyone)
  socket.on("chatMessage", msg => {
    io.emit("message", formatMessage("USER", msg));
  });

  // Runs when a client disconnects (shows up for everyone)
  socket.on("disconnect", () => {
    io.emit("message", "A user has left the chat");
  });
});

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});