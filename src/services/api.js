/**
 * Centralized API Service
 * All API endpoints and functions in one place
 */

import apiService from './apiservice';
import apiConfigManager from './apiConfig';

/* ============================
   EXTERNAL API CALLS (Using API Config Manager)
============================ */

/**
 * General Search API
 * Search for parts by query string
 * Accepts FULL request body as-is from components
 */
export const generalSearchAPI = async (requestBody) => {
  try {
    if (apiConfigManager.isInitialized()) {
      return await apiService.callExternalApi('general search', requestBody);
    }
  } catch (error) {
    console.error('General search API error:', error);
  }
  return null;
};

/**
 * Labour API
 * Get labour categories and subcategories for service type functionality
 * 
 * This API is used to fetch service types (labour categories and subcategories) that can be
 * performed on vehicles. The data is used in:
 * - Search.jsx: For autocomplete suggestions when searching for service types
 * - SubCategory.jsx: For displaying service type sidebar based on selected category
 * - Service type pages: For filtering and displaying relevant service options
 * 
 * Response structure:
 * {
 *   requestSuccessful: boolean,
 *   labourCategory: Array<{labourCategoryId, labourCategoryName}>,
 *   labourSubcategory: Object<categoryId, Array<subcategory objects>>
 * }
 * 
 * @returns {Promise<Object|null>} Labour categories and subcategories data or null on error
 */
export const labourAPI = async () => {
  try {
    if (apiConfigManager.isInitialized()) {
      // Labour API requires userId and password in request body
      // These credentials are used to authenticate with the external labour service
      return await apiService.callExternalApi('labour api', {
        userId: "tvs_new",
        password: "tvs%$876"
      });
    }
  } catch (error) {
    console.error('Labour API error:', error);
  }
  return null;
};

/**
 * Parts List API
 * Get parts list by part number or filters
 * Accepts FULL request body as-is from components
 */
export const partsListAPI = async (requestBody) => {
  try {
    if (apiConfigManager.isInitialized()) {
      return await apiService.callExternalApi('part list', requestBody);
    }
  } catch (error) {
    console.error('Parts list API error:', error);
  }
  return null;
};

/**
 * Vehicle List API
 * Get vehicle list by part number
 * Accepts FULL request body as-is from components
 */
export const vehicleListAPI = async (requestBody) => {
  try {
    if (apiConfigManager.isInitialized()) {
      return await apiService.callExternalApi('vehicle list', requestBody);
    }
  } catch (error) {
    console.error('Vehicle list API error:', error);
  }
  return null;
};

/**
 * Master List API
 * Get master data (makes, models, variants, etc.)
 * Accepts FULL request body as-is from components
 */
export const masterListAPI = async (requestBody) => {
  try {
    console.log('🔍 masterListAPI called with:', requestBody);
    
    const isInitialized = apiConfigManager.isInitialized();
    console.log('📋 API Config Manager initialized:', isInitialized);
    
    if (!isInitialized) {
      console.error('❌ API Config Manager not initialized!');
      console.log('💡 Checking localStorage for api_config...');
      const stored = localStorage.getItem('api_config');
      if (stored) {
        console.log('✅ Found api_config in localStorage');
        const parsed = JSON.parse(stored);
        console.log('📦 API config count:', parsed.length);
        const masterListConfig = parsed.find(api => api.api_name.toLowerCase() === 'master list');
        console.log('🔍 Master list config:', masterListConfig);
      } else {
        console.error('❌ No api_config in localStorage!');
      }
      return null;
    }
    
    return await apiService.callExternalApi('master list', requestBody);
  } catch (error) {
    console.error('❌ Master list API error:', error);
    console.error('Error stack:', error.stack);
  }
  return null;
};

/**
 * Part Relations API
 * Get related parts for a part number
 * Accepts FULL request body as-is from components
 */
export const partRelationsAPI = async (requestBody) => {
  try {
    if (apiConfigManager.isInitialized()) {
      return await apiService.callExternalApi('part relation', requestBody);
    }
  } catch (error) {
    console.error('Part relations API error:', error);
  }
  return null;
};

