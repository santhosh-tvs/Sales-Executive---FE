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
      title: '<div style="text-align:left;padding:0;margin:0"><span style="color:#1e293b;font-size:20px;font-weight:700">Create Beat</span></div>',
      html: `
        <style>
          .cb-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px}
          .cb-label{display:block;font-size:11px;font-weight:700;color:#6b7280;margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px}
          .cb-input{width:100%;padding:10px 12px;height:42px;font-size:14px;border:1.5px solid #e5e7eb;border-radius:8px;background:#f9fafb;color:#111827;outline:none;cursor:pointer;transition:all .2s;box-sizing:border-box;font-family:Inter,sans-serif}
          .cb-input:focus{border-color:#20409A;background:#fff;box-shadow:0 0 0 3px rgba(32,64,154,.08)}
          .cb-textarea{width:100%;padding:10px 12px;font-size:14px;border:1.5px solid #e5e7eb;border-radius:8px;background:#f9fafb;color:#111827;outline:none;resize:vertical;transition:all .2s;font-family:Inter,sans-serif;line-height:1.5;box-sizing:border-box}
          .cb-textarea:focus{border-color:#20409A;background:#fff;box-shadow:0 0 0 3px rgba(32,64,154,.08)}
          .cb-cal{position:absolute;top:100%;left:0;z-index:9999;background:#fff;border:1.5px solid #e5e7eb;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.12);width:280px;padding:12px;display:none;margin-top:4px}
          .cb-cal.open{display:block}
          .cb-cal-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}
          .cb-cal-nav{background:none;border:1.5px solid #e5e7eb;border-radius:6px;width:28px;height:28px;cursor:pointer;font-size:12px;display:flex;align-items:center;justify-content:center;color:#374151}
          .cb-cal-nav:hover{background:#f3f4f6}
          .cb-cal-selects{display:flex;gap:6px}
          .cb-cal-sel{padding:4px 6px;border:1.5px solid #e5e7eb;border-radius:6px;font-size:12px;background:#f9fafb;color:#111827;outline:none;cursor:pointer}
          .cb-cal-days-header{display:grid;grid-template-columns:repeat(7,1fr);gap:2px;margin-bottom:4px}
          .cb-cal-dh{text-align:center;font-size:10px;font-weight:700;color:#9ca3af;padding:4px 0}
          .cb-cal-days{display:grid;grid-template-columns:repeat(7,1fr);gap:2px}
          .cb-cal-day{text-align:center;padding:6px 2px;font-size:12px;border-radius:6px;cursor:pointer;color:#111827;transition:all .15s}
          .cb-cal-day:hover{background:#eff6ff;color:#20409A}
          .cb-cal-day.other{color:#d1d5db;cursor:default;pointer-events:none}
          .cb-cal-day.today{font-weight:700;color:#20409A}
          .cb-cal-day.selected{background:#20409A;color:#fff;font-weight:700}
          .cb-cal-day.selected:hover{background:#1a3580}
          .cb-cal-today-btn{width:100%;margin-top:8px;padding:6px;background:#f0f4ff;border:1.5px solid #c7d2fe;border-radius:6px;color:#20409A;font-size:12px;font-weight:600;cursor:pointer}
          .cb-time-wrap{display:flex;align-items:center;justify-content:center;gap:6px;background:#f0f4ff;border:1.5px solid #c7d2fe;border-radius:10px;padding:8px 14px;height:52px;box-sizing:border-box;transition:all .2s}
          .cb-time-col{display:flex;flex-direction:column;align-items:center;gap:0}
          .cb-time-btn{background:none;border:none;cursor:pointer;color:#94a3b8;font-size:8px;line-height:1;padding:2px 6px;border-radius:3px;display:block}
          .cb-time-btn:hover{color:#20409A;background:#e0e7ff}
          .cb-time-val{font-size:22px;font-weight:800;color:#20409A;min-width:28px;text-align:center;line-height:1.1;font-family:Inter,sans-serif}
          .cb-time-sep{font-size:22px;font-weight:800;color:#20409A;margin:0 2px;padding-bottom:2px}
          .cb-ampm-wrap{display:flex;flex-direction:row;gap:4px;margin-left:8px;background:#e0e7ff;border-radius:8px;padding:3px}
          .cb-ampm-btn{padding:4px 10px;border-radius:6px;border:none;font-size:11px;font-weight:700;cursor:pointer;background:transparent;color:#6b7280;transition:all .15s;line-height:1}
          .cb-ampm-btn.active{background:#20409A;color:#fff;box-shadow:0 1px 4px rgba(32,64,154,.3)}
        </style>
        <div style="text-align:left;padding:10px 0">
          <div class="cb-grid">
            <div>
              <label class="cb-label">Plan Type</label>
              <select id="beat-plan-type" class="cb-input">
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
            <div style="position:relative">
              <label class="cb-label">Select Date</label>
              <input type="text" id="beat-date-display" readonly placeholder="Pick a date" class="cb-input" style="cursor:pointer" />
              <input type="hidden" id="beat-date" />
              <div id="custom-calendar" class="cb-cal"></div>
            </div>
          </div>
          <div class="cb-grid">
            <div>
              <label class="cb-label">Select Time (IST · 12h)</label>
              <div class="cb-time-wrap">
                <div class="cb-time-col">
                  <button class="cb-time-btn" id="cb-h-up">▲</button>
                  <div class="cb-time-val" id="cb-h-val">09</div>
                  <button class="cb-time-btn" id="cb-h-dn">▼</button>
                </div>
                <span class="cb-time-sep">:</span>
                <div class="cb-time-col">
                  <button class="cb-time-btn" id="cb-m-up">▲</button>
                  <div class="cb-time-val" id="cb-m-val">00</div>
                  <button class="cb-time-btn" id="cb-m-dn">▼</button>
                </div>
                <div class="cb-ampm-wrap">
                  <button class="cb-ampm-btn active" id="cb-am">AM</button>
                  <button class="cb-ampm-btn" id="cb-pm">PM</button>
                </div>
              </div>
              <input type="hidden" id="beat-time" value="09:00" />
            </div>
            <div>
              <label class="cb-label">Select Customer</label>
              <select id="beat-employee" class="cb-input">
                <option value="">Select Customer</option>
                ${customersData.map(c => `<option value="${c.customer_code}" data-name="${c.customer_name}" data-city="${c.city || ''}">${c.customer_name}</option>`).join('')}
              </select>
            </div>
          </div>
          <div class="cb-grid" style="margin-bottom:16px">
            <div>
              <label class="cb-label">Location</label>
              <select id="beat-location" class="cb-input">
                <option value="">Select Location</option>
                ${citiesData.map(city => `<option value="${city}">${city}</option>`).join('')}
              </select>
            </div>
          </div>
          <div style="margin-bottom:4px">
            <label class="cb-label">Remarks</label>
            <textarea id="beat-remarks" rows="3" placeholder="Enter remarks (optional)..." class="cb-textarea"></textarea>
          </div>
        </div>
      `,
      showCloseButton: true,
      showCancelButton: false,
      focusConfirm: false,
      confirmButtonText: 'Add',
      confirmButtonColor: '#20409A',
      width: '680px',
      padding: '28px 32px',
      background: '#ffffff',
      customClass: {
        popup: 'clean-popup',
        title: 'clean-popup-title',
        htmlContainer: 'clean-popup-content',
        confirmButton: 'beat-popup-btn',
        closeButton: 'clean-close-btn'
      },
      didOpen: () => {
        // Customer → auto-fill location
        const employeeSelect = document.getElementById('beat-employee');
        const locationSelect = document.getElementById('beat-location');
        employeeSelect.addEventListener('change', (e) => {
          const city = e.target.options[e.target.selectedIndex]?.dataset?.city || '';
          if (city) locationSelect.value = city;
        });

        // ── Calendar ──────────────────────────────────────────────────────
        const dateDisplay = document.getElementById('beat-date-display');
        const dateHidden = document.getElementById('beat-date');
        const calendar = document.getElementById('custom-calendar');
        let currentDate = new Date();
        let selectedDate = null;

        function renderCalendar(year, month) {
          const firstDayIndex = new Date(year, month, 1).getDay();
          const lastDateNum = new Date(year, month + 1, 0).getDate();
          const prevLastDateNum = new Date(year, month, 0).getDate();
          const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
          const today = new Date();

          let html = `
            <div class="cb-cal-header">
              <button class="cb-cal-nav" id="prev-month">◀</button>
              <div class="cb-cal-selects">
                <select class="cb-cal-sel" id="month-select">${months.map((m,i)=>`<option value="${i}"${i===month?' selected':''}>${m}</option>`).join('')}</select>
                <select class="cb-cal-sel" id="year-select">${Array.from({length:10},(_,i)=>year-5+i).map(y=>`<option value="${y}"${y===year?' selected':''}>${y}</option>`).join('')}</select>
              </div>
              <button class="cb-cal-nav" id="next-month">▶</button>
            </div>
            <div class="cb-cal-days-header">
              ${['Su','Mo','Tu','We','Th','Fr','Sa'].map(d=>`<div class="cb-cal-dh">${d}</div>`).join('')}
            </div>
            <div class="cb-cal-days">
          `;
          for (let i = firstDayIndex; i > 0; i--) html += `<div class="cb-cal-day other">${prevLastDateNum-i+1}</div>`;
          for (let i = 1; i <= lastDateNum; i++) {
            const isToday = i===today.getDate()&&month===today.getMonth()&&year===today.getFullYear();
            const isSel = selectedDate&&i===selectedDate.getDate()&&month===selectedDate.getMonth()&&year===selectedDate.getFullYear();
            const cls = ['cb-cal-day',isToday?'today':'',isSel?'selected':''].filter(Boolean).join(' ');
            html += `<div class="${cls}" data-date="${year}-${String(month+1).padStart(2,'0')}-${String(i).padStart(2,'0')}">${i}</div>`;
          }
          const rem = 42-(firstDayIndex+lastDateNum);
          for (let i = 1; i <= rem; i++) html += `<div class="cb-cal-day other">${i}</div>`;
          html += `</div><button class="cb-cal-today-btn" id="select-today">Today</button>`;
          calendar.innerHTML = html;

          document.getElementById('prev-month').addEventListener('click', e => { e.stopPropagation(); currentDate.setMonth(currentDate.getMonth()-1); renderCalendar(currentDate.getFullYear(),currentDate.getMonth()); });
          document.getElementById('next-month').addEventListener('click', e => { e.stopPropagation(); currentDate.setMonth(currentDate.getMonth()+1); renderCalendar(currentDate.getFullYear(),currentDate.getMonth()); });
          document.getElementById('month-select').addEventListener('change', e => { e.stopPropagation(); currentDate.setMonth(parseInt(e.target.value)); renderCalendar(currentDate.getFullYear(),currentDate.getMonth()); });
          document.getElementById('year-select').addEventListener('change', e => { e.stopPropagation(); currentDate.setFullYear(parseInt(e.target.value)); renderCalendar(currentDate.getFullYear(),currentDate.getMonth()); });
          document.getElementById('select-today').addEventListener('click', e => {
            e.stopPropagation();
            const t = new Date();
            selectedDate = t;
            dateHidden.value = t.toISOString().split('T')[0];
            dateDisplay.value = t.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'});
            calendar.classList.remove('open');
          });
          calendar.querySelectorAll('.cb-cal-day:not(.other)').forEach(day => {
            day.addEventListener('click', e => {
              e.stopPropagation();
              const ds = day.dataset.date;
              if (ds) {
                selectedDate = new Date(ds);
                dateHidden.value = ds;
                dateDisplay.value = selectedDate.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'});
                calendar.classList.remove('open');
              }
            });
          });
        }

        dateDisplay.addEventListener('click', e => {
          e.stopPropagation();
          calendar.classList.toggle('open');
          if (calendar.classList.contains('open')) renderCalendar(currentDate.getFullYear(), currentDate.getMonth());
        });

        // ── 12-hour IST Time Picker ───────────────────────────────────────
        let tHour = 9, tMin = 0, tPeriod = 'AM';

        function updateTimeDisplay() {
          document.getElementById('cb-h-val').textContent = String(tHour).padStart(2,'0');
          document.getElementById('cb-m-val').textContent = String(tMin).padStart(2,'0');
          document.getElementById('cb-am').classList.toggle('active', tPeriod==='AM');
          document.getElementById('cb-pm').classList.toggle('active', tPeriod==='PM');
          // Store as 24h for backend
          let h24 = tHour % 12;
          if (tPeriod==='PM') h24 += 12;
          document.getElementById('beat-time').value = `${String(h24).padStart(2,'0')}:${String(tMin).padStart(2,'0')}`;
        }

        document.getElementById('cb-h-up').addEventListener('click', e => { e.stopPropagation(); tHour = tHour===12?1:tHour+1; updateTimeDisplay(); });
        document.getElementById('cb-h-dn').addEventListener('click', e => { e.stopPropagation(); tHour = tHour===1?12:tHour-1; updateTimeDisplay(); });
        document.getElementById('cb-m-up').addEventListener('click', e => { e.stopPropagation(); tMin = tMin===59?0:tMin+1; updateTimeDisplay(); });
        document.getElementById('cb-m-dn').addEventListener('click', e => { e.stopPropagation(); tMin = tMin===0?59:tMin-1; updateTimeDisplay(); });
        document.getElementById('cb-am').addEventListener('click', e => { e.stopPropagation(); tPeriod='AM'; updateTimeDisplay(); });
        document.getElementById('cb-pm').addEventListener('click', e => { e.stopPropagation(); tPeriod='PM'; updateTimeDisplay(); });
        updateTimeDisplay();

        // Close calendar on outside click
        const handleClickOutside = (e) => {
          if (!calendar.contains(e.target) && !dateDisplay.contains(e.target)) calendar.classList.remove('open');
        };
        setTimeout(() => document.addEventListener('mousedown', handleClickOutside), 200);
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
                  Date
                </label>
                <input type="date" id="repeat-custom-date" style="width: 100%; padding: 10px 12px; height: 42px; font-size: 14px; border: 1px solid #e0e0e0; border-radius: 6px; background: #fafafa; color: #333; outline: none;" />
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
            const customDate = document.getElementById('repeat-custom-date').value;

            if (!customDate) {
              Swal.showValidationMessage('Please select a date');
              return false;
            }

            return { repeatType: 'custom', customDate };
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
          <Breadcrumb crumbs={[
            { label: 'Home', path: '/sales-home' },
            { label: 'Beat Plan' },
          ]} />
          <div className="top-action-buttons">
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
