import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

// Create axios instance with baseURL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth API endpoints
export const authAPI = {
  register: (userData: { username: string; email: string; password: string }) => 
    api.post('/auth/register', userData),
  
  login: (credentials: { email: string; password: string }) => 
    api.post('/auth/login', credentials),
  
  getMe: () => api.get('/auth/me'),
};

// Groups API endpoints
export const groupsAPI = {
  getGroups: () => api.get('/groups'),
  
  getGroupById: (groupId: string) => api.get(`/groups/${groupId}`),
  
  createGroup: (groupData: { name: string; description?: string }) => 
    api.post('/groups', groupData),
  
  updateGroup: (groupId: string, groupData: { name?: string; description?: string }) => 
    api.put(`/groups/${groupId}`, groupData),
  
  deleteGroup: (groupId: string) => api.delete(`/groups/${groupId}`),
  
  addMember: (groupId: string, userId: string) => 
    api.post(`/groups/${groupId}/members`, { userId }),
  
  removeMember: (groupId: string, userId: string) => 
    api.delete(`/groups/${groupId}/members/${userId}`),
};

// Messages API endpoints
export const messagesAPI = {
  getMessages: (groupId: string) => api.get(`/messages/${groupId}`),
  
  sendMessage: (messageData: { groupId: string; content: string; type: string; encrypted: boolean }) => 
    api.post('/messages', messageData),
  
  markAsRead: (messageId: string) => api.put(`/messages/${messageId}/read`),
  
  getSmartReplies: (messageId: string) => api.get(`/messages/${messageId}/smart-replies`),
};

// Media upload API endpoints
export const mediaAPI = {
  uploadMedia: (formData: FormData) => 
    api.post('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
};

export default api; 