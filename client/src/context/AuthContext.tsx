import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { AuthState, User } from '../types';
import { authAPI } from '../services/api';
import socketService from '../services/socket';

// Initial auth state
const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
  error: null,
};

// Auth action types
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_FAIL'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' };

// Auth reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
    case 'AUTH_FAIL':
      localStorage.removeItem('token');
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      localStorage.removeItem('token');
      socketService.disconnect();
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Auth context interface
interface AuthContextInterface extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

// Create the auth context
const AuthContext = createContext<AuthContextInterface | undefined>(undefined);

// Auth context provider
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user on initial render if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (state.token) {
        try {
          //const res = await authAPI.getMe();
          console.log("state",state);
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: { user: state.user!, token: state.token },
          });
          // Connect to socket
          socketService.connect(state.token);
        } catch (err) {
          dispatch({ type: 'AUTH_FAIL', payload: 'Authentication failed' });
        }
      } else {
        dispatch({ type: 'AUTH_FAIL', payload: 'No token found' });
      }
    };

    loadUser();
  }, [state.token]);

  // Login user
  const login = async (email: string, password: string) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const res = await authAPI.login({ email, password });
      console.log(res.data);
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user: res.data.user, token: res.data.token },
      });
      // Connect to socket
      socketService.connect(res.data.token);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Login failed';
      dispatch({ type: 'AUTH_FAIL', payload: errorMsg });
    }
  };

  // Register user
  const register = async (username: string, email: string, password: string) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const res = await authAPI.register({ username, email, password });
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user: res.data.user, token: res.data.token },
      });
      // Connect to socket
      socketService.connect(res.data.token);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Registration failed';
      dispatch({ type: 'AUTH_FAIL', payload: errorMsg });
    }
  };

  // Logout user
  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = (): AuthContextInterface => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}; 