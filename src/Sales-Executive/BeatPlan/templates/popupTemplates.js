// Popup HTML templates for Beat Plan

const statusColor = (status) => {
  if (!status) return '#6c757d';
  const s = status.toLowerCase();
  if (s === 'visited') return '#28a745';
  if (s === 'check in') return '#ff6b35';
  if (s === 'new') return '#20409A';
  return '#6c757d';
};

const statusBg = (status) => {
  if (!status) return '#f8f9fa';
  const s = status.toLowerCase();
  if (s === 'visited') return '#d4edda';
  if (s === 'check in') return '#fff3cd';
  if (s === 'new') return '#e8edf8';
  return '#f8f9fa';
};

export const getPlanDetailsHTML = (customerDetails, planData) => `
  <div style="text-align: left; color: #2c3e50; max-height: 520px; overflow-y: auto; font-family: inherit;">

    <!-- Header -->
    <div style="background: linear-gradient(135deg, #20409A 0%, #1a3580 100%); padding: 12px 14px; border-radius: 8px; margin-bottom: 12px;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <h2 style="font-size: 0px; padding: 8px; background: #f8f9faargin: 0 0 3px 0;">${customerDetails.name}</h2>
          <p style="font-size: 10px; color: rgba(255,255,255,0.85); margin: 0;">${customerDetails.code} · ${customerDetails.location}</p>
        </div>
        <span style="background: ${statusBg(planData.status)}; color: ${statusColor(planData.status)}; font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 12px; white-space: nowrap; margin-left: 8px;">
          ${planData.status || 'N/A'}
        </span>
      </div>
    </div>

    <!-- Plan Info -->
    <div style="background: #f8f9fa; border-radius: 6px; padding: 10px 12px; margin-bottom: 10px; border-left: 3px solid #20409A;">
      <p style="font-size: 9px; color: #6c757d; margin: 0 0 6px 0; text-transform: uppercase; font-weight: 700; letter-spacing: 0.4px;">Plan Info</p>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
        <div>
          <p style="font-size: 9px; color: #6c757d; margin: 0 0 1px 0;">Plan Number</p>
          <p style="font-size: 11px; color: #2c3e50; margin: 0; font-weight: 600;">${planData.planNo || 'N/A'}</p>
        </div>
        <div>
          <p style="font-size: 9px; color: #6c757d; margin: 0 0 1px 0;">Plan Date</p>
          <p style="font-size: 11px; color: #2c3e50; margin: 0; font-weight: 600;">${planData.planDate || 'N/A'}</p>
        </div>
        <div>
          <p style="font-size: 9px; color: #6c757d; margin: 0 0 1px 0;">Created Date</p>
          <p style="font-size: 11px; color: #2c3e50; margin: 0; font-weight: 600;">${planData.createdDate || 'N/A'}</p>
        </div>
        <div>
          <p style="font-size: 9px; color: #6c757d; margin: 0 0 1px 0;">Purpose</p>
          <p style="font-size: 11px; color: #2c3e50; margin: 0; font-weight: 600;">${planData.purpose || 'N/A'}</p>
        </div>
        ${planData.target && planData.target !== '0' ? `
        <div>
          <p style="font-size: 9px; color: #6c757d; margin: 0 0 1px 0;">Target</p>
          <p style="font-size: 11px; color: #2c3e50; margin: 0; font-weight: 600;">₹${planData.target}</p>
        </div>` : ''}
        ${planData.targetAchieved && planData.targetAchieved !== '0' ? `
        <div>
          <p style="font-size: 9px; color: #6c757d; margin: 0 0 1px 0;">Target Achieved</p>
          <p style="font-size: 11px; color: #28a745; margin: 0; font-weight: 600;">₹${planData.targetAchieved}</p>
        </div>` : ''}
        ${planData.checkInTime ? `
        <div>
          <p style="font-size: 9px; color: #6c757d; margin: 0 0 1px 0;">Check-in Time</p>
          <p style="font-size: 10px; color: #2c3e50; margin: 0; font-weight: 600;">${planData.checkInTime}</p>
        </div>` : ''}
        ${planData.checkOutTime ? `
        <div>
          <p style="font-size: 9px; color: #6c757d; margin: 0 0 1px 0;">Check-out Time</p>
          <p style="font-size: 10px; color: #2c3e50; margin: 0; font-weight: 600;">${planData.checkOutTime}</p>
        </div>` : ''}
      </div>
    </div>

    <!-- Contact -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px;">
      <div style="background: #f8f9fa; padding: 8px; border-radius: 6px;">
        <p style="font-size: 9px; color: #6c757d; margin: 0 0 2px 0; text-transform: uppercase; font-weight: 600;">Phone</p>
        <p style="font-size: 11px; color: #2c3e50; margin: 0; font-weight: 500;">${customerDetails.phone}</p>
      </div>
      <div style="background: #f8f9fa; padding: 8px; border-radius: 6px;">
        <p style="font-size: 9px; color: #6c757d; margin: 0 0 2px 0; text-transform: uppercase; font-weight: 600;">Email</p>
        <p style="font-size: 10px; color: #2c3e50; margin: 0; font-weight: 500; word-break: break-all;">${customerDetails.email}</p>
      </div>
    </div>

    <!-- Address -->
    <div style="margin-bottom: 10px; padding: 8px 10px; background: #f8f9fa; border-radius: 6px; border-left: 2px solid #20409A;">
      <p style="font-size: 9px; color: #6c757d; margin: 0 0 3px 0; text-transform: uppercase; font-weight: 600;">Address</p>
      <p style="font-size: 10px; color: #495057; line-height: 1.4; margin: 0;">${customerDetails.address}</p>
    </div>

    <!-- Financial Summary -->
    <div style="background: #fff; border: 1px solid #e9ecef; border-radius: 6px; padding: 10px; margin-bottom: 10px;">
      <p style="font-size: 10px; color: #20409A; margin: 0 0 8px 0; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px;">Financial Summary</p>
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

    <!-- Ship To -->
    <div style="background: #f8f9fa; border-radius: 6px; padding: 8px 10px;">
      <p style="font-size: 10px; color: #20409A; margin: 0 0 5px 0; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px;">Ship To</p>
      <p style="font-size: 11px; color: #2c3e50; margin: 0 0 3px 0; font-weight: 600;">${customerDetails.shipToCode} · ${customerDetails.shipToName}</p>
      <p style="font-size: 10px; color: #495057; line-height: 1.3; margin: 0;">${customerDetails.shipToAddress}</p>
    </div>
  </div>
`;

export const popupConfig = {
  width: '580px',
  padding: '15px',
  background: '#fff',
  allowOutsideClick: true,
  allowEscapeKey: true,
  showCloseButton: true,
  showConfirmButton: false,
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
