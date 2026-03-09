import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Header from '../header/Header';
import Breadcrumb from '../components/Breadcrumb/Breadcrumb';
import { apiService } from '../../services/apiservice';
import './CreateBeat.css';

const CreateBeat = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const beatData = location.state || {};

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Editable beat info - get data from beatData including repeatData
  const [beatInfo, setBeatInfo] = useState({
    date: beatData.date || '',
    time: beatData.time || '',
    employee: beatData.employee || '',
    employeeName: beatData.employeeName || '',
    planType: beatData.planType || '',
    location: beatData.location || '',
    remarks: beatData.remarks || '',
    repeatType: beatData.repeatData?.repeatType || '',
    fromDate: beatData.repeatData?.fromDate || '',
    toDate: beatData.repeatData?.toDate || '',
    weekdays: beatData.repeatData?.weekdays || []
  });

  // Fetch customers on mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/profile/sales-executive-customers');
      if (response.success && response.data) {
        const formattedCustomers = response.data.map(customer => ({
          id: customer.customer_id,
          code: customer.customer_code,
          name: customer.customer_name,
          contact: customer.mobile || 'N/A',
          target: '',
          unit: 'Rs',
          isChecked: false,
          city: customer.city
        }));
        setCustomers(formattedCustomers);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load customers data',
        confirmButtonColor: '#20409A'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBeatInfoChange = (field, value) => {
    setBeatInfo({ ...beatInfo, [field]: value });
  };

  // Handle Edit button - Same popup as Create Beat
  const handleEditBeatInfo = async () => {
    // Show Repeat On dialog first (same as Create Beat flow)
    const { value: repeatData } = await Swal.fire({
      title: '<div style="text-align: left; padding: 0; margin: 0;"><span style="color: #333; font-size: 20px; font-weight: 600;">Repeat On</span></div>',
      html: `
        <div style="text-align: left; padding: 15px 0;">
          <div style="margin-bottom: 20px;">
            <label style="display: block; font-size: 13px; font-weight: 400; color: #666; margin-bottom: 8px;">
              Select Repeat Type
            </label>
            <select id="repeat-type" style="width: 100%; padding: 10px 12px; height: 42px; font-size: 14px; border: 1px solid #e0e0e0; border-radius: 6px; background: #fafafa; color: #333; outline: none; cursor: pointer; transition: all 0.2s ease;">
              <option value="">Select Repeat Type</option>
              <option value="custom" ${beatInfo.repeatType === 'custom' ? 'selected' : ''}>Custom Date</option>
              <option value="weekly" ${beatInfo.repeatType === 'weekly' ? 'selected' : ''}>Weekly</option>
            </select>
          </div>

          <!-- Custom Date Section -->
          <div id="custom-date-section" style="display: ${beatInfo.repeatType === 'custom' ? 'block' : 'none'};">
            <div style="margin-bottom: 15px;">
              <label style="display: block; font-size: 13px; font-weight: 400; color: #666; margin-bottom: 8px;">
                From Date
              </label>
              <input type="date" id="repeat-from-date" value="${beatInfo.fromDate || ''}" style="width: 100%; padding: 10px 12px; height: 42px; font-size: 14px; border: 1px solid #e0e0e0; border-radius: 6px; background: #fafafa; color: #333; outline: none;" />
            </div>
            <div style="margin-bottom: 15px;">
              <label style="display: block; font-size: 13px; font-weight: 400; color: #666; margin-bottom: 8px;">
                To Date
              </label>
              <input type="date" id="repeat-to-date" value="${beatInfo.toDate || ''}" style="width: 100%; padding: 10px 12px; height: 42px; font-size: 14px; border: 1px solid #e0e0e0; border-radius: 6px; background: #fafafa; color: #333; outline: none;" />
            </div>
          </div>

          <!-- Weekly Section -->
          <div id="weekly-section" style="display: ${beatInfo.repeatType === 'weekly' ? 'block' : 'none'};">
            <label style="display: block; font-size: 13px; font-weight: 400; color: #666; margin-bottom: 12px;">
              Select Days
            </label>
            <div style="display: flex; gap: 8px; justify-content: center;">
              <button type="button" class="weekday-btn" data-day="S" style="width: 45px; height: 45px; border-radius: 50%; border: 2px solid #e0e0e0; background: ${beatInfo.weekdays?.includes('S') ? '#FF6B35' : 'white'}; color: ${beatInfo.weekdays?.includes('S') ? 'white' : '#666'}; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s ease;">S</button>
              <button type="button" class="weekday-btn" data-day="M" style="width: 45px; height: 45px; border-radius: 50%; border: 2px solid #e0e0e0; background: ${beatInfo.weekdays?.includes('M') ? '#FF6B35' : 'white'}; color: ${beatInfo.weekdays?.includes('M') ? 'white' : '#666'}; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s ease;">M</button>
              <button type="button" class="weekday-btn" data-day="T" style="width: 45px; height: 45px; border-radius: 50%; border: 2px solid #e0e0e0; background: ${beatInfo.weekdays?.includes('T') ? '#FF6B35' : 'white'}; color: ${beatInfo.weekdays?.includes('T') ? 'white' : '#666'}; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s ease;">T</button>
              <button type="button" class="weekday-btn" data-day="W" style="width: 45px; height: 45px; border-radius: 50%; border: 2px solid #e0e0e0; background: ${beatInfo.weekdays?.includes('W') ? '#FF6B35' : 'white'}; color: ${beatInfo.weekdays?.includes('W') ? 'white' : '#666'}; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s ease;">W</button>
              <button type="button" class="weekday-btn" data-day="T" style="width: 45px; height: 45px; border-radius: 50%; border: 2px solid #e0e0e0; background: ${beatInfo.weekdays?.includes('T') ? '#FF6B35' : 'white'}; color: ${beatInfo.weekdays?.includes('T') ? 'white' : '#666'}; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s ease;">T</button>
              <button type="button" class="weekday-btn" data-day="F" style="width: 45px; height: 45px; border-radius: 50%; border: 2px solid #e0e0e0; background: ${beatInfo.weekdays?.includes('F') ? '#FF6B35' : 'white'}; color: ${beatInfo.weekdays?.includes('F') ? 'white' : '#666'}; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s ease;">F</button>
              <button type="button" class="weekday-btn" data-day="S" style="width: 45px; height: 45px; border-radius: 50%; border: 2px solid #e0e0e0; background: ${beatInfo.weekdays?.includes('S') ? '#FF6B35' : 'white'}; color: ${beatInfo.weekdays?.includes('S') ? 'white' : '#666'}; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s ease;">S</button>
            </div>
          </div>
        </div>
      `,
      showCloseButton: true,
      showCancelButton: false,
      focusConfirm: false,
      confirmButtonText: 'Done',
      confirmButtonColor: '#FF6B35',
      width: '500px',
      padding: '25px 35px',
      background: '#ffffff',
      customClass: {
        popup: 'clean-popup',
        title: 'clean-popup-title',
        htmlContainer: 'clean-popup-content',
        confirmButton: 'beat-popup-btn',
        closeButton: 'clean-close-btn'
      },
      didOpen: () => {
        const repeatTypeSelect = document.getElementById('repeat-type');
        const customDateSection = document.getElementById('custom-date-section');
        const weeklySection = document.getElementById('weekly-section');
        const fromDateInput = document.getElementById('repeat-from-date');
        const toDateInput = document.getElementById('repeat-to-date');
        
        let selectedWeekdays = beatInfo.weekdays || [];

        // Handle repeat type change
        repeatTypeSelect.addEventListener('change', (e) => {
          const value = e.target.value;
          if (value === 'custom') {
            customDateSection.style.display = 'block';
            weeklySection.style.display = 'none';
          } else if (value === 'weekly') {
            customDateSection.style.display = 'none';
            weeklySection.style.display = 'block';
          } else {
            customDateSection.style.display = 'none';
            weeklySection.style.display = 'none';
          }
        });

        // Handle from date change
        fromDateInput.addEventListener('change', () => {
          if (fromDateInput.value) {
            toDateInput.min = fromDateInput.value;
          }
        });

        // Handle weekday button clicks
        document.querySelectorAll('.weekday-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const day = btn.dataset.day;
            const isSelected = btn.style.background === 'rgb(255, 107, 53)' || btn.style.background === '#FF6B35';
            
            if (isSelected) {
              btn.style.background = 'white';
              btn.style.color = '#666';
              btn.style.borderColor = '#e0e0e0';
              selectedWeekdays = selectedWeekdays.filter(d => d !== day);
            } else {
              btn.style.background = '#FF6B35';
              btn.style.color = 'white';
              btn.style.borderColor = '#FF6B35';
              selectedWeekdays.push(day);
            }
          });
        });

        // Store selected weekdays for validation
        window.selectedWeekdays = selectedWeekdays;
      },
      preConfirm: () => {
        const repeatType = document.getElementById('repeat-type').value;
        
        if (!repeatType) {
          Swal.showValidationMessage('Please select a repeat type');
          return false;
        }

        if (repeatType === 'custom') {
          const fromDate = document.getElementById('repeat-from-date').value;
          const toDate = document.getElementById('repeat-to-date').value;
          
          if (!fromDate || !toDate) {
            Swal.showValidationMessage('Please select both from and to dates');
            return false;
          }

          return { repeatType: 'custom', fromDate, toDate };
        } else if (repeatType === 'weekly') {
          const selectedWeekdays = window.selectedWeekdays || [];
          
          if (selectedWeekdays.length === 0) {
            Swal.showValidationMessage('Please select at least one weekday');
            return false;
          }

          return { repeatType: 'weekly', weekdays: selectedWeekdays };
        }
      }
    });

    if (repeatData) {
      // Update beat info with new repeat data
      setBeatInfo({
        ...beatInfo,
        repeatType: repeatData.repeatType,
        fromDate: repeatData.fromDate || '',
        toDate: repeatData.toDate || '',
        weekdays: repeatData.weekdays || []
      });

      Swal.fire({
        icon: 'success',
        title: 'Beat Information Updated!',
        confirmButtonColor: '#20409A',
        timer: 1500,
        showConfirmButton: false
      });
    }
  };

  const handleCustomerCheck = (id) => {
    setCustomers(customers.map(c => c.id === id ? { ...c, isChecked: !c.isChecked } : c));
  };

  const handleTargetChange = (id, value) => {
    setCustomers(customers.map(c => c.id === id ? { ...c, target: value } : c));
  };

  const handleUnitChange = (id, value) => {
    setCustomers(customers.map(c => c.id === id ? { ...c, unit: value } : c));
  };

  const handleSubmit = async () => {
    const selectedCustomers = customers.filter(c => c.isChecked);

    if (selectedCustomers.length === 0) {
      Swal.fire({
        icon: 'error',
        title: 'No Customers Selected',
        text: 'Please select at least one customer',
        confirmButtonColor: '#20409A',
      });
      return;
    }

    // Check if all selected customers have targets
    const missingTargets = selectedCustomers.filter(c => !c.target);
    if (missingTargets.length > 0) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Targets',
        text: 'Please enter target for all selected customers',
        confirmButtonColor: '#20409A',
      });
      return;
    }

    // Validate required fields
    if (!beatInfo.date || !beatInfo.planType || !beatInfo.location) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Information',
        text: 'Please fill all required beat information',
        confirmButtonColor: '#20409A',
      });
      return;
    }

    // Validate weekly repeat requires date range
    if (beatInfo.repeatType === 'weekly') {
      if (!beatInfo.fromDate || !beatInfo.toDate) {
        Swal.fire({
          icon: 'error',
          title: 'Missing Date Range',
          text: 'Please provide start and end dates for weekly repeat',
          confirmButtonColor: '#20409A',
        });
        return;
      }
      if (!beatInfo.weekdays || beatInfo.weekdays.length === 0) {
        Swal.fire({
          icon: 'error',
          title: 'Missing Weekdays',
          text: 'Please select at least one weekday for weekly repeat',
          confirmButtonColor: '#20409A',
        });
        return;
      }
    }

    try {
      // Show loading
      Swal.fire({
        title: 'Creating Beat Plan...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // Prepare API payload for each selected customer
      const createPromises = selectedCustomers.map(customer => {
        const payload = {
          plan_type: beatInfo.planType,
          plan_date: `${beatInfo.date} ${beatInfo.time || '18:00:00'}`,
          location: beatInfo.location,
          customer_id: customer.id,
          remarks: beatInfo.remarks || '',
          repeat_on: beatInfo.repeatType || 'custom'
        };

        // Add optional date range if provided (for custom repeat type)
        if (beatInfo.repeatType === 'custom' && beatInfo.fromDate) {
          payload.startDate = beatInfo.fromDate;
        }
        if (beatInfo.repeatType === 'custom' && beatInfo.toDate) {
          payload.endDate = beatInfo.toDate;
        }

        // Add weekdays and date range if provided (for weekly repeat type)
        if (beatInfo.repeatType === 'weekly') {
          // CRITICAL FIX: Add startDate and endDate for weekly repeat
          if (beatInfo.fromDate && beatInfo.toDate) {
            payload.startDate = beatInfo.fromDate;
            payload.endDate = beatInfo.toDate;
          }
          
          if (beatInfo.weekdays && beatInfo.weekdays.length > 0) {
            // Weekdays are now full day names (Sunday, Monday, etc.) from the dialog
            // No mapping needed - send directly to backend
            payload.days = beatInfo.weekdays;
          }
        }

        return apiService.post('/beat-plan/create-beat-plan', payload);
      });

      const responses = await Promise.all(createPromises);

      // Check if all requests were successful
      const allSuccess = responses.every(res => res.success);

      if (allSuccess) {
        Swal.fire({
          icon: 'success',
          title: 'Beat Plans Created!',
          html: `
            <div style="text-align: left;">
              <p><strong>Date:</strong> ${beatInfo.date}</p>
              <p><strong>Employee:</strong> ${beatInfo.employeeName || 'N/A'}</p>
              <p><strong>Plan Type:</strong> ${beatInfo.planType}</p>
              <p><strong>Location:</strong> ${beatInfo.location}</p>
              <p><strong>Customers:</strong> ${selectedCustomers.length}</p>
              <p><strong>Plans Created:</strong> ${responses.length}</p>
            </div>
          `,
          confirmButtonColor: '#20409A',
        }).then(() => {
          navigate('/beatplan');
        });
      }
    } catch (error) {
      console.error('Error creating beat plan:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to create beat plan',
        confirmButtonColor: '#20409A'
      });
    }
  };

  return (
    <div className="create-beat-container">
      <Header />
      <Breadcrumb currentPage="Create Beat" />

      <div className="create-beat-content">
        <div className="create-beat-header">
          <h1>Create Beat</h1>
          <button className="back-btn" onClick={() => navigate('/beatplan')}>
            Back to Beat Plan
          </button>
        </div>

        {/* Beat Information Display with Edit Button */}
        <div className="beat-info-card">
          <div className="beat-info-header">
            <h2>Beat Information</h2>
            <button className="edit-btn" onClick={handleEditBeatInfo}>
              Edit
            </button>
          </div>
          <div className="beat-info-display">
            <div className="info-display-item">
              <label>Date</label>
              <div className="info-value">{beatInfo.date || '-'}</div>
            </div>
            <div className="info-display-item">
              <label>Time</label>
              <div className="info-value">{beatInfo.time || '-'}</div>
            </div>
            <div className="info-display-item">
              <label>Employee Code</label>
              <div className="info-value">{beatInfo.employee || '-'}</div>
            </div>
            <div className="info-display-item">
              <label>Employee Name</label>
              <div className="info-value">{beatInfo.employeeName || '-'}</div>
            </div>
            <div className="info-display-item">
              <label>Plan Type</label>
              <div className="info-value">{beatInfo.planType || '-'}</div>
            </div>
            <div className="info-display-item">
              <label>Location</label>
              <div className="info-value">{beatInfo.location || '-'}</div>
            </div>
            <div className="info-display-item">
              <label>Remarks</label>
              <div className="info-value">{beatInfo.remarks || '-'}</div>
            </div>
            <div className="info-display-item">
              <label>Repeat Type</label>
              <div className="info-value">{beatInfo.repeatType || '-'}</div>
            </div>
            {beatInfo.repeatType === 'custom' && beatInfo.fromDate && (
              <div className="info-display-item">
                <label>From Date</label>
                <div className="info-value">{beatInfo.fromDate}</div>
              </div>
            )}
            {beatInfo.repeatType === 'custom' && beatInfo.toDate && (
              <div className="info-display-item">
                <label>To Date</label>
                <div className="info-value">{beatInfo.toDate}</div>
              </div>
            )}
            {beatInfo.repeatType === 'weekly' && beatInfo.weekdays && beatInfo.weekdays.length > 0 && (
              <div className="info-display-item">
                <label>Weekdays</label>
                <div className="info-value">{beatInfo.weekdays.join(', ')}</div>
              </div>
            )}
          </div>
        </div>

        {/* Customer Table */}
        <div className="customers-card">
          <h2>Select Customers & Set Targets</h2>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p>Loading customers...</p>
            </div>
          ) : customers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p>No customers found</p>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="customers-table">
                  <thead>
                    <tr>
                      <th>Select</th>
                      <th>Customer Code</th>
                      <th>Customer Name</th>
                      <th>Contact Number</th>
                      <th>Target</th>
                      <th>Unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((customer) => (
                      <tr key={customer.id} className={customer.isChecked ? 'selected-row' : ''}>
                        <td>
                          <input
                            type="checkbox"
                            checked={customer.isChecked}
                            onChange={() => handleCustomerCheck(customer.id)}
                          />
                        </td>
                        <td>{customer.code}</td>
                        <td>{customer.name}</td>
                        <td>{customer.contact}</td>
                        <td>
                          <input
                            type="number"
                            value={customer.target}
                            onChange={(e) => handleTargetChange(customer.id, e.target.value)}
                            placeholder="Enter target"
                            className="target-input"
                            disabled={!customer.isChecked}
                          />
                        </td>
                        <td>
                          <select
                            value={customer.unit}
                            onChange={(e) => handleUnitChange(customer.id, e.target.value)}
                            className="unit-select"
                            disabled={!customer.isChecked}
                          >
                            <option value="Rs">Rs</option>
                            <option value="Liter">Liter</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="submit-section">
                <button className="submit-beat-btn" onClick={handleSubmit}>
                  Submit Beat
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateBeat;
