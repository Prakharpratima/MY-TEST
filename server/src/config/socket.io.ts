import { Server } from "socket.io";
import jwt from "jsonwebtoken";

export const configureWebSocketServer = (server: any) => {
    const io = new Server(server, {
        cors: {
            origin: "*",
        },
    });

    // Middleware to authenticate Socket.IO connections
    io.use((socket, next) => {
        console.log("Authenticating socket:", socket.id);
        const token = socket.handshake.auth?.token; // Get token from auth object

        if (!token) {
            console.log("No token provided");
            return next(new Error("Authentication error"));
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET!);
            socket.data.user = decoded; // Store user data in socket object
            next(); // Authentication successful
        } catch (err) {
            console.error("Invalid token:", err.message);
            return next(new Error("Authentication error"));
        }
    });


    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);

        socket.on("join-group", (groupId) => {
            console.log("User joined group:", groupId);
            socket.join(groupId);
        });

        socket.on("send-message", ({ groupId, message }) => {
            console.log("Message received:", message);
            io.to(groupId).emit("receiveMessage", message);
        });

        socket.on("typing", (groupId) => {
            io.to(groupId).emit("typing");
        });

        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
        });
    });
}