/**
 * Stock List API (OLD - Deprecated)
 * Get stock information from old API
 */
export const stockListAPI = async (requestBody) => {
  try {
    if (apiConfigManager.isInitialized()) {
      return await apiService.callExternalApi('stock list', requestBody);
    }
  } catch (error) {
    console.error('Stock list API error:', error);
  }
  return null;
};

/**
 * External Stock API (NEW)
 * Get stock and ETA information from external API
 * @param {string} customerCode - Customer code
 * @param {string} partNo - Part number (partNumber in our system)
 * @param {string} warehouse - Warehouse location
 */
export const externalStockAPI = async (customerCode, partNo, warehouse) => {
  try {
    const url = process.env.REACT_APP_EXTERNAL_STOCK_API_URL;
    const username = process.env.REACT_APP_EXTERNAL_STOCK_API_USERNAME;
    const password = process.env.REACT_APP_EXTERNAL_STOCK_API_PASSWORD;

    if (!url || !username || !password) {
      console.error('External Stock API credentials not configured');
      return null;
    }

    // Create Basic Auth header
    const authHeader = 'Basic ' + btoa(`${username}:${password}`);

    const requestBody = {
      customerCode,
      partNo,
      warehouse
    };

    console.log('🔍 Calling External Stock API:', requestBody);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ External Stock API response:', data);
    
    return data;
  } catch (error) {
    console.error('External Stock API error:', error);
    return null;
  }
};

/**
 * Image API
 * Get product images
 */
export const imageAPI = async (params) => {
  try {
    if (apiConfigManager.isInitialized()) {
      return await apiService.callExternalApi('image', params);
    }
  } catch (error) {
    console.error('Image API error:', error);
  }
  return null;
};

/**
 * CNG API
 * Get CNG parts data from backend
 * Uses GET method - no request body needed
 */
export const cngAPI = async () => {
  try {
    return await apiService.get('/auth/cng');
  } catch (error) {
    console.error('CNG API error:', error);
  }
  return null;
};

/**
 * Electric API
 * Get electric vehicle parts data from backend
 * Uses GET method - no request body needed
 */
export const electricAPI = async () => {
  try {
    return await apiService.get('/auth/electric');
  } catch (error) {
    console.error('Electric API error:', error);
  }
  return null;
};

/**
 * Fast Movers API
 * Get fast moving parts data from backend
 * Uses GET method - no request body needed
 */
export const fastMoversAPI = async () => {
  try {
    return await apiService.get('/auth/fastmovers');
  } catch (error) {
    console.error('Fast Movers API error:', error);
  }
  return null;
};

/**
 * High Value API
 * Get high value parts data from backend
 * Uses GET method - no request body needed
 */
export const highValueAPI = async () => {
  try {
    return await apiService.get('/auth/highvalue');
  } catch (error) {
    console.error('High Value API error:', error);
  }
  return null;
};

/**
 * Discontinued Model API
 * Get discontinued model parts data from backend
 * Uses GET method - no request body needed
 */
export const discontinuedModelAPI = async () => {
  try {
    return await apiService.get('/auth/discontinue-model');
  } catch (error) {
    console.error('Discontinued Model API error:', error);
  }
  return null;
};

/**
 * Only With Us API
 * Get exclusive parts data from backend
 * Uses GET method - no request body needed
 */
export const onlyWithUsAPI = async () => {
  try {
    return await apiService.get('/auth/only-with-us');
  } catch (error) {
    console.error('Only With Us API error:', error);
  }
  return null;
};

/* ============================
   PARTSMART UNIFIED SEARCH API (via Backend Proxy)
============================ */

/**
 * Partsmart Autocomplete Suggestions API
 * Get real-time search suggestions as user types
 * @param {string} query - Search query (partial or complete)
 * @param {number} limit - Maximum suggestions to return (1-20, default: 5)
 */
export const partsmartSuggestionsAPI = async (query, limit = 5) => {
  try {
    console.log('🔍 Calling Partsmart Suggestions API (via proxy) with query:', query);
    
    const response = await apiService.get(`/partsmart/suggestions?q=${encodeURIComponent(query)}&limit=${limit}`);
    
    console.log('✅ Suggestions data:', response);
    return response;
  } catch (error) {
    console.error('❌ Partsmart suggestions API error:', error);
    return null;
  }
};

