import React, { useState } from 'react';
import { Message, User } from '../../types';
import { getMessageContent } from '../../utils/encryption';
import { useSmartReply } from '../../hooks/useSmartReply';
import { useMessages } from '../../context/MessageContext';
import { formatDistanceToNow } from 'date-fns';
import './ChatMessage.css';

interface ChatMessageProps {
  message: Message;
  currentUser: User | null;
  isLastMessage: boolean;
  conversationHistory: Message[];
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  currentUser,
  isLastMessage,
  conversationHistory,
}) => {
  const { smartReplies, loading, generateReplies, clearReplies } = useSmartReply();
  const { sendMessage } = useMessages();
  const [showReplies, setShowReplies] = useState(false);

  // Check if the message is from the current user
  const isOwnMessage = currentUser?._id === message.sender._id;

  // Get decrypted content if message is encrypted
  const content = getMessageContent(message);

  // Format timestamp
  const timestamp = message.timestamp instanceof Date
    ? formatDistanceToNow(message.timestamp, { addSuffix: true })
    : 'Just now';

  // Handle generating smart replies
  const handleSmartReply = () => {
    if (!showReplies) {
      generateReplies(message, conversationHistory);
      setShowReplies(true);
    } else {
      clearReplies();
      setShowReplies(false);
    }
  };

  // Handle selecting a smart reply
  const handleSelectReply = (text: string) => {
    sendMessage(text, 'text');
    clearReplies();
    setShowReplies(false);
  };

  return (
    <div className={`chat-message ${isOwnMessage ? 'own' : ''}`}>
      <div className="chat-message-container">
        {!isOwnMessage && (
          <div className="avatar-container">
            {message.sender.avatar ? (
              <img
                className="avatar"
                src={message.sender.avatar}
                alt={message.sender.username}
              />
            ) : (
              <div className="avatar-placeholder">
                {message.sender.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        )}
        <div className="message-content">
          {!isOwnMessage && (
            <div className="sender-name">{message.sender.username}</div>
          )}
          <div className={`message-bubble ${isOwnMessage ? 'own' : 'other'}`}>
            {message.type === 'text' ? (
              <p className="message-text">{content}</p>
            ) : message.type === 'image' ? (
              <img
                src={message.mediaUrl}
                alt="Shared"
                className="message-image"
              />
            ) : (
              <a href={message.mediaUrl} target="_blank" rel="noopener noreferrer" className="message-file">
                <svg className="file-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>{content}</span>
              </a>
            )}
            <div className="message-timestamp">{timestamp}</div>
          </div>
          
          {/* Display read receipts */}
          {isOwnMessage && message.readBy && message.readBy.length > 0 && (
            <div className="read-receipt">
              Read by {message.readBy.length} {message.readBy.length === 1 ? 'person' : 'people'}
            </div>
          )}
          
          {/* Smart Reply feature for messages from others */}
          {!isOwnMessage && isLastMessage && (
            <div className="smart-reply-container">
              <button
                onClick={handleSmartReply}
                className="smart-reply-button"
              >
                {!showReplies ? 'Smart Reply' : 'Hide Suggestions'}
              </button>
              
              {showReplies && (
                <div className="smart-replies">
                  {loading ? (
                    <div className="loading-text">Loading suggestions...</div>
                  ) : (
                    smartReplies.map((reply) => (
                      <button
                        key={reply.id}
                        onClick={() => handleSelectReply(reply.text)}
                        className="smart-reply-option"
                      >
                        {reply.text}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage; 