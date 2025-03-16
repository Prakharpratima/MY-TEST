import React, { useState } from 'react';
import { useGroups } from '../../context/GroupContext';
import { useMessages } from '../../context/MessageContext';
import { Group } from '../../types';
import GroupModal from './GroupModal';
import './GroupList.css';
const GroupList: React.FC = () => {
  const { groups, loading, error } = useGroups();
  const { activeGroup, setActiveGroup } = useMessages();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleSelectGroup = (group: Group) => {
    setActiveGroup(group);
  };

  // Show error message if there's an error
  if (error) {
    return (
      <div className="error-message">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  // Show loading indicator
  if (loading) {
    return (
      <div className="loading-groups">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="group-list">
      <div className="group-list-header">
        <h2 className="group-list-title">Groups</h2>
        <button
          className="create-group-button"
          onClick={() => setShowCreateModal(true)}
        >
         Create Group
        </button>
      </div>

      <div className="group-list-content">
        {groups.length === 0 ? (
          <div className="empty-message">
            <p>No groups found</p>
            <p>Create a new group to get started</p>
          </div>
        ) : (
          groups.map((group) => {
            if (!group) return null;
            return (
              <div
                key={group?._id}
                className={`group-item ${activeGroup?._id === group?._id ? 'active' : ''}`}
                onClick={() => handleSelectGroup(group)}
              >
                {group?.avatar ? (
                  <img
                    className="group-avatar"
                    src={group.avatar}
                    alt={group.name}
                  />
                ) : (
                  <div className="group-avatar-placeholder">
                    {group?.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="group-details">
                  <p className="group-name">{group?.name}</p>
                  <p className="group-meta">
                    {group?.members?.length} members
                  </p>
                </div>
              </div>
            )
          })
        )}
      </div>

      {showCreateModal && (
        <GroupModal
          onClose={() => setShowCreateModal(false)}
          mode="create"
        />
      )}
    </div>
  );
};

export default GroupList; 