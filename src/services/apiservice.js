import axios from "axios";

const PORTS = {
    company: '4001',
    user: '4002',
    module: '4003',
    rbac: '4004', // Role-Based Access Control
    formService: '4005'
};

// const BASE_URL = "https://websprint.mytvspartsmart.in/backend-api/";
const BASE_URL = "http://localhost:5000/api";
// const BASE_URL = "https://uat-websprint.mytvspartsmart.in"; // Updated to use the new port


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
        baseURL: `${BASE_URL}`,
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
        baseURL: `${BASE_URL}`,
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

    post: async (endpoint, data = {}) => {
        try {
            const client = createApiClient();
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

export { apiService, apiServices,PORTS };
