import axios from "axios";
import apiConfigManager from './apiConfig';

const PORTS = {
    company: '4001',
    user: '4002',
    module: '4003',
    rbac: '4004', // Role-Based Access Control
    formService: '4005'
};

// Read base URL from environment variable
const BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:3000";

// Helper to build full API URL
const getApiUrl = (endpoint) => {
  // If endpoint already starts with /api, use it as is
  if (endpoint.startsWith('/api/')) {
    return `${BASE_URL}${endpoint}`;
  }
  // If endpoint starts with /, add /api prefix
  if (endpoint.startsWith('/')) {
    return `${BASE_URL}/api${endpoint}`;
  }
  // Otherwise, add both /api and /
  return `${BASE_URL}/api/${endpoint}`;
};


// Function to create an Axios instance with conditional authorization header
const  createApiClient= () => {
    const token = localStorage.getItem("authToken"); // Retrieve token from localStorage

    const headers = {
        "Content-Type": "application/json",
    };

    // Only add Authorization header if token exists
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    return axios.create({
        baseURL: BASE_URL,
        timeout: 20000,
        headers: headers,
    }); 
};

const createApiClients = () => {
    const token = localStorage.getItem("authToken"); // Retrieve token from localStorage

    const headers = {
        // "Content-Type": "application/json",
    };

    // Only add Authorization header if token exists
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    return axios.create({
        baseURL: BASE_URL,
        timeout: 20000,
        headers: headers,
    }); 
};

// Common API service methods
const apiService = {
    get: async (endpoint, params = {}) => {
        try {
            const client = createApiClient();
            const response = await client.get(endpoint, { params });
            return response.data;
        } catch (error) {
            console.error(`GET ${endpoint} :`, error);
            throw error;
        }
    },

    post: async (endpoint, data = {}, config = {}) => {
        try {
            const client = createApiClient();
            const response = await client.post(endpoint, data, config);
            return response.data;
        } catch (error) {
            console.error(`POST ${endpoint} `, error);
            throw error;
        }
    },

    put: async (endpoint, data = {}) => {
        try {
            const client = createApiClient();
            const response = await client.put(endpoint, data);
            return response.data;
        } catch (error) {
            console.error(`PUT ${endpoint}:`, error);
            throw error;
        }
    },

    delete: async (endpoint) => {
        try {
            const client = createApiClient();
            const response = await client.delete(endpoint);
            return response.data;
        } catch (error) {
            console.error(`DELETE ${endpoint} :`, error);
            throw error;
        }
    },

    /**
     * Call external API using configuration from apiConfigManager
     * Routes through backend proxy to avoid CORS issues
     * @param {string} apiName - Name of the API from api_list
     * @param {object} data - Request payload
     * @param {object} options - Additional axios options
     * @returns {Promise} - API response
     */
    /**
     * Fetch outstanding invoices for a customer via the Oracle external API
     * @param {object} params - { Customer_Name, As_On_Date, Business_Unit, Customer_Acct_Num }
     */
    getOutstandingInvoices: async (params = {}) => {
        try {
            const apiConfig = apiConfigManager.getApi('Outstanding Invoice');
            if (!apiConfig) {
                throw new Error('Outstanding Invoice API not configured');
            }

            const authHeaders = apiConfigManager.getAuthHeaders('Outstanding Invoice');

            // Build URL with query params
            const queryString = new URLSearchParams({
                Customer_Name: params.Customer_Name || '',
                As_On_Date: params.As_On_Date || '',
                Business_Unit: params.Business_Unit || '',
                Customer_Acct_Num: params.Customer_Acct_Num || '',
            }).toString();

            const fullUrl = `${apiConfig.api_url}?${queryString}`;

            const client = createApiClient();
            const response = await client.post('/catalog/external', {
                url: fullUrl,
                method: 'GET',
                data: {},
                headers: authHeaders,
            });

            return response.data;
        } catch (error) {
            console.error('getOutstandingInvoices error:', error);
            throw error;
        }
    },

    callExternalApi: async (apiName, data = {}, options = {}) => {
        try {
            const apiConfig = apiConfigManager.getApi(apiName);

            if (!apiConfig) {
                throw new Error(`API "${apiName}" not found in configuration`);
            }

            const { api_url, http_method } = apiConfig;
            
            // CRITICAL DIAGNOSTIC: Check credentials BEFORE creating auth headers
            console.log(`🔍 Calling external API: ${apiName} (${http_method} ${api_url})`);
            console.log(`🔑 Raw API Config for "${apiName}":`, {
                api_name: apiConfig.api_name,
                auth_type: apiConfig.auth_type,
                username: apiConfig.username ? `${apiConfig.username.substring(0, 10)}...` : 'MISSING',
                password: apiConfig.password ? `${apiConfig.password.substring(0, 10)}...` : 'MISSING',
                username_has_colon: apiConfig.username ? apiConfig.username.includes(':') : false,
                password_has_colon: apiConfig.password ? apiConfig.password.includes(':') : false,
                has_token: !!apiConfig.api_token
            });
            
            const authHeaders = apiConfigManager.getAuthHeaders(apiName);

            console.log(`🔑 Auth headers:`, authHeaders ? 'Present' : 'Missing');
            console.log(`🔑 Auth header keys:`, Object.keys(authHeaders));

            // Use backend external endpoint to avoid CORS issues
            const proxyUrl = '/catalog/external';
            
            const proxyPayload = {
                url: api_url,
                method: http_method,
                data: data,
                headers: authHeaders
            };

            const client = createApiClient();
            const response = await client.post(proxyUrl, proxyPayload);
            
            console.log(`✅ External API response from ${apiName}:`, response.data);
            return response.data;
        } catch (error) {
            console.error(`❌ External API call failed for "${apiName}":`, error);
            
            // Provide more context for 401 errors
            if (error.response && error.response.status === 401) {
                console.error(`🔐 Authentication failed for "${apiName}". The external API rejected the credentials.`);
                console.error(`💡 This usually means:`);
                console.error(`   1. API credentials have expired`);
                console.error(`   2. API credentials are invalid`);
                console.error(`   3. The external API is rejecting the request`);
                console.error(`💡 Solution: Try logging out and logging in again to refresh API credentials.`);
            }
            
            throw error;
        }
    }
};


const apiServices = {
    get: async (endpoint, params = {}) => {
        try {
            const client = createApiClient();
            const response = await client.get(endpoint, { params });
            return response.data;
        } catch (error) {
            console.error(`GET ${endpoint} :`, error);
            throw error;
        }
    },

    post: async (endpoint, data = {}) => {
        try {
            const client = createApiClients();
            const response = await client.post(endpoint, data);
            return response.data;
        } catch (error) {
            console.error(`POST ${endpoint} `, error);
            throw error;
        }
    },

    put: async (endpoint, data = {}) => {
        try {
            const client = createApiClient();
            const response = await client.put(endpoint, data);
            return response.data;
        } catch (error) {
            console.error(`PUT ${endpoint}:`, error);
            throw error;
        }
    },

    delete: async (endpoint) => {
        try {
            const client = createApiClient();
            const response = await client.delete(endpoint);
            return response.data;
        } catch (error) {
            console.error(`DELETE ${endpoint} :`, error);
            throw error;
        }
    }
};

export { apiService, apiServices, PORTS, BASE_URL, getApiUrl };
export default apiService;