/**
 * Partsmart Unified Text Search API
 * Search using natural language with automatic NLP extraction
 * @param {Object} params - Search parameters
 * @param {string} params.query - Search query (natural language, vehicle number, or part number)
 * @param {Array<string>} params.sources - Search sources: ["tvs", "boodmo", "smart"] (default: ["tvs"])
 * @param {number} params.limit - Results per source (default: 10)
 * @param {Object} params.vehicle - Optional explicit vehicle context
 */
export const partsmartTextSearchAPI = async ({ query, sources = ['tvs','boodmo','smart'], limit = 10, vehicle = null }) => {
  try {
    console.log('🔍 Calling Partsmart Text Search API (via proxy) with query:', query);

    const requestBody = {
      query,
      sources,
      limitPerPart: limit  // Use limitPerPart instead of limit
    };

    if (vehicle) {
      requestBody.vehicle = vehicle;
    }

    console.log('📡 Request body:', requestBody);

    const response = await apiService.post('/partsmart/search', requestBody);

    console.log('✅ Text search data:', response);
    return response;
  } catch (error) {
    console.error('❌ Partsmart text search API error:', error);
    return null;
  }
};

/**
 * Partsmart Image Search API
 * Upload image(s) for part detection and search
 * @param {Object} params - Search parameters
 * @param {File|File[]} params.image - Single image or array of images
 * @param {string} params.query - Optional vehicle number for NLP detection
 * @param {Object} params.vehicle - Optional explicit vehicle context
 * @param {Array<string>} params.sources - Search sources (default: ["tvs"])
 * @param {number} params.limit - Results per source (default: 5)
 */
export const partsmartImageSearchAPI = async ({ image, query = null, vehicle = null, sources = ['tvs'], limit = 5, limitPerPart = null }) => {
  try {
    console.log('🔍 Calling Partsmart Image Search API (via proxy)');

    const formData = new FormData();
    formData.append('search_type', 'image');
    
    // Handle single or multiple images
    if (Array.isArray(image)) {
      image.forEach(img => formData.append('images', img));
    } else {
      formData.append('image', image);
    }

    if (query) {
      formData.append('query', query);
    }

    if (vehicle) {
      formData.append('vehicle', JSON.stringify(vehicle));
    }

    // Add sources as JSON array
    if (sources && sources.length > 0) {
      formData.append('sources', JSON.stringify(sources));
    }

    // Use limitPerPart if provided, otherwise use limit
    if (limitPerPart) {
      formData.append('limitPerPart', limitPerPart.toString());
    } else {
      formData.append('limit', limit.toString());
    }

    const response = await apiService.post('/partsmart/image-search', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });

    console.log('✅ Image search data:', response);
    return response;
  } catch (error) {
    console.error('❌ Partsmart image search API error:', error);
    return null;
  }
};

/**
 * Partsmart Audio Search API
 * Voice search with automatic speech-to-text
 * Note: This requires backend proxy support
 */
export const partsmartAudioSearchAPI = async ({ audio, mode = 'translate', vehicle = null, sources = ['tvs'], limit = 5 }) => {
  console.warn('Audio search not yet implemented in backend proxy');
  return null;
};

/**
 * Partsmart Multipart Search API
 * Search for multiple parts simultaneously
 * @param {Object} params - Search parameters
 * @param {string} params.query - Natural language query with multiple parts (for NLP extraction)
 * @param {Array<Object>} params.parts - Array of part objects: [{partDescription: "brake pad"}, ...]
 * @param {Object} params.vehicle - Vehicle context (optional for NLP, recommended for better results)
 * @param {Array<string>} params.sources - Search sources (default: ["tvs"])
 * @param {number} params.limit - Results per part (default: 10)
 */
