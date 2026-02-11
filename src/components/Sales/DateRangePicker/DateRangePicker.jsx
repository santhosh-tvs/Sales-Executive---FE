import React, { useState } from 'react';
import './DateRangePicker.css';

const DateRangePicker = ({ onDateChange, placeholder = "Select Date Range" }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);

  // Format date as DD-MM-YYYY
  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Handle date selection
  const handleStartDateChange = (e) => {
    const date = e.target.value;
    setStartDate(date);
    if (endDate && onDateChange) {
      onDateChange({
        startDate: formatDate(date),
        endDate: formatDate(endDate),
        range: `${formatDate(date)} - ${formatDate(endDate)}`
      });
    }
  };

  const handleEndDateChange = (e) => {
    const date = e.target.value;
    setEndDate(date);
    if (startDate && onDateChange) {
      onDateChange({
        startDate: formatDate(startDate),
        endDate: formatDate(date),
        range: `${formatDate(startDate)} - ${formatDate(date)}`
      });
    }
  };

  // Get display value
  const getDisplayValue = () => {
    if (startDate && endDate) {
      return `${formatDate(startDate)} - ${formatDate(endDate)}`;
    }
    return '';
  };

  return (
    <div className="date-range-picker">
      <div className="date-range-input-container">
        <input
          type="text"
          value={getDisplayValue()}
          placeholder={placeholder}
          readOnly
          className="date-range-display"
          onClick={() => setShowCalendar(!showCalendar)}
        />
        <div className="calendar-icon" onClick={() => setShowCalendar(!showCalendar)}>
          📅
        </div>
      </div>
      
      {showCalendar && (
        <div className="date-range-calendar">
          <div className="date-inputs">
            <div className="date-input-group">
              <label>Start Date:</label>
              <input
                type="date"
                value={startDate}
                onChange={handleStartDateChange}
                className="date-input"
              />
            </div>
            <div className="date-input-group">
              <label>End Date:</label>
              <input
                type="date"
                value={endDate}
                onChange={handleEndDateChange}
                className="date-input"
                min={startDate}
              />
            </div>
          </div>
          <div className="calendar-actions">
            <button 
              className="apply-btn"
              onClick={() => setShowCalendar(false)}
              disabled={!startDate || !endDate}
            >
              Apply
            </button>
            <button 
              className="cancel-btn"
              onClick={() => setShowCalendar(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;