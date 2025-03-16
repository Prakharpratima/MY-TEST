import React, { useState, useRef, useEffect } from 'react';
import { useMessages } from '../../context/MessageContext';
import { useMediaUpload } from '../../hooks/useMediaUpload';
import './MessageInput.css';

const MessageInput: React.FC = () => {
  const [message, setMessage] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const { sendMessage, setTyping } = useMessages();
  const { uploadMedia, loading: uploading, error: uploadError } = useMediaUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle sending text message
  const handleSend = async () => {
    if (message.trim()) {
      await sendMessage(message.trim(), 'text');
      setMessage('');
      // Clear typing indicator when message is sent
      handleStopTyping();
    }
  };

  // Handle keyboard shortcut to send message (Ctrl+Enter or Cmd+Enter)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  // Handle file upload trigger
  const handleAttachmentClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const isImage = file.type.startsWith('image/');
    
    try {
      // Upload the file to S3
      const mediaUrl = await uploadMedia(file);
      
      if (mediaUrl) {
        // Send the message with the media URL
        await sendMessage(
          file.name,
          isImage ? 'image' : 'file',
          mediaUrl
        );
      }
    } catch (error) {
      console.error('Failed to upload file:', error);
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle typing indicator logic
  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      setTyping(true);
    }
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set a new timeout to stop the typing indicator after 1.5 seconds of inactivity
    typingTimeoutRef.current = setTimeout(handleStopTyping, 1500);
  };
  
  const handleStopTyping = () => {
    if (isTyping) {
      setIsTyping(false);
      setTyping(false);
    }
  };
  
  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="message-input-container">
      {uploadError && (
        <div className="error-message">{uploadError}</div>
      )}
      
      <form className="message-form" onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
        <div className="input-wrapper">
          <textarea
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              handleTyping();
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="message-textarea"
            rows={1}
          />
          <div className="action-buttons">
            <button
              type="button"
              onClick={handleAttachmentClick}
              disabled={uploading}
              className="action-button"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>
            
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="action-button"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
            className="file-input"
            onChange={handleFileChange}
          />
        </div>
        
        <button
          type="submit"
          disabled={!message.trim() || uploading}
          className="send-button"
        >
          <span>Send</span>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
      
      {uploading && (
        <div className="upload-progress">
          <div className="upload-text">Uploading file...</div>
          <div className="progress-bar">
            <div className="progress-indicator"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageInput; 