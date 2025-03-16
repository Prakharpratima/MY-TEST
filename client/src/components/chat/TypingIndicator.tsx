import React from 'react';
import { TypingIndicator as TypingIndicatorType } from '../../types';
import './TypingIndicator.css';

interface TypingIndicatorProps {
  users: TypingIndicatorType[];
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ users }) => {
  if (users.length === 0) return null;

  const getTypingText = () => {
    if (users.length === 1) {
      return `${users[0].username} is typing...`;
    } else if (users.length === 2) {
      return `${users[0].username} and ${users[1].username} are typing...`;
    } else {
      return `${users[0].username} and ${users.length - 1} others are typing...`;
    }
  };

  return (
    <div className="flex items-center mb-3 ml-2">
      <div className="typing-indicator mr-2">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <span className="text-xs text-gray-600">{getTypingText()}</span>
    </div>
  );
};

export default TypingIndicator; 