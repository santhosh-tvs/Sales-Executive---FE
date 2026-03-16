# Reusable Customer Details Component

## Summary
Created a reusable CustomerDetails component that displays customer information in a consistent UI format matching the reference design. This component can be used across multiple pages (Create Order, Receipt, etc.).

## Component Location
`FE/src/Sales-Executive/components/CustomerDetails/CustomerDetails.jsx`
`FE/src/Sales-Executive/components/CustomerDetails/CustomerDetails.css`

## Features

### 1. Reusable Design
- Single component for all customer detail views
- Consistent UI across the application
- Matches reference design from Create Order page

### 2. Props
```javascript
<CustomerDetails 
  customer={customerObject}           // Required: Customer data
  onContinue={handleContinue}         // Required: Continue button callback
  continueButtonText="Continue"       // Optional: Button text (default: "Continue")
  showShipTo={false}                  // Optional: Show ship-to dropdown (default: false)
/>
```

### 3. Customer Information Displayed
- Customer ID
- Customer Email
- Credit Balance
- Credit Limit
- Over Due Invoice count
- Over Due Amount
- Total Outstanding Amount
- Customer Address
- Ship To (optional dropdown)

### 4. API Integration
- Fetches complete customer details from `/profile/view-customer/:customer_code`
- Fetches financial data from external API if account number available
- Merges data from multiple sources
- Shows loading state during fetch
- Handles errors gracefully

## Usage

### In Receipt Page
```javascript
import CustomerDetails from '../../components/CustomerDetails/CustomerDetails';

<CustomerDetails 
  customer={selectedCustomer}
  onContinue={() => setView('payment')}
  continueButtonText="Continue to Create Receipt"
  showShipTo={false}
/>
```

### In Create Order Page
```javascript
import CustomerDetails from '../../components/CustomerDetails/CustomerDetails';

<CustomerDetails 
  customer={selectedCustomer}
  onContinue={handleContinueToBrands}
  continueButtonText="Continue"
  showShipTo={true}
/>
```

## UI Design

### Layout
- White background with subtle shadow
- Header section with customer name and code
- Grid layout for details (2 columns on desktop, 1 on mobile)
- Footer with continue button

### Styling
- Blue labels (#20409A) in uppercase
- Colon separator between label and value
- Clean, readable typography
- Responsive grid layout
- Orange continue button (#F36F21)

### Ship To Dropdown (Optional)
- Custom dropdown with hover effects
- Shows ship-to options with code and address
- Selected option highlighted
- Smooth animations

## Benefits

1. **Consistency**: Same UI across all pages
2. **Maintainability**: Single source of truth for customer details
3. **Reusability**: Easy to add to new pages
4. **Flexibility**: Configurable via props
5. **Professional**: Matches reference design exactly

## Files Modified

1. Created: `FE/src/Sales-Executive/components/CustomerDetails/CustomerDetails.jsx`
2. Created: `FE/src/Sales-Executive/components/CustomerDetails/CustomerDetails.css`
3. Updated: `FE/src/Sales-Executive/Receipt/Components/receipt.jsx`

## Next Steps

To use in Create Order page, replace the existing customer detail view with:
```javascript
<CustomerDetails 
  customer={selectedCustomer}
  onContinue={handleContinueToBrands}
  continueButtonText="Continue"
  showShipTo={true}
/>
```
