import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Header from "../header/Header";
import Breadcrumb from "../components/Breadcrumb/Breadcrumb";
import BeatPlan from "./beatplan";
import ExcelIcon from "../../assets/Icons/excel.png";
import DateIcon from "../../assets/Icons/Date.png";
import ImportIcon from "../../assets/Icons/Import.png";
import ExportIcon from "../../assets/Assets/Beat/export.png";
import { apiService } from "../../services/apiservice";
import "./beatplan.css";
import "./customDateTimePicker.css";

const BeatPlanPage = () => {
  const navigate = useNavigate();
  const beatPlanRef = useRef(null);
  const [customersData, setCustomersData] = useState([]);
  const [citiesData, setCitiesData] = useState([]);
  const [nextPlanCode, setNextPlanCode] = useState('P # 0 0 0 1');
  const [visitCounts, setVisitCounts] = useState({ today: 0, week: 0, month: 0 });

  // Fetch customers on component mount
  useEffect(() => {
    fetchCustomers();
    fetchNextPlanCode();
    fetchVisitCounts();
  }, []);

  const fetchNextPlanCode = async () => {
    try {
      const response = await apiService.get('/beat-plan/new-beat-plan-list');
      if (response.success && response.data && response.data.length > 0) {
        // Get the latest plan code
        const planCodes = response.data.map(plan => plan.plan_code).filter(Boolean);
        
        if (planCodes.length > 0) {
          // Sort plan codes to get the latest
          // Plan codes from backend are like "P#0001", "P#0002"
          const sortedCodes = planCodes.sort((a, b) => {
            // Extract numbers from plan codes
            const numA = parseInt(a.replace(/[^\d]/g, ''));
            const numB = parseInt(b.replace(/[^\d]/g, ''));
            return numB - numA;
          });
          
          const latestCode = sortedCodes[0];
          // Extract the number and increment
          const currentNumber = parseInt(latestCode.replace(/[^\d]/g, ''));
          const nextNumber = currentNumber + 1;
          
          // Format as "P # 0 0 X X" to match the display format
          const formatted = nextNumber.toString().padStart(4, '0').split('').join(' ');
          setNextPlanCode(`P # ${formatted}`);
        } else {
          // No existing plans, start from 1
          setNextPlanCode('P # 0 0 0 1');
        }
      } else {
        // No plans yet, start from 1
        setNextPlanCode('P # 0 0 0 1');
      }
    } catch (error) {
      console.error('Error fetching next plan code:', error);
      // Default to P # 0 0 0 1 if error
      setNextPlanCode('P # 0 0 0 1');
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await apiService.get('/profile/sales-executive-customers');
      if (response.success && response.data) {
        setCustomersData(response.data);

        // Extract unique cities from customers
        const uniqueCities = [...new Set(response.data.map(customer => customer.city))].filter(Boolean);
        setCitiesData(uniqueCities);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load customers data',
        confirmButtonColor: '#2196F3'
      });
    }
  };

  const fetchVisitCounts = async () => {
    try {
      const response = await apiService.get('/beat-plan/plan-visited-counts');
      if (response.success && response.data) {
        setVisitCounts(response.data);
      }
    } catch (error) {
      console.error('Error fetching visit counts:', error);
    }
  };

  // Handle Create Beat button
  const handleCreateBeat = async () => {
    // Ensure customers are loaded
    if (customersData.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Loading...',
        text: 'Please wait while we load customer data',
        confirmButtonColor: '#2196F3'
      });
      await fetchCustomers();
    }

    const { value: formValues } = await Swal.fire({
      title: '<div style="text-align: left; padding: 0; margin: 0;"><span style="color: #333; font-size: 20px; font-weight: 600;">Create Beat</span></div>',
      html: `
        <link rel="stylesheet" href="./customDateTimePicker.css">
        <div style="text-align: left; padding: 15px 0;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
            <div>
              <label style="display: block; font-size: 13px; font-weight: 400; color: #666; margin-bottom: 8px;">
                Plan Type
              </label>
              <select id="beat-plan-type" style="width: 100%; padding: 10px 12px; height: 42px; font-size: 14px; border: 1px solid #e0e0e0; border-radius: 6px; background: #fafafa; color: #333; outline: none; cursor: pointer; transition: all 0.2s ease;" onfocus="this.style.background='white'; this.style.borderColor='#2196F3'" onblur="this.style.background='#fafafa'; this.style.borderColor='#e0e0e0'">
                <option value="">Select Plan Type</option>
                <option value="Beat">Beat</option>
                <option value="Event">Event</option>
                <option value="Meeting">Meeting</option>
                <option value="Training">Training</option>
                <option value="Leave">Leave</option>
                <option value="Holiday">Holiday</option>
                <option value="New Lead Creates">New Lead Creates</option>
              </select>
            </div>
            <div style="position: relative;">
              <label style="display: block; font-size: 13px; font-weight: 400; color: #666; margin-bottom: 8px;">
                Select Date
              </label>
              <input type="text" id="beat-date-display" readonly placeholder="Select date" style="width: 100%; padding: 10px 12px; height: 42px; font-size: 14px; border: 1px solid #e0e0e0; border-radius: 6px; background: #fafafa; color: #333; outline: none; cursor: pointer; transition: all 0.2s ease;" />
              <input type="hidden" id="beat-date" />
              <div id="custom-calendar" class="custom-calendar"></div>
            </div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
            <div style="position: relative;">
              <label style="display: block; font-size: 13px; font-weight: 400; color: #666; margin-bottom: 8px;">
                Select Time
              </label>
              <input type="text" id="beat-time-display" readonly placeholder="Select time" style="width: 100%; padding: 10px 12px; height: 42px; font-size: 14px; border: 1px solid #e0e0e0; border-radius: 6px; background: #fafafa; color: #333; outline: none; cursor: pointer; transition: all 0.2s ease;" />
              <input type="hidden" id="beat-time" />
              <div id="custom-time-picker" class="custom-time-picker"></div>
            </div>
            <div>
              <label style="display: block; font-size: 13px; font-weight: 400; color: #666; margin-bottom: 8px;">
                Select Customer
              </label>
              <select id="beat-employee" style="width: 100%; padding: 10px 12px; height: 42px; font-size: 14px; border: 1px solid #e0e0e0; border-radius: 6px; background: #fafafa; color: #333; outline: none; cursor: pointer; transition: all 0.2s ease;" onfocus="this.style.background='white'; this.style.borderColor='#2196F3'" onblur="this.style.background='#fafafa'; this.style.borderColor='#e0e0e0'">
                <option value="">Select Customer</option>
                ${customersData.map(customer => `<option value="${customer.customer_code}" data-name="${customer.customer_name}" data-city="${customer.city}">${customer.customer_name}</option>`).join('')}
              </select>
            </div>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
            <div>
              <label style="display: block; font-size: 13px; font-weight: 400; color: #666; margin-bottom: 8px;">
                Location
              </label>
              <select id="beat-location" style="width: 100%; padding: 10px 12px; height: 42px; font-size: 14px; border: 1px solid #e0e0e0; border-radius: 6px; background: #fafafa; color: #333; outline: none; cursor: pointer; transition: all 0.2s ease;" onfocus="this.style.background='white'; this.style.borderColor='#2196F3'" onblur="this.style.background='#fafafa'; this.style.borderColor='#e0e0e0'">
                <option value="">Select Location</option>
                ${citiesData.map(city => `<option value="${city}">${city}</option>`).join('')}
              </select>
            </div>
          </div>
          
          <div style="margin-bottom: 20px;">
            <label style="display: block; font-size: 13px; font-weight: 400; color: #666; margin-bottom: 8px;">
              Remarks
            </label>
            <textarea id="beat-remarks" rows="3" placeholder="Enter remarks..." style="width: 100%; padding: 10px 12px; font-size: 14px; border: 1px solid #e0e0e0; border-radius: 6px; background: #fafafa; color: #333; outline: none; resize: vertical; transition: all 0.2s ease; font-family: Inter, sans-serif; line-height: 1.5;" onfocus="this.style.background='white'; this.style.borderColor='#2196F3'" onblur="this.style.background='#fafafa'; this.style.borderColor='#e0e0e0'"></textarea>
          </div>
        </div>
      `,
      showCloseButton: true,
      showCancelButton: false,
      focusConfirm: false,
      confirmButtonText: 'Add',
      confirmButtonColor: '#2196F3',
      width: '700px',
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
        // Customer selection handler
        const employeeSelect = document.getElementById('beat-employee');
        const locationSelect = document.getElementById('beat-location');

        employeeSelect.addEventListener('change', (e) => {
          const selectedOption = e.target.options[e.target.selectedIndex];
          const city = selectedOption.dataset.city || '';

          // Auto-fill location
          if (city) {
            locationSelect.value = city;
            locationSelect.style.color = '#333';
          } else {
            locationSelect.value = '';
          }
        });

        // Custom Calendar Implementation
        const dateDisplay = document.getElementById('beat-date-display');
        const dateHidden = document.getElementById('beat-date');
        const calendar = document.getElementById('custom-calendar');

        let currentDate = new Date();
        let selectedDate = null;

        function renderCalendar(year, month) {
          const firstDay = new Date(year, month, 1);
          const lastDay = new Date(year, month + 1, 0);
          const prevLastDay = new Date(year, month, 0);
          const firstDayIndex = firstDay.getDay();
          const lastDateNum = lastDay.getDate();
          const prevLastDateNum = prevLastDay.getDate();

          const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
          const today = new Date();

          let calendarHTML = `
            <div class="calendar-header">
              <button class="calendar-nav-btn" id="prev-month">◀</button>
              <div style="display: flex; gap: 10px;">
                <select id="month-select" style="width: 110px;">
                  ${months.map((m, i) => `<option value="${i}" ${i === month ? 'selected' : ''}>${m}</option>`).join('')}
                </select>
                <select id="year-select" style="width: 80px;">
                  ${Array.from({ length: 10 }, (_, i) => year - 5 + i).map(y => `<option value="${y}" ${y === year ? 'selected' : ''}>${y}</option>`).join('')}
                </select>
              </div>
              <button class="calendar-nav-btn" id="next-month">▶</button>
            </div>
            <div class="calendar-weekdays">
              <div class="calendar-weekday">Sun</div>
              <div class="calendar-weekday">Mon</div>
              <div class="calendar-weekday">Tue</div>
              <div class="calendar-weekday">Wed</div>
              <div class="calendar-weekday">Thu</div>
              <div class="calendar-weekday">Fri</div>
              <div class="calendar-weekday">Sat</div>
            </div>
            <div class="calendar-days">
          `;

          // Previous month days
          for (let i = firstDayIndex; i > 0; i--) {
            calendarHTML += `<div class="calendar-day other-month">${prevLastDateNum - i + 1}</div>`;
          }

          // Current month days
          for (let i = 1; i <= lastDateNum; i++) {
            const isToday = i === today.getDate() && month === today.getMonth() && year === today.getFullYear();
            const isSelected = selectedDate && i === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear();
            const classes = ['calendar-day'];
            if (isToday) classes.push('today');
            if (isSelected) classes.push('selected');
            calendarHTML += `<div class="${classes.join(' ')}" data-date="${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}">${i}</div>`;
          }

          // Next month days
          const remainingDays = 42 - (firstDayIndex + lastDateNum);
          for (let i = 1; i <= remainingDays; i++) {
            calendarHTML += `<div class="calendar-day other-month">${i}</div>`;
          }

          calendarHTML += `
            </div>
            <button class="calendar-today-btn" id="select-today">Today</button>
          `;

          calendar.innerHTML = calendarHTML;

          // Event listeners
          document.getElementById('prev-month').addEventListener('click', (e) => {
            e.stopPropagation();
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar(currentDate.getFullYear(), currentDate.getMonth());
          });

          document.getElementById('next-month').addEventListener('click', (e) => {
            e.stopPropagation();
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar(currentDate.getFullYear(), currentDate.getMonth());
          });

          document.getElementById('month-select').addEventListener('change', (e) => {
            e.stopPropagation();
            currentDate.setMonth(parseInt(e.target.value));
            renderCalendar(currentDate.getFullYear(), currentDate.getMonth());
          });

          document.getElementById('year-select').addEventListener('change', (e) => {
            e.stopPropagation();
            currentDate.setFullYear(parseInt(e.target.value));
            renderCalendar(currentDate.getFullYear(), currentDate.getMonth());
          });

          document.getElementById('select-today').addEventListener('click', (e) => {
            e.stopPropagation();
            const today = new Date();
            selectedDate = today;
            dateHidden.value = today.toISOString().split('T')[0];
            dateDisplay.value = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            dateDisplay.style.color = '#333';
            calendar.classList.remove('active');
          });

          document.querySelectorAll('.calendar-day:not(.other-month)').forEach(day => {
            day.addEventListener('click', (e) => {
              e.stopPropagation();
              const dateStr = day.dataset.date;
              if (dateStr) {
                selectedDate = new Date(dateStr);
                dateHidden.value = dateStr;
                dateDisplay.value = selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                dateDisplay.style.color = '#333';
                calendar.classList.remove('active');
              }
            });
          });
        }

        dateDisplay.addEventListener('click', (e) => {
          e.stopPropagation();
          calendar.classList.toggle('active');
          timePicker.classList.remove('active');
          if (calendar.classList.contains('active')) {
            renderCalendar(currentDate.getFullYear(), currentDate.getMonth());
          }
        });

        // Custom Time Picker Implementation
        const timeDisplay = document.getElementById('beat-time-display');
        const timeHidden = document.getElementById('beat-time');
        const timePicker = document.getElementById('custom-time-picker');

        let hours = 10;
        let minutes = 0;
        let period = 'AM';

        function renderTimePicker() {
          const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
          const displayMinutes = String(minutes).padStart(2, '0');

          timePicker.innerHTML = `
            <div class="time-picker-header">${String(displayHours).padStart(2, '0')}:${displayMinutes} ${period}</div>
            <div class="time-controls">
              <div class="time-control">
                <div class="time-control-label">Hour</div>
                <div class="time-control-value">
                  <button class="time-btn" id="hour-up">▲</button>
                  <div class="time-display">${String(displayHours).padStart(2, '0')}</div>
                  <button class="time-btn" id="hour-down">▼</button>
                </div>
              </div>
              <div class="time-control">
                <div class="time-control-label">Minute</div>
                <div class="time-control-value">
                  <button class="time-btn" id="minute-up">▲</button>
                  <div class="time-display">${displayMinutes}</div>
                  <button class="time-btn" id="minute-down">▼</button>
                </div>
              </div>
              <div class="time-control">
                <div class="time-control-label">Period</div>
                <div class="time-period-toggle">
                  <button class="period-btn ${period === 'AM' ? 'active' : ''}" id="period-am">AM</button>
                  <button class="period-btn ${period === 'PM' ? 'active' : ''}" id="period-pm">PM</button>
                </div>
              </div>
            </div>
            <button class="time-done-btn" id="time-done">Done</button>
          `;

          document.getElementById('hour-up').addEventListener('click', (e) => {
            e.stopPropagation();
            hours = hours === 23 ? 0 : hours + 1;
            if (hours === 12 || hours === 0) period = period === 'AM' ? 'PM' : 'AM';
            renderTimePicker();
          });

          document.getElementById('hour-down').addEventListener('click', (e) => {
            e.stopPropagation();
            hours = hours === 0 ? 23 : hours - 1;
            if (hours === 11 || hours === 23) period = period === 'AM' ? 'PM' : 'AM';
            renderTimePicker();
          });

          document.getElementById('minute-up').addEventListener('click', (e) => {
            e.stopPropagation();
            minutes = minutes === 59 ? 0 : minutes + 1;
            renderTimePicker();
          });

          document.getElementById('minute-down').addEventListener('click', (e) => {
            e.stopPropagation();
            minutes = minutes === 0 ? 59 : minutes - 1;
            renderTimePicker();
          });

          document.getElementById('period-am').addEventListener('click', (e) => {
            e.stopPropagation();
            if (period === 'PM') {
              hours = hours >= 12 ? hours - 12 : hours;
              period = 'AM';
              renderTimePicker();
            }
          });

          document.getElementById('period-pm').addEventListener('click', (e) => {
            e.stopPropagation();
            if (period === 'AM') {
              hours = hours < 12 ? hours + 12 : hours;
              period = 'PM';
              renderTimePicker();
            }
          });

          document.getElementById('time-done').addEventListener('click', (e) => {
            e.stopPropagation();
            const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
            timeHidden.value = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
            timeDisplay.value = `${String(displayHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`;
            timeDisplay.style.color = '#333';
            timePicker.classList.remove('active');
          });
        }

        timeDisplay.addEventListener('click', (e) => {
          e.stopPropagation();
          timePicker.classList.toggle('active');
          calendar.classList.remove('active');
          if (timePicker.classList.contains('active')) {
            renderTimePicker();
          }
        });

        // Close pickers when clicking outside
        const handleClickOutside = (e) => {
          const isClickInsideCalendar = calendar.contains(e.target) || dateDisplay.contains(e.target);
          const isClickInsideTimePicker = timePicker.contains(e.target) || timeDisplay.contains(e.target);

          if (!isClickInsideCalendar) {
            calendar.classList.remove('active');
          }
          if (!isClickInsideTimePicker) {
            timePicker.classList.remove('active');
          }
        };

        // Use mousedown instead of click to prevent interference with picker interactions
        setTimeout(() => {
          document.addEventListener('mousedown', handleClickOutside);
        }, 200);
      },
      preConfirm: () => {
        const date = document.getElementById('beat-date').value;
        const time = document.getElementById('beat-time').value;
        const employee = document.getElementById('beat-employee').value;
        const employeeSelect = document.getElementById('beat-employee');
        const employeeName = employeeSelect.options[employeeSelect.selectedIndex]?.dataset?.name || '';
        const planType = document.getElementById('beat-plan-type').value;
        const location = document.getElementById('beat-location').value;
        const remarks = document.getElementById('beat-remarks').value;

        if (!date || !time || !employee || !planType || !location) {
          Swal.showValidationMessage('Please fill all required fields');
          return false;
        }

        return { date, time, employee, employeeName, planType, location, remarks };
      }
    });

    if (formValues) {
      // Show Repeat On dialog
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
                <option value="custom">Custom Date</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>

            <!-- Custom Date Section -->
            <div id="custom-date-section" style="display: none;">
              <div style="margin-bottom: 15px;">
                <label style="display: block; font-size: 13px; font-weight: 400; color: #666; margin-bottom: 8px;">
                  From Date
                </label>
                <input type="date" id="repeat-from-date" style="width: 100%; padding: 10px 12px; height: 42px; font-size: 14px; border: 1px solid #e0e0e0; border-radius: 6px; background: #fafafa; color: #333; outline: none;" />
              </div>
              <div style="margin-bottom: 15px;">
                <label style="display: block; font-size: 13px; font-weight: 400; color: #666; margin-bottom: 8px;">
                  To Date
                </label>
                <input type="date" id="repeat-to-date" style="width: 100%; padding: 10px 12px; height: 42px; font-size: 14px; border: 1px solid #e0e0e0; border-radius: 6px; background: #fafafa; color: #333; outline: none;" />
              </div>
            </div>

            <!-- Weekly Section -->
            <div id="weekly-section" style="display: none;">
              <div style="margin-bottom: 15px;">
                <label style="display: block; font-size: 13px; font-weight: 400; color: #666; margin-bottom: 8px;">
                  From Date
                </label>
                <input type="date" id="weekly-from-date" style="width: 100%; padding: 10px 12px; height: 42px; font-size: 14px; border: 1px solid #e0e0e0; border-radius: 6px; background: #fafafa; color: #333; outline: none;" />
              </div>
              <div style="margin-bottom: 15px;">
                <label style="display: block; font-size: 13px; font-weight: 400; color: #666; margin-bottom: 8px;">
                  To Date
                </label>
                <input type="date" id="weekly-to-date" style="width: 100%; padding: 10px 12px; height: 42px; font-size: 14px; border: 1px solid #e0e0e0; border-radius: 6px; background: #fafafa; color: #333; outline: none;" />
              </div>
              <label style="display: block; font-size: 13px; font-weight: 400; color: #666; margin-bottom: 12px;">
                Select Days
              </label>
              <div style="display: flex; gap: 8px; justify-content: center;">
                <button type="button" class="weekday-btn" data-day="Sunday" style="width: 45px; height: 45px; border-radius: 50%; border: 2px solid #e0e0e0; background: white; color: #666; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s ease;">S</button>
                <button type="button" class="weekday-btn" data-day="Monday" style="width: 45px; height: 45px; border-radius: 50%; border: 2px solid #e0e0e0; background: white; color: #666; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s ease;">M</button>
                <button type="button" class="weekday-btn" data-day="Tuesday" style="width: 45px; height: 45px; border-radius: 50%; border: 2px solid #e0e0e0; background: white; color: #666; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s ease;">T</button>
                <button type="button" class="weekday-btn" data-day="Wednesday" style="width: 45px; height: 45px; border-radius: 50%; border: 2px solid #e0e0e0; background: white; color: #666; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s ease;">W</button>
                <button type="button" class="weekday-btn" data-day="Thursday" style="width: 45px; height: 45px; border-radius: 50%; border: 2px solid #e0e0e0; background: white; color: #666; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s ease;">T</button>
                <button type="button" class="weekday-btn" data-day="Friday" style="width: 45px; height: 45px; border-radius: 50%; border: 2px solid #e0e0e0; background: white; color: #666; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s ease;">F</button>
                <button type="button" class="weekday-btn" data-day="Saturday" style="width: 45px; height: 45px; border-radius: 50%; border: 2px solid #e0e0e0; background: white; color: #666; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s ease;">S</button>
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
          const weeklyFromDateInput = document.getElementById('weekly-from-date');
          const weeklyToDateInput = document.getElementById('weekly-to-date');

          let selectedWeekdays = [];

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

          // Handle from date change for custom
          fromDateInput.addEventListener('change', () => {
            if (fromDateInput.value) {
              toDateInput.min = fromDateInput.value;
            }
          });

          // Handle from date change for weekly
          weeklyFromDateInput.addEventListener('change', () => {
            if (weeklyFromDateInput.value) {
              weeklyToDateInput.min = weeklyFromDateInput.value;
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
            const fromDate = document.getElementById('weekly-from-date').value;
            const toDate = document.getElementById('weekly-to-date').value;
            const selectedWeekdays = window.selectedWeekdays || [];

            if (!fromDate || !toDate) {
              Swal.showValidationMessage('Please select both from and to dates for weekly repeat');
              return false;
            }

            if (selectedWeekdays.length === 0) {
              Swal.showValidationMessage('Please select at least one weekday');
              return false;
            }

            return { repeatType: 'weekly', fromDate, toDate, weekdays: selectedWeekdays };
          }
        }
      });

      if (repeatData) {
        // Show success message with generated plan code
        Swal.fire({
          icon: 'success',
          title: 'Successfully Visit Submitted',
          html: `<p style="font-size: 16px; color: #666; margin: 10px 0;">${nextPlanCode}</p>`,
          confirmButtonColor: '#FF6B35',
          confirmButtonText: 'OK',
          timer: 3000,
          showConfirmButton: true
        });

        // Increment plan code for next use
        const currentNumber = parseInt(nextPlanCode.replace(/[^\d]/g, ''));
        const newNumber = currentNumber + 1;
        const formatted = newNumber.toString().padStart(4, '0').split('').join(' ');
        setNextPlanCode(`P # ${formatted}`);

        // Navigate with all data including selected customer info
        navigate('/create-beat', {
          state: {
            ...formValues,
            repeatData,
            selectedCustomer: {
              customer_code: formValues.employee,
              customer_name: formValues.employeeName,
              city: formValues.location
            }
          }
        });
      }
    }
  };

  // Handle Apply Leave button
  const handleApplyLeave = async () => {
    const { value: formValues } = await Swal.fire({
      title: '<div style="text-align: left; padding: 0; margin: 0;"><span style="color: #333; font-size: 20px; font-weight: 600;">Apply Leave</span></div>',
      html: `
        <div style="text-align: left; padding: 20px 0;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px;">
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #555; margin-bottom: 10px;">
                From Date <span style="color: #dc3545;">*</span>
              </label>
              <input type="date" id="leave-from-date" style="width: 100%; padding: 12px 16px; height: 48px; font-size: 14px; border: 2px solid #e0e0e0; border-radius: 8px; background: #fafafa; color: #333; outline: none; cursor: pointer; transition: all 0.2s ease;" onfocus="this.style.background='white'; this.style.borderColor='#2196F3'" onblur="this.style.background='#fafafa'; this.style.borderColor='#e0e0e0'" />
            </div>
            <div>
              <label style="display: block; font-size: 14px; font-weight: 500; color: #555; margin-bottom: 10px;">
                To Date <span style="color: #dc3545;">*</span>
              </label>
              <input type="date" id="leave-to-date" style="width: 100%; padding: 12px 16px; height: 48px; font-size: 14px; border: 2px solid #e0e0e0; border-radius: 8px; background: #fafafa; color: #333; outline: none; cursor: pointer; transition: all 0.2s ease;" onfocus="this.style.background='white'; this.style.borderColor='#2196F3'" onblur="this.style.background='#fafafa'; this.style.borderColor='#e0e0e0'" />
            </div>
          </div>
          
          <div style="margin-bottom: 24px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #555; margin-bottom: 10px;">
              Reason <span style="color: #dc3545;">*</span>
            </label>
            <textarea id="leave-reason" rows="4" placeholder="Enter reason for leave..." style="width: 100%; padding: 12px 16px; font-size: 14px; border: 2px solid #e0e0e0; border-radius: 8px; background: #fafafa; color: #333; outline: none; resize: vertical; transition: all 0.2s ease; font-family: Inter, sans-serif; line-height: 1.5;" onfocus="this.style.background='white'; this.style.borderColor='#2196F3'" onblur="this.style.background='#fafafa'; this.style.borderColor='#e0e0e0'"></textarea>
          </div>
        </div>
      `,
      showCloseButton: true,
      showCancelButton: false,
      focusConfirm: false,
      confirmButtonText: 'Submit',
      confirmButtonColor: '#2196F3',
      width: '600px',
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
        const fromDateInput = document.getElementById('leave-from-date');
        const toDateInput = document.getElementById('leave-to-date');

        // Set minimum date to today
        const today = new Date().toISOString().split('T')[0];
        fromDateInput.min = today;
        toDateInput.min = today;

        // When from date changes, update to date minimum
        fromDateInput.addEventListener('change', () => {
          if (fromDateInput.value) {
            toDateInput.min = fromDateInput.value;
            // Clear to date if it's before the new from date
            if (toDateInput.value && toDateInput.value < fromDateInput.value) {
              toDateInput.value = '';
            }
          }
        });
      },
      preConfirm: () => {
        const fromDate = document.getElementById('leave-from-date').value;
        const toDate = document.getElementById('leave-to-date').value;
        const reason = document.getElementById('leave-reason').value.trim();

        if (!fromDate || !toDate || !reason) {
          Swal.showValidationMessage('Please fill all required fields');
          return false;
        }

        // Validate date range
        if (new Date(toDate) < new Date(fromDate)) {
          Swal.showValidationMessage('To Date must be after From Date');
          return false;
        }

        return { fromDate, toDate, reason };
      }
    });

    if (formValues) {
      try {
        // Show loading
        Swal.fire({
          title: 'Submitting Leave Application...',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        // Call backend API
        const response = await apiService.post('/leave/apply', {
          from_date: formValues.fromDate,
          to_date: formValues.toDate,
          reason: formValues.reason
        });

        if (response.success) {
          Swal.fire({
            icon: 'success',
            title: 'Leave Applied Successfully!',
            text: `Leave applied from ${new Date(formValues.fromDate).toLocaleDateString('en-GB')} to ${new Date(formValues.toDate).toLocaleDateString('en-GB')}`,
            confirmButtonColor: '#2196F3',
            timer: 2500,
            showConfirmButton: true
          });
        } else {
          throw new Error(response.message || 'Failed to apply leave');
        }
      } catch (error) {
        console.error('Error applying leave:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || error.message || 'Failed to apply leave. Please try again.',
          confirmButtonColor: '#dc3545'
        });
      }
    }
  };

  // Handle Import Beat button
  const handleImportBeat = async () => {
    const { value: file } = await Swal.fire({
      title: '<div style="text-align: left; padding: 0; margin: 0;"><span style="color: #333; font-size: 20px; font-weight: 600;">Upload file</span></div>',
      html: `
        <div style="text-align: center; padding: 10px 0;">
          <div id="drop-zone" style="border: 2px dashed #20409A; border-radius: 12px; padding: 40px 30px; background: #f8f9fb; cursor: pointer; transition: all 0.3s ease; margin-bottom: 10px;">
            <div style="margin-bottom: 15px;">
              <img src="${ExcelIcon}" alt="Excel" style="width: 48px; height: 48px;" />
            </div>
            <p style="font-size: 15px; color: #666; margin: 0;">
              Drag&Drop file here or <span id="choose-file-link" style="color: #2196F3; text-decoration: underline; cursor: pointer; font-weight: 600;">Choose file</span>
            </p>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <p style="font-size: 12px; color: #999; margin: 0;">Supported formats: .XLS .XLSX .CSV</p>
            <p style="font-size: 12px; color: #999; margin: 0;">Maximum size: 25 MB</p>
          </div>
          <div style="border: 1px solid #e0e0e0; border-radius: 12px; padding: 20px; background: #fff; text-align: left;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <img src="${ExcelIcon}" alt="Excel" style="width: 36px; height: 36px;" />
                <div>
                  <h3 style="font-size: 16px; font-weight: 600; color: #333; margin: 0;">Template</h3>
                  <p style="font-size: 13px; color: #666; margin: 0;">You can download template as starting point for your own file.</p>
                </div>
              </div>
              <button id="download-template-btn" style="background: white; border: 2px solid #20409A; color: #20409A; padding: 8px 20px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; white-space: nowrap;" onmouseover="this.style.background='#f0f4ff'" onmouseout="this.style.background='white'">
                Download
              </button>
            </div>
          </div>
          <input type="file" id="file-input" accept=".xls,.xlsx,.csv" style="display: none;" />
          <div id="selected-file-name" style="margin-top: 10px; font-size: 13px; color: #28a745; font-weight: 600;"></div>
        </div>
      `,
      showCloseButton: true,
      showCancelButton: true,
      showConfirmButton: true,
      confirmButtonText: 'Import',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#20409A',
      cancelButtonColor: '#6c757d',
      width: '700px',
      padding: '25px 35px',
      background: '#ffffff',
      customClass: {
        popup: 'import-popup',
        title: 'import-popup-title',
        htmlContainer: 'import-popup-content',
        confirmButton: 'beat-popup-btn',
        cancelButton: 'beat-popup-cancel-btn',
        closeButton: 'clean-close-btn'
      },
      didOpen: () => {
        const dropZone = document.getElementById('drop-zone');
        const fileInput = document.getElementById('file-input');
        const chooseFileLink = document.getElementById('choose-file-link');
        const downloadBtn = document.getElementById('download-template-btn');
        const selectedFileName = document.getElementById('selected-file-name');

        let selectedFile = null;

        chooseFileLink.addEventListener('click', () => {
          fileInput.click();
        });

        dropZone.addEventListener('click', (e) => {
          if (e.target.id !== 'choose-file-link') {
            fileInput.click();
          }
        });

        fileInput.addEventListener('change', (e) => {
          if (e.target.files && e.target.files[0]) {
            selectedFile = e.target.files[0];
            selectedFileName.textContent = '✓ Selected: ' + selectedFile.name;
            dropZone.style.borderColor = '#28a745';
            dropZone.style.background = '#f0fff4';
          }
        });

        dropZone.addEventListener('dragover', (e) => {
          e.preventDefault();
          dropZone.style.borderColor = '#2196F3';
          dropZone.style.background = '#e3f2fd';
        });

        dropZone.addEventListener('dragleave', () => {
          dropZone.style.borderColor = '#20409A';
          dropZone.style.background = '#f8f9fb';
        });

        dropZone.addEventListener('drop', (e) => {
          e.preventDefault();
          dropZone.style.borderColor = '#20409A';
          dropZone.style.background = '#f8f9fb';

          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            selectedFile = e.dataTransfer.files[0];
            selectedFileName.textContent = '✓ Selected: ' + selectedFile.name;
            dropZone.style.borderColor = '#28a745';
            dropZone.style.background = '#f0fff4';
          }
        });

        downloadBtn.addEventListener('click', () => {
          const csvContent = "Customer Code,Customer Name,Contact Number,Target,Unit,Location,Date\\nCUST001,Sam Auto Parts,9876543210,50000,Rs,Chennai,2025-03-01\\nCUST002,K R Parts,9876543211,30000,Rs,Madurai,2025-03-01";
          const blob = new Blob([csvContent], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'beat_import_template.csv';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        });

        Swal.getConfirmButton().onclick = () => {
          if (selectedFile) {
            Swal.close();
            Swal.fire({
              icon: 'success',
              title: 'Beat Imported Successfully!',
              html: `
                <div style="text-align: left;">
                  <p><strong>File:</strong> ${selectedFile.name}</p>
                  <p><strong>Records Imported:</strong> 5</p>
                  <p style="margin-top: 12px; color: #28a745; font-weight: 600;">✓ Beat records added to View Plan table</p>
                </div>
              `,
              confirmButtonColor: '#20409A',
            });
          } else {
            Swal.showValidationMessage('Please select a file to import');
          }
          return false;
        };
      },
      preConfirm: () => {
        return true;
      }
    });
  };

  return (
    <div className="beat-plan-page">
      <Header />
      <div className="beat-plan-content">
        <div className="breadcrumb-actions-row">
          <Breadcrumb currentPage="Beat Plan" />
          <div className="top-action-buttons">
            <div className="search-wrapper">
              <input
                type="text"
                className="search-bar"
                placeholder="Search Customer Name / Code"
              />
            </div>
            <button className="create-beat-btn" onClick={handleCreateBeat}>
              <img src={DateIcon} alt="Create" className="btn-icon" />
              Create Beat
            </button>
            <button className="apply-leave-btn" onClick={handleApplyLeave}>
              <img src={DateIcon} alt="Leave" className="btn-icon" />
              Apply Leave
            </button>
            <button className="import-beat-btn" onClick={handleImportBeat}>
              <img src={ImportIcon} alt="Import" className="btn-icon" />
              Import
            </button>
            <button className="export-btnn" onClick={() => beatPlanRef.current?.handleExport()}>
              <img src={ExportIcon} alt="Export" className="btn-icon" />
              Export
            </button>
          </div>
        </div>
        
        {/* Visit Counts Dashboard */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', margin: '20px 0' }}>
          <div style={{ background: 'linear-gradient(135deg, #ffffffff 0%, #ffffffff 100%)', padding: '20px', borderRadius: '3px', border: '1px solid #a5d6a7' }}>
            <p style={{ fontSize: '14px', color: '#2e7d32', margin: '0 0 8px 0', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Today Visited</p>
            <p style={{ fontSize: '32px', color: '#1b5e20', margin: '0', fontWeight: '700' }}>{visitCounts.today}</p>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #ffffffff 0%, #ffffffff 100%)', padding: '20px', borderRadius: '3px', border: '1px solid #90caf9' }}>
            <p style={{ fontSize: '14px', color: '#1565c0', margin: '0 0 8px 0', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>This Week Visited</p>
            <p style={{ fontSize: '32px', color: '#0d47a1', margin: '0', fontWeight: '700' }}>{visitCounts.week}</p>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #ffffffff 0%, #ffffffff 100%)', padding: '20px', borderRadius: '3px', border: '1px solid #ffcc80' }}>
            <p style={{ fontSize: '14px', color: '#e65100', margin: '0 0 8px 0', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>This Month Visited</p>
            <p style={{ fontSize: '32px', color: '#bf360c', margin: '0', fontWeight: '700' }}>{visitCounts.month}</p>
          </div>
        </div>
        
        <BeatPlan
          ref={beatPlanRef}
          onCreateBeat={handleCreateBeat}
          onApplyLeave={handleApplyLeave}
          onImportBeat={handleImportBeat}
        />
      </div>
    </div>
  );
};

export default BeatPlanPage;
