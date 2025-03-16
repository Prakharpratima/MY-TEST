import React, { useEffect, useRef } from 'react';
import { useMessages } from '../../context/MessageContext';
import { useAuth } from '../../context/AuthContext';
import ChatMessage from './ChatMessage';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import './ChatWindow.css';

const ChatWindow: React.FC = () => {
  const { messages, activeGroup, loading, typingUsers } = useMessages();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUsers]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // If no active group is selected
  if (!activeGroup) {
    return (
      <div className="chat-empty">
        <div className="empty-state">
          <svg
            className="empty-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <h3 className="empty-title">No conversation selected</h3>
          <p className="empty-subtitle">
            Select a group from the sidebar to start messaging
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-window">
      {/* Chat header */}
      <div className="chat-header">
        <div className="group-avatar-container">
          {activeGroup.avatar ? (
            <img
              className="group-avatar"
              src={activeGroup.avatar}
              alt={activeGroup.name}
            />
          ) : (
            <div className="group-avatar-placeholder">
              {activeGroup.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="group-info">
          <h2 className="group-name">{activeGroup.name}</h2>
          <p className="group-members">
            {activeGroup.members?.length} members
          </p>
        </div>
      </div>

      {/* Messages area */}
      <div className="messages-container">
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="empty-messages">
            <div>
              <p>No messages yet</p>
              <p>Be the first to send a message!</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <ChatMessage
                key={message.id}
                message={message}
                currentUser={user}
                isLastMessage={index === messages.length - 1}
                conversationHistory={messages.slice(-5)} // Only pass last 5 messages for context
              />
            ))}
          </>
        )}

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <TypingIndicator users={typingUsers} />
        )}

        {/* Invisible element for scrolling to bottom */}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <MessageInput />
    </div>
  );
};

export default ChatWindow; 