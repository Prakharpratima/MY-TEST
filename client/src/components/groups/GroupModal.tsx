import React, { useState } from 'react';
import { useGroups } from '../../context/GroupContext';
import { Group } from '../../types';
import './GroupModal.css';

interface GroupModalProps {
  onClose: () => void;
  mode: 'create' | 'edit';
  group?: Group;
}

const GroupModal: React.FC<GroupModalProps> = ({ onClose, mode, group }) => {
  const [name, setName] = useState<string>(group?.name || '');
  const [description, setDescription] = useState<string>(group?.description || '');
  const [error, setError] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  
  const { createGroup, updateGroup } = useGroups();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Group name is required');
      return;
    }

    try {
      setSubmitting(true);
      
      if (mode === 'create') {
        await createGroup(name, description);
      } else if (mode === 'edit' && group) {
        await updateGroup(group._id, name, description);
      }
      
      onClose();
    } catch (err) {
      setError('An error occurred. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">
            {mode === 'create' ? 'Create New Group' : 'Edit Group'}
          </h3>
          <button className="close-button" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="modal-body">
          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="group-name" className="form-label">
                Group Name
              </label>
              <input
                type="text"
                id="group-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
                placeholder="Enter group name"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="group-description" className="form-label">
                Description (optional)
              </label>
              <textarea
                id="group-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="form-input"
                placeholder="Enter group description"
                rows={3}
              />
            </div>

            <div className="modal-footer">
              <button
                type="button"
                onClick={onClose}
                className="cancel-button"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className={`submit-button ${submitting ? 'disabled' : ''}`}
              >
                {submitting
                  ? mode === 'create'
                    ? 'Creating...'
                    : 'Updating...'
                  : mode === 'create'
                  ? 'Create Group'
                  : 'Update Group'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GroupModal; 