export const partsmartMultipartSearchAPI = async ({ query = null, parts = null, vehicle = null, sources = ['tvs'], limit = 10 }) => {
  try {
    console.log('🔍 Calling Partsmart Multipart Search API (via proxy)');

    const requestBody = {
      search_type: 'multipart',
      sources,
      limitPerPart: limit  // Use limitPerPart instead of limit
    };

    // Either query (for NLP extraction) or parts array (structured)
    if (query) {
      requestBody.query = query;
    } else if (parts) {
      requestBody.parts = parts;
    }

    // Vehicle context is optional but recommended for better results
    if (vehicle) {
      requestBody.vehicle = vehicle;
    }

    console.log('📡 Multipart request body:', requestBody);

    const response = await apiService.post('/partsmart/search', requestBody);

    console.log('✅ Multipart search data:', response);
    return response;
  } catch (error) {
    console.error('❌ Partsmart multipart search API error:', error);
    return null;
  }
};

/* ============================
   LOCAL BACKEND APIs
============================ */

/**
 * Login API
 */
export const loginAPI = async (email, password, isProceedToLogin = 0) => {
  return await apiService.post('/auth/login', {
    email,
    password,
    is_proceed_to_login: isProceedToLogin
  });
};

/**
 * Forgot Password API
 */
export const forgotPasswordAPI = async (email, password, confirmPassword) => {
  return await apiService.post('/auth/forgot-password', { email, password, confirmPassword });
};

/**
 * Verify OTP API
 */
export const verifyOTPAPI = async (email, otp) => {
  // Ensure OTP is sent as a number, not a string
  return await apiService.post('/auth/verify-otp', { 
    email, 
    otp: typeof otp === 'string' ? parseInt(otp, 10) : otp 
  });
};

/**
 * Reset Password API
 */
export const resetPasswordAPI = async (email, newPassword) => {
  return await apiService.post('/auth/reset-password', { email, newPassword });
};

/**
 * UI Assets API
 */
export const uiAssetsAPI = async () => {
  return await apiService.get('/auth/ui-assets');
};

/**
 * Profile API
 */
export const profileAPI = async () => {
  return await apiService.get('/profile/user-details');
};

/**
 * View Customer API
 * Get customer details including customer-specific API list
 * @param {string} customerId - Customer code/ID
 */
export const viewCustomerAPI = async (customerId) => {
  try {
    return await apiService.get(`/profile/view-customer/${customerId}`);
  } catch (error) {
    console.error('View customer API error:', error);
  }
  return null;
};

/**
 * Warehouse Mapping API
 * Returns warehouses mapped to the customer (primary/secondary/tertiary)
 * combined with warehouses mapped to the sales executive.
 * The first 3 entries (if present) are always the customer's warehouses in order.
 * @param {string} customerCode - Customer code
 */
export const warehouseMappingAPI = async (customerCode) => {
  try {
    return await apiService.get(`/profile/warehouse-mapping`, { customer_code: customerCode });
  } catch (error) {
    console.error('Warehouse mapping API error:', error);
  }
  return null;
};

/**
 * Create Order API
 * Submit order via backend proxy (handles order API auth internally)
 */
export const createOrderAPI = async (orderData) => {
  try {
    return await apiService.post('/order/create', orderData);
  } catch (error) {
    console.error('Create order API error:', error);
  }
  return null;
};

export const customerDetails = async (orderData) => {
  try {
    if (apiConfigManager.isInitialized()) {
      return await apiService.callExternalApi('customer details', orderData);
    }
  } catch (error) {
    console.error('Customer details API error:', error);
  }
  return null;
};

/**
 * Get Order Details API
 * Fetch details of a specific order via backend proxy
 * @param {Object} requestBody - Request payload
 */
export const getOrderDetailsAPI = async (requestBody) => {
  try {
    return await apiService.post('/order/details', requestBody);
  } catch (error) {
    console.error('Get order details API error:', error);
  }
  return null;
};

/**
 * Get Order List API
 * Fetch list of orders via backend proxy
 * @param {Object} requestBody - Request payload
 */
