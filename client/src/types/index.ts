export interface User {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
}

export interface Message {
  id: string;
  content: string;
  sender: User;
  groupId: string;
  timestamp: Date;
  readBy: string[];
  type: 'text' | 'image' | 'file';
  mediaUrl?: string;
  encrypted: boolean;
}

export interface Group {
  _id: string;
  name: string;
  description?: string;
  members: User[];
  createdBy: string;
  createdAt: Date;
  avatar?: string;
}

export interface SmartReply {
  id: string;
  text: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface MessageState {
  messages: Message[];
  activeGroup: Group | null;
  loading: boolean;
  error: string | null;
}

export interface GroupState {
  groups: Group[];
  loading: boolean;
  error: string | null;
}

export interface TypingIndicator {
  userId: string;
  username: string;
  groupId: string;
} 