import { io, Socket } from 'socket.io-client';
import { Message, TypingIndicator } from '../types';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:8000';

class SocketService {
  private socket: Socket | null = null;
  private messageListeners: ((message: Message) => void)[] = [];
  private typingListeners: ((typingData: TypingIndicator) => void)[] = [];
  private readReceiptListeners: ((data: { messageId: string; userId: string }) => void)[] = [];
  private connectionListeners: ((connected: boolean) => void)[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  public connect(token: string): void {
    if (this.socket?.connected) {
      return;
    }

    if (this.socket) {
      this.socket.disconnect();
    }

    this.socket = io(SOCKET_URL, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      timeout: 10000,
      forceNew: true,
    });

    this.setupEventListeners();
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.reconnectAttempts = 0;
      this.notifyConnectionListeners(false);
    }
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to socket:', this.socket?.id);
      this.reconnectAttempts = 0;
      this.notifyConnectionListeners(true);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        this.disconnect();
      }
      
      this.notifyConnectionListeners(false);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      this.notifyConnectionListeners(false);
      
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, attempt to reconnect
        this.socket?.connect();
      }
    });

    this.socket.on('new-message', (message: Message) => {
      this.notifyMessageListeners(message);
    });

    this.socket.on('typing', (data: TypingIndicator) => {
      this.notifyTypingListeners(data);
    });

    this.socket.on('read-receipt', (data: { messageId: string; userId: string }) => {
      this.notifyReadReceiptListeners(data);
    });
  }

  // Send a new message
  public sendMessage(message: Omit<Message, 'id' | 'timestamp' | 'readBy'>): void {
    if (!this.socket?.connected) {
      console.warn('Socket not connected. Message not sent.');
      return;
    }
    this.socket.emit('send-message', message);
  }

  // Send typing indicator
  public sendTyping(groupId: string, isTyping: boolean): void {
    if (!this.socket?.connected) return;
    this.socket.emit('typing', { groupId, isTyping });
  }

  // Mark message as read
  public markAsRead(messageId: string): void {
    if (!this.socket?.connected) return;
    this.socket.emit('mark-read', { messageId });
  }

  // Join a group chat
  public joinGroup(groupId: string): void {
    if (!this.socket?.connected) return;
    this.socket.emit('join-group', groupId);
  }

  // Leave a group chat
  public leaveGroup(groupId: string): void {
    if (!this.socket?.connected) return;
    this.socket.emit('leave-group', { groupId });
  }

  // Event listeners
  public addMessageListener(callback: (message: Message) => void): void {
    this.messageListeners.push(callback);
  }

  public removeMessageListener(callback: (message: Message) => void): void {
    this.messageListeners = this.messageListeners.filter(cb => cb !== callback);
  }

  public addTypingListener(callback: (typingData: TypingIndicator) => void): void {
    this.typingListeners.push(callback);
  }

  public removeTypingListener(callback: (typingData: TypingIndicator) => void): void {
    this.typingListeners = this.typingListeners.filter(cb => cb !== callback);
  }

  public addReadReceiptListener(callback: (data: { messageId: string; userId: string }) => void): void {
    this.readReceiptListeners.push(callback);
  }

  public removeReadReceiptListener(callback: (data: { messageId: string; userId: string }) => void): void {
    this.readReceiptListeners = this.readReceiptListeners.filter(cb => cb !== callback);
  }

  public addConnectionListener(callback: (connected: boolean) => void): void {
    this.connectionListeners.push(callback);
  }

  public removeConnectionListener(callback: (connected: boolean) => void): void {
    this.connectionListeners = this.connectionListeners.filter(cb => cb !== callback);
  }

  // Notify listeners
  private notifyMessageListeners(message: Message): void {
    this.messageListeners.forEach(callback => callback(message));
  }

  private notifyTypingListeners(typingData: TypingIndicator): void {
    this.typingListeners.forEach(callback => callback(typingData));
  }

  private notifyReadReceiptListeners(data: { messageId: string; userId: string }): void {
    this.readReceiptListeners.forEach(callback => callback(data));
  }

  private notifyConnectionListeners(connected: boolean): void {
    this.connectionListeners.forEach(callback => callback(connected));
  }
}

// Export a singleton instance
const socketService = new SocketService();
export default socketService; 