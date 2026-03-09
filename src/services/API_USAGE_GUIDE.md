# API Usage Guide

This guide shows you how to use the centralized API system in your frontend application.

## Overview

All external APIs from the profile response are automatically configured and ready to use through the `api.js` service file.

## How It Works

1. **Login** - When user logs in, the `api_list` from the backend response is automatically initialized
2. **Decryption** - Username/password credentials are automatically decrypted using the crypto utility
3. **Storage** - API configurations are stored in localStorage for persistence
4. **Usage** - Import and call API functions from `services/api.js`

## Available APIs

Based on your profile response, these APIs are available:

### 1. General Search API
```javascript
import { generalSearchAPI } from '../services/api';

const searchParts = async () => {
  const result = await generalSearchAPI({
    searchQuery: "brake pad",
    // ... other search parameters
  });
  
  if (result) {
    console.log('Search results:', result);
  }
};
```

### 2. Stock List API
```javascript
import { stockListAPI } from '../services/api';

const getStock = async () => {
  const result = await stockListAPI({
    partNumber: "12345",
    warehouse: "ASL_SLW"
  });
  
  if (result) {
    console.log('Stock data:', result);
  }
};
```

### 3. Master List API
```javascript
import { masterListAPI } from '../services/api';

const getMasters = async () => {
  const result = await masterListAPI({
    type: "makes" // or "models", "variants", etc.
  });
  
  if (result) {
    console.log('Master data:', result);
  }
};
```

### 4. Parts List API
```javascript
import { partsListAPI } from '../services/api';

const getPartsList = async () => {
  const result = await partsListAPI({
    partNumber: "12345"
  });
  
  if (result) {
    console.log('Parts list:', result);
  }
};
```

### 5. Part Relations API
```javascript
import { partRelationsAPI } from '../services/api';

const getRelatedParts = async () => {
  const result = await partRelationsAPI({
    partNumber: "12345"
  });
  
  if (result) {
    console.log('Related parts:', result);
  }
};
```

### 6. Vehicle List API
```javascript
import { vehicleListAPI } from '../services/api';

const getVehicles = async () => {
  const result = await vehicleListAPI({
    partNumber: "12345"
  });
  
  if (result) {
    console.log('Vehicle list:', result);
  }
};
```

### 7. Image API
```javascript
import { imageAPI } from '../services/api';

const getImage = async () => {
  const result = await imageAPI({
    imageId: "12345"
  });
  
  if (result) {
    console.log('Image data:', result);
  }
};
```

### 8. Labour API
```javascript
import { labourAPI } from '../services/api';

const getLabourCategories = async () => {
  const result = await labourAPI();
  
  if (result) {
    console.log('Labour categories:', result);
  }
};
```

## Complete Component Example

```javascript
import React, { useState, useEffect } from 'react';
import { masterListAPI, partsListAPI } from '../services/api';

function ProductSearch() {
  const [makes, setMakes] = useState([]);
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch makes on component mount
  useEffect(() => {
    fetchMakes();
  }, []);

  const fetchMakes = async () => {
    setLoading(true);
    try {
      const result = await masterListAPI({
        type: "makes"
      });
      
      if (result && result.data) {
        setMakes(result.data);
      }
    } catch (error) {
      console.error('Error fetching makes:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchParts = async (searchQuery) => {
    setLoading(true);
    try {
      const result = await partsListAPI({
        searchQuery: searchQuery
      });
      
      if (result && result.data) {
        setParts(result.data);
      }
    } catch (error) {
      console.error('Error searching parts:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Product Search</h2>
      {loading && <p>Loading...</p>}
      
      <div>
        <h3>Makes</h3>
        <ul>
          {makes.map(make => (
            <li key={make.id}>{make.name}</li>
          ))}
        </ul>
      </div>
      
      <div>
        <input 
          type="text" 
          placeholder="Search parts..."
          onChange={(e) => searchParts(e.target.value)}
        />
        
        <h3>Parts</h3>
        <ul>
          {parts.map(part => (
            <li key={part.id}>{part.name}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default ProductSearch;
```

## Backend APIs (Local)

For your local backend APIs, use the same pattern:

```javascript
import { profileAPI, loginAPI, uiAssetsAPI } from '../services/api';

// Get user profile
const profile = await profileAPI();

// Get UI assets
const assets = await uiAssetsAPI();
```

## Error Handling

All API functions return `null` on error and log the error to console. Always check for null:

```javascript
const result = await masterListAPI({ type: "makes" });

if (result) {
  // Success - use the data
  console.log(result);
} else {
  // Error - show error message to user
  alert('Failed to fetch data');
}
```

## Checking API Configuration

To check if APIs are initialized:

```javascript
import apiConfigManager from '../services/apiConfig';

if (apiConfigManager.isInitialized()) {
  console.log('APIs are ready to use');
  console.log('Available APIs:', apiConfigManager.getAllApis());
} else {
  console.log('APIs not initialized - user needs to login');
}
```

## Manual Initialization (if needed)

If you need to manually initialize the API config (e.g., after page refresh):

```javascript
import apiConfigManager from '../services/apiConfig';

// This happens automatically on login, but you can also do it manually
const user = JSON.parse(localStorage.getItem('user'));
if (user && user.api_list) {
  apiConfigManager.initialize(user.api_list);
}
```

## Notes

- All API credentials are automatically decrypted using the AES utility
- API configurations are persisted in localStorage
- The system automatically handles Basic Auth and Bearer token authentication
- All external API calls include proper authentication headers
