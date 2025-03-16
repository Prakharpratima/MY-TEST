import CryptoJS from 'crypto-js';

// AES-128 encryption key (16 bytes)
const SECRET_KEY = process.env.REACT_APP_ENCRYPTION_KEY || 'secureMessageKey';

/**
 * Encrypts a message using AES-128 encryption
 * @param message - The message to encrypt
 * @returns Encrypted message string
 */
export const encryptMessage = (message: string): string => {
  return CryptoJS.AES.encrypt(message, SECRET_KEY).toString();
};

/**
 * Decrypts a message that was encrypted using AES-128
 * @param encryptedMessage - The encrypted message
 * @returns Decrypted message string
 */
export const decryptMessage = (encryptedMessage: string): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedMessage, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

/**
 * Determines if a message needs to be decrypted and decrypts it if needed
 * @param message - The message object
 * @returns The content of the message, decrypted if necessary
 */
export const getMessageContent = (message: { content: string; encrypted: boolean }): string => {
  if (message.encrypted) {
    return decryptMessage(message.content);
  }
  return message.content;
}; 