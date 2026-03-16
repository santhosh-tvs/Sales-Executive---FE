# Receipt Customer API Integration

## Summary
Successfully integrated the customer API into the Receipt page to fetch real customer data from the backend instead of using hardcoded data.

## Changes Made

### 1. Frontend - Receipt Component (`FE/src/Sales-Executive/Receipt/Components/receipt.jsx`)

#### Added Imports
- `useEffect` from React for lifecycle management
- `apiService` from `../../../services/apiservice` for API calls

#### New State Variables
```javascript
const [customers, setCustomers] = useState([]);
const [loading, setLoading] = useState(false);
const [searchQuery, setSearchQuery] = useState('');
const [error, setError] = useState(null);
```

#### API Integration Function
```javascript
const fetchCustomers = async (search = '') => {
  try {
    setLoading(true);
    setError(null);
    
    const params = search ? { search } : {};
    const response = await apiService.get('/profile/sales-executive-customers', params);
    
    if (response.success && response.data) {
      // Transform API data to match component structure
      const transformedCustomers = response.data.map(customer => ({
        id: customer.customer_id,
        name: customer.customer_name,
        code: customer.customer_code,
        address: `${customer.address1 || ''} ${customer.address2 || ''}, ${customer.city || ''}, ${customer.state || ''} ${customer.post_code || ''}`.trim(),
        gst: customer.gst_number || 'N/A',
        mobile: customer.mobile || 'N/A',
        email: customer.email || 'N/A',
        creditLimit: customer.credit_limit || 'N/A',
        outstandingAmount: customer.outstanding_amount || '₹0'
      }));
      
      setCustomers(transformedCustomers);
    }
  } catch (err) {
    setError(err.response?.data?.message || 'Failed to fetch customers');
  } finally {
    setLoading(false);
  }
};
```

#### Search Functionality
- Added `value` and `onChange` handlers to search input
- Added `onKeyPress` handler for Enter key search
- Connected Submit button to `handleSearch` function

#### Enhanced ListView Component
Added support for:
- Loading state with spinner
- Error state with error message
- Empty state when no customers found
- Dynamic customer rendering from API data

### 2. Frontend - Receipt CSS (`FE/src/Sales-Executive/Receipt/Components/receipt.css`)

Added styles for:
- **Loading State**: Spinner animation and loading text
- **Error State**: Error icon and message styling
- **Empty State**: Empty icon and message styling

### 3. Backend API Endpoint

**Endpoint**: `GET /profile/sales-executive-customers`

**Authentication**: Requires Bearer token (JWT)

**Query Parameters**:
- `search` (optional): Search by customer name or code

**Response Structure**:
```json
{
  "success": true,
  "message": "Customers retrieved successfully",
  "data": [
    {
      "customer_id": 1,
      "customer_name": "BHALLA MOTORS",
      "customer_code": "PSW_000396",
      "address1": "123 Main Street",
      "address2": "",
      "city": "Chennai",
      "state": "Tamil Nadu",
      "post_code": "600001"
    }
  ]
}
```

## Features

### 1. Real-time Customer Data
- Fetches customers from database based on sales executive ID
- Automatically loads on component mount

### 2. Search Functionality
- Search by customer name or code
- Supports Enter key submission
- Real-time API call on search

### 3. Loading States
- Shows spinner while fetching data
- Prevents multiple simultaneous requests
- User-friendly loading message

### 4. Error Handling
- Displays error messages from API
- Fallback error message for network issues
- Visual error indicator

### 5. Empty State
- Shows when no customers match search
- Helpful message to adjust search criteria
- Clean, professional design

## API Flow

1. User opens Receipt page
2. Component mounts and calls `fetchCustomers()`
3. API request sent to `/profile/sales-executive-customers`
4. Backend validates JWT token
5. Backend queries database for customers assigned to sales executive
6. Response transformed to match component structure
7. Customers displayed in list view

## Security

- All API calls require authentication (JWT token)
- Token stored in localStorage and sent in Authorization header
- Backend validates token and extracts sales executive ID
- Only returns customers assigned to authenticated sales executive

## Testing Checklist

- [ ] Customers load on page mount
- [ ] Search by customer name works
- [ ] Search by customer code works
- [ ] Loading spinner displays during fetch
- [ ] Error message shows on API failure
- [ ] Empty state shows when no results
- [ ] Customer card click navigates to orders view
- [ ] Authentication token is sent with requests

## Future Enhancements

1. Add pagination for large customer lists
2. Add filters (by city, state, outstanding amount)
3. Add sorting options (name, code, outstanding)
4. Cache customer data to reduce API calls
5. Add refresh button to manually reload data
6. Implement debouncing for search input