export const getOrderListAPI = async (requestBody) => {
  try {
    // Ensure employee_code is never empty — PSM API requires it
    const empCode = requestBody.employee_code
      || localStorage.getItem('sales_executive_code')
      || (() => { try { return JSON.parse(localStorage.getItem('user') || '{}').sales_executive_code || ''; } catch { return ''; } })();

    return await apiService.post('/order/list', {
      ...requestBody,
      employee_code: empCode || null,
      limit:  requestBody.limit  ?? 100,
      offset: requestBody.offset ?? 0,
    });
  } catch (error) {
    console.error('Get order list API error:', error);
  }
  return null;
};

/**
 * Import Order API
 * Upload an Excel file to import orders in bulk via the backend proxy.
 * Request: multipart/form-data with fields:
 *   - employee_code (text)
 *   - attachment   (file — .xlsx)
 * @param {File}   file         - The Excel file to upload
 * @param {string} employeeCode - Sales executive employee code
 */
export const importOrderAPI = async (file, employeeCode) => {
  try {
    const formData = new FormData();
    formData.append('employee_code', employeeCode);
    formData.append('attachment', file, file.name);

    return await apiService.post('/order/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  } catch (error) {
    console.error('Import order API error:', error);
  }
  return null;
};

/**
 * Import Order Status API
 * Fetch import job list with date range and pagination
 * @param {Object} params - { from_date, to_date, limit, offset }
 */
export const importOrderStatusAPI = async (params = {}) => {
  try {
    return await apiService.post('/order/import-status', {
      from_date: params.from_date || '',
      to_date: params.to_date || '',
      limit: params.limit ?? 10,
      offset: params.offset ?? 0,
    });
  } catch (error) {
    console.error('Import order status API error:', error);
  }
  return null;
};

/**
 * Wishlist APIs
 */
export const getWishlistAPI = async (params = {}) => {
  try {
    const query = new URLSearchParams();
    if (params.customer_id) query.append('customer_id', params.customer_id);
    if (params.page)        query.append('page', params.page);
    if (params.pageSize)    query.append('pageSize', params.pageSize);
    const qs = query.toString();
    return await apiService.get(`/wishlist/list${qs ? '?' + qs : ''}`);
  } catch (error) {
    console.error('Get wishlist API error:', error);
  }
  return null;
};

export const addToWishlistAPI = async (data) => {
  try {
    return await apiService.post('/wishlist/add', data);
  } catch (error) {
    console.error('Add to wishlist API error:', error);
  }
  return null;
};

export const deleteFromWishlistAPI = async (wishlist_ids) => {
  try {
    return await apiService.post('/wishlist/delete', { wishlist_id: wishlist_ids });
  } catch (error) {
    console.error('Delete from wishlist API error:', error);
  }
  return null;
};

/**
 * Outstanding Invoice API
 * Fetch outstanding invoices for a customer from the Oracle external API.
 * Routes through the catalog proxy (GET without Content-Type).
 * @param {object} params - { Customer_Name, As_On_Date, Business_Unit, Customer_Acct_Num }
 */
export const outstandingInvoiceAPI = async (params = {}) => {
  try {
    const apiConfig = apiConfigManager.getApi('Outstanding Invoice');
    if (!apiConfig) throw new Error('Outstanding Invoice API not configured');

    const authHeaders = apiConfigManager.getAuthHeaders('Outstanding Invoice');

    const queryString = new URLSearchParams({
      Customer_Name: params.Customer_Name || '',
      As_On_Date: params.As_On_Date || '',
      Business_Unit: params.Business_Unit || '',
      Customer_Acct_Num: params.Customer_Acct_Num || '',
    }).toString();

    const fullUrl = `${apiConfig.api_url}?${queryString}`;

    return await apiService.post('/catalog/external', {
      url: fullUrl,
      method: 'GET',
      headers: authHeaders,
    });
  } catch (error) {
    console.error('Outstanding Invoice API error:', error);
  }
  return null;
};

/**
 * ─── In-memory session caches (module-level, survive re-renders) ─────────────
 * Cleared by calling clearStockCaches() at the start of each product listing session.
 */
const _itemMasterCache = new Map();  // key: partNumber → full API response
const _stockCheckCache = new Map();  // key: inventoryItemId → parsed stock array

export const clearStockCaches = () => {
  _itemMasterCache.clear();
  _stockCheckCache.clear();
  console.log('Stock caches cleared');
};

/**
 * normalizeStockData — handle both Oracle response formats
 * Format A: [{ inventory_item_id, warehouse: ["KMS_SLW", "KMS_WHM"] }]  → each warehouse = qty 1
 * Format B: [{ organization_code: "KMS_SLW", available_to_reserve: 5 }] → sum per org
 */
const normalizeStockData = (parsed) => {
  if (!parsed) return null;
  const raw = Array.isArray(parsed) ? parsed : (parsed.data ?? [parsed]);
  if (!Array.isArray(raw) || raw.length === 0) return [];

  const result = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;

    // Format A — warehouse list
    if (Array.isArray(item.warehouse)) {
      item.warehouse.forEach(code => {
        result.push({ organization_code: String(code).trim(), available_to_reserve: 1 });
      });
    }
    // Format B — lot records
    else if (item.organization_code !== undefined || item.Organization_Code !== undefined) {
      const orgCode = String(item.organization_code || item.Organization_Code || '').trim();
      const qty = item.available_to_reserve !== undefined && item.available_to_reserve !== null
        ? Number(item.available_to_reserve)
        : (item.availableQty !== undefined ? Number(item.availableQty)
          : (item.qty !== undefined ? Number(item.qty) : 0));
      result.push({ organization_code: orgCode, available_to_reserve: qty });
    }
    // Format C — has inventoryItemId but no org code
    else if (item.inventory_item_id !== undefined || item.inventoryItemId !== undefined) {
      result.push({ organization_code: 'UNKNOWN', available_to_reserve: 1 });
    }
  }

  if (result.length === 0 && raw.length > 0) {
    result.push({ organization_code: 'UNKNOWN', available_to_reserve: 1 });
  }

  console.log('normalizeStockData:', result.length, 'records | orgs:',
    [...new Set(result.map(r => r.organization_code))].join(', '));
  return result;
};

