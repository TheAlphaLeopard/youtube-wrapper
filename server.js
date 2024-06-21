const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const youtubedl = require('youtube-dl-exec');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;
const VIDEOS_DIR = path.join(__dirname, 'videos');

app.use(express.static('public'));
app.use('/videos', express.static(VIDEOS_DIR));

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('downloadVideo', async (videoUrl) => {
        try {
            // Ensure the videos directory exists
            if (!fs.existsSync(VIDEOS_DIR)) {
                fs.mkdirSync(VIDEOS_DIR);
            }

            // Generate a unique filename
            const filename = `video-${Date.now()}.mp4`;
            const filepath = path.join(VIDEOS_DIR, filename);

            await youtubedl(videoUrl, {
                output: filepath,
                format: 'mp4',
            });

            const videoInfo = await youtubedl(videoUrl, {
                dumpSingleJson: true,
            });

            const videoDetails = {
                title: videoInfo.title,
                filename: filename,
            };

            // Emit video details once download is complete
            socket.emit('videoDetails', videoDetails);
        } catch (error) {
            console.error('youtube-dl Error:', error);
            socket.emit('downloadError', 'Failed to download video');
        }
    });

    socket.on('deleteVideo', (filename) => {
        const filePath = path.join(VIDEOS_DIR, filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`Deleted video: ${filename}`);
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
