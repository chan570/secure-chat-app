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
  try {
    const secretKey = roomId || "fallback-secret-key";
    const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    return originalText || "[Decryption Error]";
  } catch (e) {
    return "[Encrypted Message]";
  }
};
