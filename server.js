const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const youtubedl = require('youtube-dl-exec');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('fetchVideo', async (url) => {
        try {
            const info = await youtubedl(url, {
                dumpSingleJson: true,
            });
            socket.emit('videoInfo', info);
        } catch (error) {
            console.error('Error fetching video info:', error);
            socket.emit('videoError', 'Failed to fetch video info');
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
