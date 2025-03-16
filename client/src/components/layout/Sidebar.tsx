import React from 'react';
import { useAuth } from '../../context/AuthContext';
import GroupList from '../groups/GroupList';
import './Sidebar.css';

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="sidebar">
      {/* User info */}
      <div className="user-profile">
        <div className="avatar-container">
          {user?.avatar ? (
            <img
              className="user-avatar"
              src={user.avatar}
              alt={user.username}
            />
          ) : (
            <div className="avatar-placeholder">
              {user?.email.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="user-info">
          <p className="username">{user?.username}</p>
          <p className="user-email">{user?.email}</p>
        </div>
        <div className="logout-container">
          <button
            onClick={logout}
            className="logout-button"
            title="Logout"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>

      {/* Group list */}
      <div className="groups-container">
        <GroupList />
      </div>
    </div>
  );
};

export default Sidebar; 