/**
 * parseStockResponse — bracket-depth scanner for Oracle multipart responses
 * Extracts ALL JSON arrays from the raw text, merges and normalizes them.
 */
const parseStockResponse = (text) => {
  if (!text || !text.trim()) return null;

  // Oracle explicitly says no stock
  if (/no available records/i.test(text) && !text.includes('[{')) {
    console.log('Oracle: No available records');
    return [];
  }

  // HTML/XML error
  if (text.trimStart().startsWith('<')) return null;

  // Bracket-depth scan — extract ALL JSON arrays
  const allRecords = [];
  let searchFrom = 0;

  while (true) {
    const startIdx = text.indexOf('[{', searchFrom);
    if (startIdx === -1) break;

    let depth = 0;
    let endIdx = -1;
    for (let i = startIdx; i < text.length; i++) {
      if (text[i] === '[') depth++;
      else if (text[i] === ']') {
        depth--;
        if (depth === 0) { endIdx = i; break; }
      }
    }
    if (endIdx === -1) break;

    const jsonStr = text.slice(startIdx, endIdx + 1);
    try {
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const records = normalizeStockData(parsed);
        if (records && records.length > 0) allRecords.push(...records);
      }
    } catch (e) {
      console.warn('JSON parse failed at', startIdx, ':', e.message);
    }
    searchFrom = endIdx + 1;
  }

  if (allRecords.length > 0) {
    console.log('parseStockResponse: total', allRecords.length, 'records');
    return allRecords;
  }

  // Fallback: direct JSON parse
  try {
    const parsed = JSON.parse(text);
    const records = normalizeStockData(parsed);
    if (records && records.length > 0) return records;
  } catch { /* not JSON */ }

  if (/no available records/i.test(text)) return [];

  console.log('parseStockResponse: no data extracted');
  return null;
};

/**
 * Item Master API (Itemmaster)
 * Step 1 of stock check — translate partNumber → Oracle inventoryItemId.
 * Tries multiple api_name variants. Results cached in _itemMasterCache.
 */
