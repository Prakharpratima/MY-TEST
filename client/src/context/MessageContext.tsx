import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { Message, MessageState, Group, TypingIndicator } from '../types';
import { messagesAPI } from '../services/api';
import socketService from '../services/socket';
import { useAuth } from './AuthContext';
import { encryptMessage } from '../utils/encryption';

// Initial message state
const initialState: MessageState = {
  messages: [],
  activeGroup: null,
  loading: false,
  error: null,
};

// Message action types
type MessageAction =
  | { type: 'SET_ACTIVE_GROUP'; payload: Group }
  | { type: 'GET_MESSAGES_START' }
  | { type: 'GET_MESSAGES_SUCCESS'; payload: Message[] }
  | { type: 'GET_MESSAGES_FAIL'; payload: string }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'MARK_AS_READ'; payload: { messageId: string; userId: string } }
  | { type: 'CLEAR_MESSAGES' };

// Message reducer
const messageReducer = (state: MessageState, action: MessageAction): MessageState => {
  switch (action.type) {
    case 'SET_ACTIVE_GROUP':
      return {
        ...state,
        activeGroup: action.payload,
      };
    case 'GET_MESSAGES_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'GET_MESSAGES_SUCCESS':
      return {
        ...state,
        messages: action.payload,
        loading: false,
        error: null,
      };
    case 'GET_MESSAGES_FAIL':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload],
      };
    case 'MARK_AS_READ':
      return {
        ...state,
        messages: state.messages.map(message => 
          message.id === action.payload.messageId
            ? { ...message, readBy: [...message.readBy, action.payload.userId] }
            : message
        ),
      };
    case 'CLEAR_MESSAGES':
      return {
        ...state,
        messages: [],
        activeGroup: null,
      };
    default:
      return state;
  }
};

// Message context interface
interface MessageContextInterface extends MessageState {
  setActiveGroup: (group: Group) => void;
  sendMessage: (content: string, type: 'text' | 'image' | 'file', mediaUrl?: string) => Promise<void>;
  markAsRead: (messageId: string) => void;
  clearMessages: () => void;
  setTyping: (isTyping: boolean) => void;
  typingUsers: TypingIndicator[];
}

// Create the message context
const MessageContext = createContext<MessageContextInterface | undefined>(undefined);

// Message context provider
export const MessageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(messageReducer, initialState);
  const { user, isAuthenticated } = useAuth();
  const [typingUsers, setTypingUsers] = React.useState<TypingIndicator[]>([]);

  // Socket event listeners
  useEffect(() => {
    if (!isAuthenticated) return;

    // Add message listener
    const handleNewMessage = (message: Message) => {
      if (state.activeGroup && message.groupId === state.activeGroup._id) {
        dispatch({ type: 'ADD_MESSAGE', payload: message });
        // Mark message as read immediately if it's not mine
        if (user && message.sender._id !== user._id) {
          socketService.markAsRead(message.id);
        }
      }
    };

    // Read receipt listener
    const handleReadReceipt = (data: { messageId: string; userId: string }) => {
      dispatch({ type: 'MARK_AS_READ', payload: data });
    };

    // Typing indicator listener
    const handleTyping = (data: TypingIndicator) => {
      if (state.activeGroup && data.groupId === state.activeGroup._id && user && data.userId !== user._id) {
        // Add typing user
        setTypingUsers(prev => {
          // Check if user is already in the list
          const existingUser = prev.find(u => u.userId === data.userId);
          if (existingUser) return prev;
          return [...prev, data];
        });

        // Remove typing user after delay
        setTimeout(() => {
          setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
        }, 3000);
      }
    };

    socketService.addMessageListener(handleNewMessage);
    socketService.addReadReceiptListener(handleReadReceipt);
    socketService.addTypingListener(handleTyping);

    return () => {
      socketService.removeMessageListener(handleNewMessage);
      socketService.removeReadReceiptListener(handleReadReceipt);
      socketService.removeTypingListener(handleTyping);
    };
  }, [isAuthenticated, state.activeGroup, user]);

  // Fetch messages when active group changes
  useEffect(() => {
    if (state.activeGroup) {
      //getMessages(state.activeGroup._id);
      console.log('joining group', state.activeGroup._id);
      socketService.joinGroup(state.activeGroup._id);
    }

    return () => {
      if (state.activeGroup) {
        socketService.leaveGroup(state.activeGroup._id);
      }
    };
  }, [state.activeGroup]);

  // Set active group
  const setActiveGroup = (group: Group) => {
    dispatch({ type: 'SET_ACTIVE_GROUP', payload: group });
  };

  // Get messages for a group
  const getMessages = async (groupId: string) => {
    dispatch({ type: 'GET_MESSAGES_START' });
    try {
      const res = await messagesAPI.getMessages(groupId);
      dispatch({ type: 'GET_MESSAGES_SUCCESS', payload: res.data.messages });
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to fetch messages';
      dispatch({ type: 'GET_MESSAGES_FAIL', payload: errorMsg });
    }
  };

  // Send a message
  const sendMessage = async (content: string, type: 'text' | 'image' | 'file' = 'text', mediaUrl?: string) => {
    if (!state.activeGroup || !user) return;

    // Encrypt the content if it's a text message
    const shouldEncrypt = type === 'text';
    const encryptedContent = shouldEncrypt ? encryptMessage(content) : content;

    const newMessage = {
      content: encryptedContent,
      groupId: state.activeGroup._id,
      type,
      mediaUrl,
      encrypted: shouldEncrypt,
      sender: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar
      }
    };      

    try {
      socketService.sendMessage(newMessage);
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  // Mark message as read
  const markAsRead = (messageId: string) => {
    if (!user) return;
    socketService.markAsRead(messageId);
  };

  // Clear messages
  const clearMessages = () => {
    dispatch({ type: 'CLEAR_MESSAGES' });
  };

  // Set typing indicator
  const setTyping = (isTyping: boolean) => {
    if (!state.activeGroup || !user) return;
    socketService.sendTyping(state.activeGroup._id, isTyping);
  };

  return (
    <MessageContext.Provider
      value={{
        ...state,
        setActiveGroup,
        sendMessage,
        markAsRead,
        clearMessages,
        setTyping,
        typingUsers,
      }}
    >
      {children}
    </MessageContext.Provider>
  );
};

// Custom hook to use the message context
export const useMessages = (): MessageContextInterface => {
  const context = useContext(MessageContext);
  
  if (context === undefined) {
    throw new Error('useMessages must be used within a MessageProvider');
  }
  
  return context;
}; 