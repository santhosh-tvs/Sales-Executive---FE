/**
 * API Configuration Manager
 * Manages external API endpoints and credentials from login response
 */

import { decryptApiCredentials } from '../utils/crypto';

class ApiConfigManager {
  constructor() {
    this.apiList = [];
    this.apiMap = new Map();
    this.initialized = false;
  }

  /**
   * Initialize API configuration from login response
   * @param {Array} apiList - Array of API configurations from backend
   */
  initialize(apiList) {
    if (!Array.isArray(apiList)) {
      console.error('❌ Invalid API list provided');
      return;
    }

    console.log('🔧 Initializing API configuration with', apiList.length, 'APIs');

    // Decrypt credentials and store in map
    this.apiList = apiList.map(api => {
      const decrypted = decryptApiCredentials(api);
      
      // Store in map by API name for quick lookup
      this.apiMap.set(api.api_name.toLowerCase(), decrypted);
      
      return decrypted;
    });

    this.initialized = true;
    
    // Store in localStorage for persistence
    localStorage.setItem('api_config', JSON.stringify(this.apiList));
    
    console.log('✅ API configuration initialized');
    console.log('📋 Available APIs:', Array.from(this.apiMap.keys()));
  }

  /**
   * Fetch and initialize API configuration from backend profile API
   * @returns {Promise<boolean>} - Success status
   */
  async fetchAndInitialize() {
    try {
      console.log('🔄 Fetching external API configuration from profile API...');
      
      // Import apiService dynamically to avoid circular dependency
      const { default: apiService } = await import('./apiservice');
      
      const response = await apiService.get('/profile/user-details');
      
      if (response.success && response.data && response.data.profile && response.data.profile.api_list) {
        this.initialize(response.data.profile.api_list);
        console.log('✅ External API configuration fetched and initialized from profile');
        return true;
      } else {
        console.error('❌ Failed to fetch API configuration:', response.message);
        return false;
      }
    } catch (error) {
      console.error('❌ Error fetching API configuration:', error);
      return false;
    }
  }

  /**
   * Load API configuration from localStorage
   */
  loadFromStorage() {
    try {
      const stored = localStorage.getItem('api_config');
      if (stored) {
        this.apiList = JSON.parse(stored);
        
        // Rebuild map (credentials should already be decrypted)
        this.apiList.forEach(api => {
          this.apiMap.set(api.api_name.toLowerCase(), api);
        });
        
        this.initialized = true;
        console.log('✅ API configuration loaded from storage');
        return true;
      }
    } catch (error) {
      console.error('❌ Failed to load API config from storage:', error);
    }
    return false;
  }

  /**
   * Get API configuration by name
   * @param {string} apiName - Name of the API
   * @returns {object|null} - API configuration or null
   */
  getApi(apiName) {
    if (!this.initialized) {
      this.loadFromStorage();
    }

    const api = this.apiMap.get(apiName.toLowerCase());
    
    if (!api) {
      console.warn(`⚠️ API "${apiName}" not found in configuration`);
      return null;
    }

    return api;
  }

  /**
   * Get all API configurations
   * @returns {Array} - Array of all API configurations
   */
  getAllApis() {
    if (!this.initialized) {
      this.loadFromStorage();
    }

    return this.apiList;
  }

  /**
   * Get API URL by name
   * @param {string} apiName - Name of the API
   * @returns {string|null} - API URL or null
   */
  getApiUrl(apiName) {
    const api = this.getApi(apiName);
    return api ? api.api_url : null;
  }

  /**
   * Get API credentials by name
   * @param {string} apiName - Name of the API
   * @returns {object|null} - Credentials object or null
   */
  getApiCredentials(apiName) {
    const api = this.getApi(apiName);
    
    if (!api) return null;

    return {
      username: api.username,
      password: api.password,
      token: api.api_token,
      authType: api.auth_type
    };
  }

  /**
   * Get authorization header for API
   * @param {string} apiName - Name of the API
   * @returns {object} - Authorization headers
   */
  getAuthHeaders(apiName) {
    const api = this.getApi(apiName);
    
    if (!api) return {};

    const headers = {};

    if (api.auth_type === 'basic auth' && api.username && api.password) {
      // DIAGNOSTIC: Check if credentials still look encrypted
      const usernameEncrypted = api.username.includes(':');
      const passwordEncrypted = api.password.includes(':');
      
      if (usernameEncrypted || passwordEncrypted) {
        console.error(`🚨 CRITICAL: Credentials for "${apiName}" are still ENCRYPTED!`);
        console.error(`   Username encrypted: ${usernameEncrypted}`);
        console.error(`   Password encrypted: ${passwordEncrypted}`);
        console.error(`   This will cause 401 errors. Please log out and log in again.`);
      } else {
        console.log(`✅ Credentials for "${apiName}" appear decrypted (no ':' separator)`);
      }
      
      // Create Basic Auth header
      const credentials = btoa(`${api.username}:${api.password}`);
      headers['Authorization'] = `Basic ${credentials}`;
      
      console.log(`🔑 Basic Auth header created for "${apiName}"`);
    } else if (api.auth_type === 'bearer' && api.api_token) {
      // Create Bearer token header
      headers['Authorization'] = `Bearer ${api.api_token}`;
    } else if (api.api_token) {
      // Use token directly
      headers['Authorization'] = `Bearer ${api.api_token}`;
    }

    return headers;
  }

  /**
   * Clear API configuration
   */
  clear() {
    this.apiList = [];
    this.apiMap.clear();
    this.initialized = false;
    localStorage.removeItem('api_config');
    console.log('🗑️ API configuration cleared');
  }

  /**
   * Check if API configuration is initialized
   * @returns {boolean}
   */
  isInitialized() {
    return this.initialized || this.loadFromStorage();
  }
}

// Export singleton instance
const apiConfigManager = new ApiConfigManager();
export default apiConfigManager;