export const itemMasterAPI = async (partNumber, buName = '') => {
  // Cache hit
  if (_itemMasterCache.has(partNumber)) {
    const cached = _itemMasterCache.get(partNumber);
    if (cached !== null) {
      console.log('ItemMaster cache hit:', partNumber);
      return cached;
    }
    _itemMasterCache.delete(partNumber); // retry on cached null
  }

  // Try multiple api_name variants
  const variants = ['itemmaster', 'item master', 'item_master', 'inventory item', 'inventoryitem'];
  let apiConfig = null;
  for (const v of variants) {
    const cfg = apiConfigManager.getApi(v);
    if (cfg) { apiConfig = cfg; break; }
  }

  if (!apiConfig) {
    console.warn('ItemMaster: no API config found');
    return null;
  }

  try {
    const authHeaders = apiConfigManager.getAuthHeaders(apiConfig.api_name);
    const baseUrl = (apiConfig.api_url || '').split('?')[0];
    const dateFrom = '2020-12-09T00:00:00';
    const dateTo   = '2026-12-22T10:00:00';

    const fullUrl = `${baseUrl}?Date_From=${encodeURIComponent(dateFrom)}&Date_To=${encodeURIComponent(dateTo)}&Bu_Name=${encodeURIComponent(buName)}&Item_Code=${encodeURIComponent(partNumber)}`;

    const res = await apiService.post('/catalog/external', {
      url:     fullUrl,
      method:  'GET',
      headers: authHeaders,
    });

    let parsed = res;
    if (typeof res === 'string') {
      try { parsed = JSON.parse(res); } catch { parsed = {}; }
    }

    // Handle all response shapes
    let data = null;
    if (Array.isArray(parsed)) {
      data = parsed;
    } else if (parsed?.returnStatus === '200' && Array.isArray(parsed?.data)) {
      data = parsed.data;
    } else if (Array.isArray(parsed?.data)) {
      data = parsed.data;
    }

    if (data && data.length > 0) {
      _itemMasterCache.set(partNumber, data);
      return data;
    }

    console.warn('ItemMaster: no data for', partNumber, '| response:', JSON.stringify(parsed)?.substring(0, 200));
    _itemMasterCache.set(partNumber, null);
    return null;
  } catch (error) {
    console.error('Itemmaster API error:', error);
    return null;
  }
};

/**
 * Stock Check New API (StockCheckNew)
 * Step 2 of stock check — get qty per warehouse for an inventoryItemId.
 * Results cached in _stockCheckCache.
 */
export const stockCheckNewAPI = async (inventoryItemId, warehouses = []) => {
  const cacheKey = String(inventoryItemId);

  // Cache hit
  if (_stockCheckCache.has(cacheKey)) {
    console.log('StockCheckNew cache hit:', cacheKey);
    return _stockCheckCache.get(cacheKey);
  }

  // Try multiple api_name variants
  const variants = ['stockchecknew', 'stock check new', 'stock_check_new', 'stockcheck', 'stock check'];
  let apiConfig = null;
  for (const v of variants) {
    const cfg = apiConfigManager.getApi(v);
    if (cfg) { apiConfig = cfg; break; }
  }

  if (!apiConfig) {
    console.warn('StockCheckNew: no API config found');
    return [];
  }

  try {
    const authHeaders = apiConfigManager.getAuthHeaders(apiConfig.api_name);
    const baseUrl = (apiConfig.api_url || '').split('?')[0];

    // Uppercase warehouse codes — Oracle is case-sensitive
    const warehouseList = warehouses.length > 0
      ? warehouses.map(w => String(w).trim().toUpperCase())
      : [];

    const requestBody = [{
      inventory_item_id: String(inventoryItemId),
      warehouse: warehouseList,
    }];

    console.log('📦 StockCheckNew request:', JSON.stringify(requestBody));

    const res = await apiService.post('/catalog/stock-check', {
      url:     baseUrl,
      data:    requestBody,
      headers: authHeaders,
    });

    console.log('📦 StockCheckNew raw response type:', typeof res);

    let rawString;
    if (typeof res === 'string') {
      rawString = res;
    } else if (res && typeof res === 'object') {
      if (Array.isArray(res)) {
        const records = normalizeStockData(res);
        if (records && records.length > 0) _stockCheckCache.set(cacheKey, records);
        return records ?? [];
      }
      if (res.data && Array.isArray(res.data)) {
        const records = normalizeStockData(res.data);
        if (records && records.length > 0) _stockCheckCache.set(cacheKey, records);
        return records ?? [];
      }
      rawString = JSON.stringify(res);
    } else {
      rawString = String(res || '');
    }

    const result = parseStockResponse(rawString);
    const records = result ?? [];

    if (records.length > 0) _stockCheckCache.set(cacheKey, records);
    console.log('StockCheckNew got', records.length, 'records');
    return records;
  } catch (error) {
    console.error('StockCheckNew API error:', error);
    return [];
  }
};

