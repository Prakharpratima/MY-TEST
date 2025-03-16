import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { Group, GroupState } from '../types';
import { groupsAPI } from '../services/api';
import { useAuth } from './AuthContext';

// Initial group state
const initialState: GroupState = {
  groups: [],
  loading: false,
  error: null,
};

// Group action types
type GroupAction =
  | { type: 'GET_GROUPS_START' }
  | { type: 'GET_GROUPS_SUCCESS'; payload: Group[] }
  | { type: 'GET_GROUPS_FAIL'; payload: string }
  | { type: 'CREATE_GROUP_SUCCESS'; payload: Group }
  | { type: 'UPDATE_GROUP_SUCCESS'; payload: Group }
  | { type: 'DELETE_GROUP_SUCCESS'; payload: string }
  | { type: 'CLEAR_ERROR' };

// Group reducer
const groupReducer = (state: GroupState, action: GroupAction): GroupState => {
  switch (action.type) {
    case 'GET_GROUPS_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'GET_GROUPS_SUCCESS':
      return {
        ...state,
        groups: action.payload,
        loading: false,
        error: null,
      };
    case 'GET_GROUPS_FAIL':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case 'CREATE_GROUP_SUCCESS':
      return {
        ...state,
        groups: [...state.groups, action.payload],
        loading: false,
        error: null,
      };
    case 'UPDATE_GROUP_SUCCESS':
      return {
        ...state,
        groups: state.groups.map((group) =>
          group._id === action.payload._id ? action.payload : group
        ),
        loading: false,
        error: null,
      };
    case 'DELETE_GROUP_SUCCESS':
      return {
        ...state,
        groups: state.groups.filter((group) => group._id !== action.payload),
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

// Group context interface
interface GroupContextInterface extends GroupState {
  getGroups: () => Promise<void>;
  createGroup: (name: string, description?: string) => Promise<Group | null>;
  updateGroup: (groupId: string, name?: string, description?: string) => Promise<Group | null>;
  deleteGroup: (groupId: string) => Promise<boolean>;
  addMember: (groupId: string, userId: string) => Promise<boolean>;
  removeMember: (groupId: string, userId: string) => Promise<boolean>;
  clearError: () => void;
}

// Create the group context
const GroupContext = createContext<GroupContextInterface | undefined>(undefined);

// Group context provider
export const GroupProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(groupReducer, initialState);
  const { isAuthenticated } = useAuth();

  // Load groups on initial render if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      getGroups();
    }
  }, [isAuthenticated]);

  // Get all groups
  const getGroups = async () => {
    dispatch({ type: 'GET_GROUPS_START' });
    try {
      const res = await groupsAPI.getGroups();
      dispatch({ type: 'GET_GROUPS_SUCCESS', payload: res.data });
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to fetch groups';
      dispatch({ type: 'GET_GROUPS_FAIL', payload: errorMsg });
    }
  };

  // Create a new group
  const createGroup = async (name: string, description?: string): Promise<Group | null> => {
    dispatch({ type: 'GET_GROUPS_START' });
    try {
      const res = await groupsAPI.createGroup({ name, description });
      const newGroup = res.data;
      dispatch({ type: 'CREATE_GROUP_SUCCESS', payload: newGroup });
      return newGroup;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to create group';
      dispatch({ type: 'GET_GROUPS_FAIL', payload: errorMsg });
      return null;
    }
  };

  // Update a group
  const updateGroup = async (groupId: string, name?: string, description?: string): Promise<Group | null> => {
    dispatch({ type: 'GET_GROUPS_START' });
    try {
      const res = await groupsAPI.updateGroup(groupId, { name, description });
      const updatedGroup = res.data.group;
      dispatch({ type: 'UPDATE_GROUP_SUCCESS', payload: updatedGroup });
      return updatedGroup;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to update group';
      dispatch({ type: 'GET_GROUPS_FAIL', payload: errorMsg });
      return null;
    }
  };

  // Delete a group
  const deleteGroup = async (groupId: string): Promise<boolean> => {
    dispatch({ type: 'GET_GROUPS_START' });
    try {
      await groupsAPI.deleteGroup(groupId);
      dispatch({ type: 'DELETE_GROUP_SUCCESS', payload: groupId });
      return true;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to delete group';
      dispatch({ type: 'GET_GROUPS_FAIL', payload: errorMsg });
      return false;
    }
  };

  // Add a member to a group
  const addMember = async (groupId: string, userId: string): Promise<boolean> => {
    try {
      await groupsAPI.addMember(groupId, userId);
      // Refresh groups
      await getGroups();
      return true;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to add member';
      dispatch({ type: 'GET_GROUPS_FAIL', payload: errorMsg });
      return false;
    }
  };

  // Remove a member from a group
  const removeMember = async (groupId: string, userId: string): Promise<boolean> => {
    try {
      await groupsAPI.removeMember(groupId, userId);
      // Refresh groups
      await getGroups();
      return true;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to remove member';
      dispatch({ type: 'GET_GROUPS_FAIL', payload: errorMsg });
      return false;
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  return (
    <GroupContext.Provider
      value={{
        ...state,
        getGroups,
        createGroup,
        updateGroup,
        deleteGroup,
        addMember,
        removeMember,
        clearError,
      }}
    >
      {children}
    </GroupContext.Provider>
  );
};

// Custom hook to use the group context
export const useGroups = (): GroupContextInterface => {
  const context = useContext(GroupContext);
  
  if (context === undefined) {
    throw new Error('useGroups must be used within a GroupProvider');
  }
  
  return context;
}; 