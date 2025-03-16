import axios from 'axios';
import { SmartReply } from '../types';

const SMART_REPLY_URL = process.env.REACT_APP_SMART_REPLY_URL || 'https://api.openai.com/v1/chat/completions';
const API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

/**
 * Generate smart reply suggestions using OpenAI API
 * @param messageContent The message content to generate smart replies for
 * @param conversationHistory Previous messages in the conversation (for context)
 * @param numSuggestions Number of suggestions to generate
 * @returns Array of smart reply suggestions
 */
export const generateSmartReplies = async (
  messageContent: string,
  conversationHistory: string[] = [],
  numSuggestions: number = 3
): Promise<SmartReply[]> => {
  try {
    // If API key is not available, return mock data
    if (!API_KEY) {
      console.warn('OpenAI API key not found. Using mock data for smart replies.');
      return getMockSmartReplies(messageContent);
    }
    
    const prompt = buildPrompt(messageContent, conversationHistory);
    
    const response = await axios.post(
      SMART_REPLY_URL,
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant providing short, natural message responses.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 150,
        n: numSuggestions,
        temperature: 0.7,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        }
      }
    );

    // Extract suggestions from the response
    const suggestions = response.data.choices.map((choice: any, index: number) => ({
      id: `smart-reply-${index}`,
      text: choice.message.content.trim()
    }));

    return suggestions;
  } catch (error) {
    console.error('Error generating smart replies:', error);
    // Fallback to mock data in case of error
    return getMockSmartReplies(messageContent);
  }
};

/**
 * Build prompt for the AI model based on conversation context
 */
const buildPrompt = (messageContent: string, conversationHistory: string[]): string => {
  const context = conversationHistory.length > 0 
    ? `Previous messages:\n${conversationHistory.join('\n')}\n\n` 
    : '';
  
  return `${context}Generate ${3} short, natural message responses to this message: "${messageContent}"
  Each response should be no more than 10 words. Provide only the response text without any additional formatting.`;
};

/**
 * Get mock smart replies when API is not available
 */
const getMockSmartReplies = (messageContent: string): SmartReply[] => {
  // Extract keywords to make relevant suggestions
  const lowerMessage = messageContent.toLowerCase();
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return [
      { id: 'mock-1', text: 'Hi there! How are you?' },
      { id: 'mock-2', text: 'Hello! Nice to hear from you.' },
      { id: 'mock-3', text: 'Hey, what\'s up?' }
    ];
  }
  
  if (lowerMessage.includes('meet') || lowerMessage.includes('schedule') || lowerMessage.includes('time')) {
    return [
      { id: 'mock-1', text: 'I\'m available tomorrow afternoon.' },
      { id: 'mock-2', text: 'What time works for you?' },
      { id: 'mock-3', text: 'Let me check my calendar.' }
    ];
  }
  
  if (lowerMessage.includes('thanks') || lowerMessage.includes('thank you')) {
    return [
      { id: 'mock-1', text: 'You\'re welcome!' },
      { id: 'mock-2', text: 'No problem at all.' },
      { id: 'mock-3', text: 'Happy to help.' }
    ];
  }
  
  // Default generic responses
  return [
    { id: 'mock-1', text: 'Sounds good.' },
    { id: 'mock-2', text: 'I understand.' },
    { id: 'mock-3', text: 'Let me think about that.' }
  ];
}; 