const express = require('express');
const { Pool } = require('pg');
const socketIo = require('socket.io');

// PostgreSQL setup
const pool = new Pool({
  user: 'postgres',
  password: '182020', 
  host: 'localhost',
  database: 'node_chat',
  port: 5432,
});

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

// Serve static files
app.use(express.static('public'));

// Socket.io connection
io.on('connection', async (socket) => {
  console.log('New user connected');

  // Load past messages
  const { rows } = await pool.query('SELECT * FROM messages ORDER BY created_at DESC LIMIT 10');
  socket.emit('message_history', rows);

  // Handle new messages
  socket.on('chat_message', async (data) => {
    await pool.query(
      'INSERT INTO messages (username, message) VALUES ($1, $2)',
      [data.username, data.message]
    );
    io.emit('new_message', data); // Broadcast to all
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});

