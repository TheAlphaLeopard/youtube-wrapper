const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const youtubedl = require('youtube-dl-exec');
const youtube = require('youtube-api');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;
const YOUTUBE_API_KEY = 'YOUR_YOUTUBE_API_KEY';  // Replace with your actual YouTube API key

app.use(express.static('public'));
app.use('/videos', express.static(path.join(__dirname, 'videos')));

youtube.authenticate({
    type: 'key',
    key: YOUTUBE_API_KEY,
});

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('getVideoDetails', async (videoId) => {
        try {
            const videoInfo = await youtubedl(videoId, {
                dumpSingleJson: true,
            });

            const videoDetails = {
                title: videoInfo.title,
                description: videoInfo.description,
            };

            socket.emit('videoDetails', videoDetails);
        } catch (error) {
            console.error('youtube-dl Error:', error);
            socket.emit('downloadError', 'Failed to fetch video details');
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
