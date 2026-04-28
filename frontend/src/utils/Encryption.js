import CryptoJS from "crypto-js";

/**
 * Encrypts a message using AES with a room-specific key.
 * If no key is provided, it uses a fallback.
 */
export const encryptMessage = (message, roomId) => {
  const secretKey = roomId || "fallback-secret-key";
  return CryptoJS.AES.encrypt(message, secretKey).toString();
};

/**
 * Decrypts an AES encrypted message.
 */
export const decryptMessage = (ciphertext, roomId) => {
  if (!ciphertext) return "";
  
  try {
    const secretKey = roomId || "fallback-secret-key";
    const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    
    // If originalText is empty, it might be a non-encrypted legacy message
    return originalText || ciphertext;
  } catch (e) {
    // If it fails, it's likely not an encrypted message, return as is
    return ciphertext;
  }
};