/**
 * Full Stock Check Flow
 * Chains ItemMaster → StockCheckNew with caching.
 * Uses warehouseMappingAPI warehouses from localStorage.
 */
export const checkStockByPartNumber = async (partNumber) => {
  try {
    const itemData = await itemMasterAPI(partNumber);
    if (!itemData || itemData.length === 0) {
      console.warn('No item found for part number:', partNumber);
      return { itemData: [], stockData: [], inventoryItemId: null };
    }

    const first = itemData[0];
    const inventoryItemId = String(
      first.inventoryItemId || first.inventory_item_id || first.InventoryItemId ||
      first.ItemId || first.item_id || first.INVENTORY_ITEM_ID || ''
    );

    if (!inventoryItemId) {
      return { itemData, stockData: [], inventoryItemId: null };
    }

    // Resolve warehouses: apiConfigManager → localStorage → selected_customer fields
    let warehouses = apiConfigManager.getCustomerWarehouses();
    if (!warehouses || warehouses.length === 0) {
      const stored = localStorage.getItem('customer_warehouses');
      if (stored) {
        try { warehouses = JSON.parse(stored); } catch { warehouses = []; }
      }
    }
    if (!warehouses || warehouses.length === 0) {
      const stored = localStorage.getItem('selected_customer');
      if (stored) {
        try {
          const profile = JSON.parse(stored);
          warehouses = [profile?.primary_ware_house, profile?.secondary_ware_house, profile?.teritary_ware_house].filter(Boolean);
        } catch { warehouses = []; }
      }
    }

    console.log(`🔍 Stock check: partNumber=${partNumber}, inventoryItemId=${inventoryItemId}, warehouses=`, warehouses);
    const stockData = await stockCheckNewAPI(inventoryItemId, warehouses);
    return { itemData, stockData, inventoryItemId };
  } catch (error) {
    console.error('checkStockByPartNumber error:', error);
    return { itemData: [], stockData: [], inventoryItemId: null };
  }
};

/* ============================
   EXPORT ALL
============================ */
export default {
  // External APIs
  generalSearchAPI,
  labourAPI,
  partsListAPI,
  vehicleListAPI,
  masterListAPI,
  partRelationsAPI,
  stockListAPI,
  externalStockAPI,
  imageAPI,
  cngAPI,
  electricAPI,
  fastMoversAPI,
  highValueAPI,
  discontinuedModelAPI,
  onlyWithUsAPI,
  
  // Partsmart Unified Search APIs
  partsmartSuggestionsAPI,
  partsmartTextSearchAPI,
  partsmartImageSearchAPI,
  partsmartAudioSearchAPI,
  partsmartMultipartSearchAPI,
  
  // Local Backend APIs
  loginAPI,
  forgotPasswordAPI,
  verifyOTPAPI,
  resetPasswordAPI,
  uiAssetsAPI,
  profileAPI,
  viewCustomerAPI,
  warehouseMappingAPI,
  createOrderAPI,
  customerDetails,
  getOrderDetailsAPI,
  getOrderListAPI,
  importOrderAPI,
  importOrderStatusAPI,
  getWishlistAPI,
  addToWishlistAPI,
  deleteFromWishlistAPI,
  outstandingInvoiceAPI,
  stockCheckNewAPI,
  itemMasterAPI,
  checkStockByPartNumber,
  clearStockCaches,
};
