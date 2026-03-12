// Popup HTML templates for Beat Plan

export const getCustomerDetailsHTML = (customerDetails) => `
  <div style="text-align: left; color: #2c3e50; max-height: 500px; overflow-y: auto;">
    <!-- Header Section - Compact -->
    <div style="background: linear-gradient(135deg, #20409A 0%, #1a3580 100%); padding: 10px 12px; border-radius: 6px; margin-bottom: 12px;">
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0 0 3px 0; letter-spacing: 0.3px;">
        ${customerDetails.name}
      </h2>
      <p style="font-size: 10px; color: rgba(255,255,255,0.9); margin: 0;">
        ${customerDetails.code} • ${customerDetails.location}
      </p>
    </div>
    
    <!-- Contact Info - Compact Grid -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px;">
      <div style="background: #f8f9fa; padding: 8px; border-radius: 4px;">
        <p style="font-size: 9px; color: #6c757d; margin: 0 0 2px 0; text-transform: uppercase; font-weight: 600;">Phone</p>
        <p style="font-size: 11px; color: #2c3e50; margin: 0; font-weight: 500;">${customerDetails.phone}</p>
      </div>
      <div style="background: #f8f9fa; padding: 8px; border-radius: 4px;">
        <p style="font-size: 9px; color: #6c757d; margin: 0 0 2px 0; text-transform: uppercase; font-weight: 600;">Email</p>
        <p style="font-size: 10px; color: #2c3e50; margin: 0; font-weight: 500; word-break: break-all;">${customerDetails.email}</p>
      </div>
    </div>
    
    <!-- Address - Compact -->
    <div style="margin-bottom: 10px; padding: 8px; background: #f8f9fa; border-radius: 4px; border-left: 2px solid #20409A;">
      <p style="font-size: 9px; color: #6c757d; margin: 0 0 3px 0; text-transform: uppercase; font-weight: 600;">Address</p>
      <p style="font-size: 10px; color: #495057; line-height: 1.3; margin: 0;">${customerDetails.address}</p>
    </div>
    
    <!-- Financial Info - Compact -->
    <div style="background: #ffffff; border: 1px solid #e9ecef; border-radius: 4px; padding: 8px; margin-bottom: 10px;">
      <p style="font-size: 10px; color: #20409A; margin: 0 0 6px 0; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px;">Financial Summary</p>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 6px;">
        <div>
          <p style="font-size: 9px; color: #6c757d; margin: 0 0 2px 0;">Credit Balance</p>
          <p style="font-size: 11px; color: #28a745; margin: 0; font-weight: 700;">₹${customerDetails.creditBalance}</p>
        </div>
        <div>
          <p style="font-size: 9px; color: #6c757d; margin: 0 0 2px 0;">Credit Limit</p>
          <p style="font-size: 11px; color: #2c3e50; margin: 0; font-weight: 700;">₹${customerDetails.creditLimit}</p>
        </div>
        <div>
          <p style="font-size: 9px; color: #6c757d; margin: 0 0 2px 0;">Overdue Invoices</p>
          <p style="font-size: 11px; color: #dc3545; margin: 0; font-weight: 700;">${customerDetails.overDueInvoice}</p>
        </div>
        <div>
          <p style="font-size: 9px; color: #6c757d; margin: 0 0 2px 0;">Overdue Amount</p>
          <p style="font-size: 11px; color: #dc3545; margin: 0; font-weight: 700;">₹${customerDetails.overDueAmount}</p>
        </div>
      </div>
      
      <div style="padding-top: 6px; border-top: 1px solid #e9ecef;">
        <p style="font-size: 9px; color: #6c757d; margin: 0 0 2px 0;">Total Outstanding</p>
        <p style="font-size: 12px; color: #20409A; margin: 0; font-weight: 700;">₹${customerDetails.totalOutstanding}</p>
      </div>
    </div>
    
    <!-- Ship To Info - Compact -->
    <div style="background: #f8f9fa; border-radius: 4px; padding: 8px;">
      <p style="font-size: 10px; color: #20409A; margin: 0 0 5px 0; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px;">Ship To</p>
      <p style="font-size: 11px; color: #2c3e50; margin: 0 0 3px 0; font-weight: 600;">
        ${customerDetails.shipToCode} • ${customerDetails.shipToName}
      </p>
      <p style="font-size: 10px; color: #495057; line-height: 1.3; margin: 0;">${customerDetails.shipToAddress}</p>
    </div>
  </div>
`;

export const getCheckInDetailsHTML = (customerDetails, planData) => `
  ${getCustomerDetailsHTML(customerDetails)}
  
  <!-- Check-in Status Card - Compact -->
  <div style="background: linear-gradient(135deg, #fff8f0 0%, #ffe8d6 100%); padding: 10px; border-radius: 6px; border: 2px solid #ff6b35; margin-top: 10px; box-shadow: 0 2px 6px rgba(255,107,53,0.15);">
    <div style="display: flex; align-items: center; margin-bottom: 8px;">
      <div style="width: 6px; height: 6px; background: #ff6b35; border-radius: 50%; margin-right: 6px;"></div>
      <p style="font-size: 10px; color: #ff6b35; margin: 0; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px;">Check-in Active</p>
    </div>
    
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
      <div style="background: rgba(255,255,255,0.7); padding: 6px; border-radius: 4px;">
        <p style="font-size: 9px; color: #ff6b35; margin: 0 0 3px 0; font-weight: 600;">Purpose</p>
        <p style="font-size: 10px; color: #2c3e50; margin: 0; font-weight: 600;">${planData.purpose || 'N/A'}</p>
      </div>
      <div style="background: rgba(255,255,255,0.7); padding: 6px; border-radius: 4px;">
        <p style="font-size: 9px; color: #ff6b35; margin: 0 0 3px 0; font-weight: 600;">Target</p>
        <p style="font-size: 10px; color: #2c3e50; margin: 0; font-weight: 600;">₹${planData.target || '0'}</p>
      </div>
      <div style="background: rgba(255,255,255,0.7); padding: 6px; border-radius: 4px;">
        <p style="font-size: 9px; color: #ff6b35; margin: 0 0 3px 0; font-weight: 600;">Check-in Time</p>
        <p style="font-size: 9px; color: #2c3e50; margin: 0; font-weight: 600;">${planData.checkInTime || 'N/A'}</p>
      </div>
    </div>
  </div>
`;

