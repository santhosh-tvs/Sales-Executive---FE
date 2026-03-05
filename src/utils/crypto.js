/**
 * AES-256-CBC Decryption Utility for Frontend
 * Matches the backend encryption algorithm
 */

import CryptoJS from 'crypto-js';
import logger from './logger';

// Get the secret key from environment and hash it with SHA-256
const getSecretKey = () => {
  const secretKey = process.env.REACT_APP_AES_SECRET_KEY || 'mytvs_api_aes_secret_key_12345';
  
  // Hash the secret key to match backend's crypto.createHash("sha256").update(key).digest()
  // CryptoJS.SHA256 returns a WordArray which is compatible with AES decryption
  const hashedKey = CryptoJS.SHA256(secretKey);
  
  return hashedKey;
};

/**
 * Decrypt AES-256-CBC encrypted text
 * @param {string} hash - Encrypted string in format "iv:encrypted"
 * @returns {string} - Decrypted text
 */
export const decrypt = (hash) => {
  try {
    if (!hash || typeof hash !== 'string') {
      logger.error('Invalid encrypted data');
      return null;
    }

    const parts = hash.split(':');
    const [ivBase64, encryptedBase64] = parts;
    
    if (!ivBase64 || !encryptedBase64) {
      logger.error('Invalid encrypted format');
      return null;
    }

    // Get the secret key (SHA-256 hashed)
    const key = getSecretKey();
    
    // Parse IV from base64
    const iv = CryptoJS.enc.Base64.parse(ivBase64);
    
    // Parse encrypted data from base64
    const encryptedData = CryptoJS.enc.Base64.parse(encryptedBase64);
    
    // Create cipherParams object for CryptoJS
    const cipherParams = CryptoJS.lib.CipherParams.create({
      ciphertext: encryptedData
    });
    
    // Decrypt using CryptoJS
    const decrypted = CryptoJS.AES.decrypt(
      cipherParams,
      key,
      {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      }
    );
    
    // Convert to UTF-8 string
    const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!decryptedText) {
      logger.error('Decryption failed - empty result');
      return null;
    }
    
    return decryptedText;
  } catch (error) {
    logger.error('Decryption error:', error);
    return null;
  }
};

/**
 * Decrypt API credentials from login response
 * @param {object} apiConfig - API configuration object with encrypted username/password
 * @returns {object} - API configuration with decrypted credentials
 */
export const decryptApiCredentials = (apiConfig) => {
  if (!apiConfig) return null;
  
  const decrypted = { ...apiConfig };
  
  // Decrypt username if present and encrypted
  if (apiConfig.username && apiConfig.username.includes(':')) {
    const decryptedUsername = decrypt(apiConfig.username);
    if (decryptedUsername) {
      decrypted.username = decryptedUsername;
    } else {
      logger.warn(`Username decryption failed for ${apiConfig.api_name}, using plain text`);
      decrypted.username = apiConfig.username;
    }
  } else {
    decrypted.username = apiConfig.username;
  }
  
  // Decrypt password if present and encrypted
  if (apiConfig.password && apiConfig.password.includes(':')) {
    const decryptedPassword = decrypt(apiConfig.password);
    if (decryptedPassword) {
      decrypted.password = decryptedPassword;
    } else {
      logger.warn(`Password decryption failed for ${apiConfig.api_name}, using plain text`);
      decrypted.password = apiConfig.password;
    }
  } else {
    decrypted.password = apiConfig.password;
  }
  
  return decrypted;
};
