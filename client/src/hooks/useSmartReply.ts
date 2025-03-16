import { useState, useCallback, useEffect } from 'react';
import { SmartReply, Message } from '../types';
import { generateSmartReplies } from '../services/smartReply';
import { getMessageContent } from '../utils/encryption';

/**
 * Custom hook for generating and managing smart replies
 */
export const useSmartReply = () => {
  const [smartReplies, setSmartReplies] = useState<SmartReply[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Generate smart replies based on a message
   * @param message The message to generate replies for
   * @param conversationHistory Previous messages for context
   */
  const generateReplies = useCallback(async (
    message: Message,
    conversationHistory: Message[] = []
  ) => {
    setLoading(true);
    setError(null);

    try {
      // First, decode the message content if it's encrypted
      const decodedContent = getMessageContent(message);
      
      // Extract conversation history as plain text
      const history = conversationHistory.map(msg => {
        const sender = msg.sender.username;
        const content = getMessageContent(msg);
        return `${sender}: ${content}`;
      });

      // Generate the smart replies
      const replies = await generateSmartReplies(decodedContent, history);
      setSmartReplies(replies);
    } catch (err) {
      console.error('Error generating smart replies:', err);
      setError('Failed to generate smart replies');
      setSmartReplies([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Clear smart replies
   */
  const clearReplies = useCallback(() => {
    setSmartReplies([]);
    setError(null);
  }, []);

  return {
    smartReplies,
    loading,
    error,
    generateReplies,
    clearReplies
  };
}; 