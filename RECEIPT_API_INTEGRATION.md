# Receipt Creation API Integration

## Summary
Integrated the receipt creation API into the payment page with full form handling, validation, and submission functionality. The UI dynamically shows different input fields based on the selected payment method.

## API Endpoint
`POST /receipt/create-receipt`

## Request Payload Structure
```json
{
  "Source": "MCollect",
  "UniqueId": 894874,
  "LegalEntity": "Tvs Automobile solutions",
  "BusinessUnit": "DELPHI",
  "CustomerId": 3,
  "CustomerNumber": "10001560",
  "CustomerSiteId": 100000003393354,
  "CustomerSiteCode": "S N AUTO SPARES",
  "CustomerName": "S N AUTO SPARES",
  "ReceiptMethod": "Cash|Cheque|DD|Challan|UPI Payment",
  "UTRNumber": 123467975,
  "ReceiptRefNum": "MC3F241410008879",
  "ReceiptDate": "2023-08-16",
  "ReceiptAmount": 5000,
  "ReceiptCurrency": "INR",
  "OrderNumber": "",
  "Bank": "HDFC",
  "ReceiptMode": "Batch",
  "ReceiptRemarks": "",
  "ChequeNo": 9865645,
  "DraweeBank": "HDFC",
  "ChallanDdChequeNumber": "RRE186332",
  "ChallanDdChequeDate": "2026-03-10",
  "Place": "Madurai",
  "Attachment": "1245343.jpg"
}
```

## Features Implemented

### 1. Form State Management
- Receipt amount input
- Receipt date (defaults to today)
- Payment method selection (Cash, Cheque, DD, Challan, UPI)
- Cheque/DD/Challan number
- Bank name
- Place
- Date for cheque/DD/challan
- File attachment
- UTR number
- Receipt remarks

### 2. Dynamic UI Based on Payment Method

**Cash:**
- Shows amount input
- Displays "Change to Return" card with calculated excess amount
- Simple submission

**Cheque/DD/Challan:**
- Shows amount input
- Shows additional fields:
  - Cheque/DD/Challan number (required)
  - Bank name (required)
  - Place (required for Cheque/DD, not for Challan)
  - Date (required)
  - Attachment (optional)

**UPI Payment:**
- Shows "Coming Soon" message
- Disabled for now

### 3. Form Validation
- Receipt amount must be greater than 0
- Customer must be selected
- For Cheque/DD/Challan:
  - Number is required
  - Bank name is required
  - Place is required (except Challan)
- Shows alert messages for validation errors

### 4. API Integration
- Constructs payload from form data and customer details
- Generates unique IDs and reference numbers
- Sends POST request to `/receipt/create-receipt`
- Handles success and error responses
- Shows loading state during submission

### 5. User Experience
- Disabled button during submission
- Loading spinner on submit button
- Success message on completion
- Error message on failure
- Form reset after successful submission
- Returns to customer list after success

### 6. File Upload
- Hidden file input with custom upload zone
- Accepts images and PDFs
- Shows selected filename
- Max 10MB file size

## Form Fields Mapping

| UI Field | API Field | Required | Payment Methods |
|----------|-----------|----------|-----------------|
| Amount | ReceiptAmount | Yes | All |
| Receipt Date | ReceiptDate | Yes | All |
| Payment Method | ReceiptMethod | Yes | All |
| Cheque/DD/Challan Number | ChequeNo, ChallanDdChequeNumber | Yes* | Cheque, DD, Challan |
| Bank Name | Bank, DraweeBank | Yes* | Cheque, DD, Challan |
| Place | Place | Yes* | Cheque, DD |
| Date | ChallanDdChequeDate | Yes* | Cheque, DD, Challan |
| Attachment | Attachment | No | Cheque, DD, Challan |

*Required only for specific payment methods

## Auto-Generated Fields
- UniqueId: Generated from timestamp
- ReceiptRefNum: Generated as `MC{timestamp}`
- UTRNumber: Random 9-digit number
- CreatedBy: From localStorage userName
- LastUpdatedBy: From localStorage userName

## Customer Data Used
- CustomerId: From selected customer
- CustomerNumber: Customer code
- CustomerName: Customer name
- CustomerSiteId: From customer data or default
- CustomerSiteCode: Customer code or site code

## Success Flow
1. User enters receipt amount
2. User selects payment method
3. UI shows relevant fields based on method
4. User fills required fields
5. User clicks "Complete Payment"
6. Validation runs
7. API payload constructed
8. POST request sent
9. Success message shown
10. Form reset
11. Return to customer list

## Error Handling
- Form validation errors: Alert messages
- API errors: Alert with error message
- Network errors: Generic error message
- Loading state prevents multiple submissions

## Testing Checklist
- [ ] Cash payment submission works
- [ ] Cheque payment with all fields works
- [ ] DD payment with all fields works
- [ ] Challan payment (without place) works
- [ ] Validation prevents empty amount
- [ ] Validation requires cheque number for Cheque
- [ ] Validation requires bank name
- [ ] Validation requires place for Cheque/DD
- [ ] File upload shows filename
- [ ] Loading state shows during submission
- [ ] Success message appears
- [ ] Form resets after success
- [ ] Returns to list after success
- [ ] Error messages show on failure

## Files Modified
1. `FE/src/Sales-Executive/Receipt/Components/receipt.jsx`
   - Added form state management
   - Added input change handlers
   - Added API submission function
   - Added validation logic
   - Updated all input fields with value bindings
   - Added loading and disabled states

2. `FE/src/Sales-Executive/Receipt/Components/receipt.css`
   - Added button spinner animation
   - Added upload filename display
   - Added disabled button styles
