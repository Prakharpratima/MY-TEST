import "reflect-metadata"
import app from "./app";
import { configureWebSocketServer } from "./config/socket.io";
import * as http from "node:http"; // Configure websocket
import dotenv from "dotenv";
import {Server} from "socket.io";

dotenv.config();


console.log("Dot Env Loaded", JSON.stringify(process.env));

const server = http.createServer(app);

// Websocket server configuration
configureWebSocketServer(server)

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