export const getCheckInFormHTML = () => `
  <div style="text-align: left;">
    <!-- Purpose Field -->
    <div style="margin-bottom: 15px;">
      <label style="display: block; margin-bottom: 6px; font-weight: 600; color: #2c3e50; font-size: 12px;">
        Purpose (Target Type) <span style="color: #dc3545;">*</span>
      </label>
      <input 
        id="swal-target-type" 
        class="swal2-input" 
        placeholder="e.g., Cash Collection, Sales Visit, Follow-up" 
        style="width: 100%; margin: 0; padding: 10px 12px; font-size: 13px; border: 2px solid #e9ecef; border-radius: 6px; box-sizing: border-box; transition: all 0.2s;"
        onfocus="this.style.borderColor='#20409A'; this.style.boxShadow='0 0 0 3px rgba(32,64,154,0.1)';"
        onblur="this.style.borderColor='#e9ecef'; this.style.boxShadow='none';"
      >
      <p style="font-size: 10px; color: #6c757d; margin: 5px 0 0 0;">Specify the purpose of this visit</p>
    </div>
    
    <!-- Target Amount Field -->
    <div style="margin-bottom: 0;">
      <label style="display: block; margin-bottom: 6px; font-weight: 600; color: #2c3e50; font-size: 12px;">
        Target Amount <span style="font-size: 10px; color: #6c757d; font-weight: 400;">(Optional)</span>
      </label>
      <div style="position: relative;">
        <span style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #6c757d; font-size: 13px; font-weight: 600;">₹</span>
        <input 
          id="swal-target" 
          type="number" 
          class="swal2-input" 
          placeholder="26000" 
          style="width: 100%; margin: 0; padding: 10px 12px 10px 25px; font-size: 13px; border: 2px solid #e9ecef; border-radius: 6px; box-sizing: border-box; transition: all 0.2s;"
          onfocus="this.style.borderColor='#20409A'; this.style.boxShadow='0 0 0 3px rgba(32,64,154,0.1)';"
          onblur="this.style.borderColor='#e9ecef'; this.style.boxShadow='none';"
        >
      </div>
      <p style="font-size: 10px; color: #6c757d; margin: 5px 0 0 0;">Expected sales or collection amount</p>
    </div>
  </div>
`;

export const getCheckOutFormHTML = () => `
  <div style="text-align: left;">
    <!-- Success Message -->
    <div style="background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%); padding: 12px; border-radius: 6px; border-left: 4px solid #28a745; margin-bottom: 20px;">
      <p style="font-size: 11px; color: #155724; margin: 0; font-weight: 600;">
        ✓ Ready to complete your visit
      </p>
    </div>
    
    <!-- Target Achieved Field -->
    <div style="margin-bottom: 0;">
      <label style="display: block; margin-bottom: 6px; font-weight: 600; color: #2c3e50; font-size: 12px;">
        Target Achieved Amount <span style="color: #dc3545;">*</span>
      </label>
      <div style="position: relative;">
        <span style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #6c757d; font-size: 13px; font-weight: 600;">₹</span>
        <input 
          id="swal-target-achieved" 
          type="number" 
          class="swal2-input" 
          placeholder="24000" 
          style="width: 100%; margin: 0; padding: 10px 12px 10px 25px; font-size: 13px; border: 2px solid #e9ecef; border-radius: 6px; box-sizing: border-box; transition: all 0.2s;"
          onfocus="this.style.borderColor='#28a745'; this.style.boxShadow='0 0 0 3px rgba(40,167,69,0.1)';"
          onblur="this.style.borderColor='#e9ecef'; this.style.boxShadow='none';"
        >
      </div>
      <p style="font-size: 10px; color: #6c757d; margin: 5px 0 0 0;">Enter the actual amount achieved during this visit</p>
    </div>
  </div>
`;

export const popupConfig = {
  width: '560px',
  padding: '15px',
  background: '#fff',
  allowOutsideClick: true,
  allowEscapeKey: true,
  showCloseButton: true,
  showClass: {
    popup: 'swal2-show',
    backdrop: 'swal2-backdrop-show',
    icon: 'swal2-icon-show'
  },
  hideClass: {
    popup: 'swal2-hide',
    backdrop: 'swal2-backdrop-hide'
  },
  customClass: {
    popup: 'customer-details-popup',
    htmlContainer: 'customer-details-content',
    confirmButton: 'customer-details-confirm-btn',
    title: 'customer-details-title',
    closeButton: 'swal2-close'
  }
};
