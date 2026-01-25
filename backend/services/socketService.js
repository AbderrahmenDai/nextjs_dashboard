const socketIo = require('socket.io');

let io;
const userSockets = new Map(); // Map<userId, socketId>

// Initialize Socket.IO
const init = (server) => {
    io = socketIo(server, {
        cors: {
            origin: "*", // Allow all origins for now (adjust for production)
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log('🔌 New client connected:', socket.id);

        // Client identifies themselves with userId
        socket.on('identify', (userId) => {
            if (userId) {
                userSockets.set(userId, socket.id);
                console.log(`👤 User identified: ${userId} -> ${socket.id}`);
            }
        });

        socket.on('disconnect', () => {
            console.log('❌ Client disconnected:', socket.id);
            // Remove user from map
            for (const [userId, socketId] of userSockets.entries()) {
                if (socketId === socket.id) {
                    userSockets.delete(userId);
                    break;
                }
            }
        });
    });

    return io;
};

// Get the IO instance
const getIo = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};

// Send notification to a specific user
const sendNotificationToUser = (userId, notification) => {
    const socketId = userSockets.get(userId);
    if (socketId && io) {
        io.to(socketId).emit('notification:new', notification);
        console.log(`📡 Sent notification to user ${userId} (socket: ${socketId})`);
        return true;
    }
    console.log(`⚠️ User ${userId} not connected. Notification saved to DB only.`);
    return false;
};

module.exports = {
    init,
    getIo,
    sendNotificationToUser
};
