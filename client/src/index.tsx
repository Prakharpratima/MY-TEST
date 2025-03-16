import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { format } from 'date-fns';
import { io } from "socket.io-client";

const socket = io("http://localhost:8000"); // Ensure this matches the server's URL

/* socket.on("connect", () => {
    console.log("Connected to server with ID:", socket.id); // This will verify the connection
    socket.emit("joinGroup", "test_group");
    socket.emit("sendMessage", {groupId: "test_group", message: "test_message"});

    setInterval(() => {
        socket.emit("typing", "test_group");
    }, 2000);
});

// Listen for messages from the server
socket.on("receiveMessage", (message) => {
    console.log("Message received from server:", message);
});

// Listen for typing event
socket.on("typing", () => {
    console.log("User is typing message.");
});

// Error handling
socket.on("connect_error", (error) => {
    console.error("Connection error:", error);
}); */

// Add global Date toJSON method to handle date formatting consistently
Date.prototype.toJSON = function() {
  return format(this, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
