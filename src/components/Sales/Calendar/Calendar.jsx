import React, { useState, useRef, useEffect } from 'react';
import dateIcon from '../../../assets/Icons/Date.png';
import './Calendar.css';

const Calendar = ({ value, onChange, placeholder = "Select Date" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const calendarRef = useRef(null);

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const weekDays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7; // Monday = 0

    const days = [];
    
    // Previous month's trailing days
    const prevMonth = new Date(year, month - 1, 0);
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: prevMonth.getDate() - i,
        isCurrentMonth: false,
        date: new Date(year, month - 1, prevMonth.getDate() - i)
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        day,
        isCurrentMonth: true,
        date: new Date(year, month, day)
      });
    }

    // Next month's leading days
    const remainingDays = 42 - days.length; // 6 rows × 7 days
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        day,
        isCurrentMonth: false,
        date: new Date(year, month + 1, day)
      });
    }

    return days;
  };

  const handleDateClick = (dateObj) => {
    const formattedDate = `${dateObj.date.getDate().toString().padStart(2, '0')}/${(dateObj.date.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.date.getFullYear()}`;
    onChange(formattedDate);
    setIsOpen(false);
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const isSelectedDate = (dateObj) => {
    if (!value || !dateObj.isCurrentMonth) return false;
    const [day, month, year] = value.split('/');
    return dateObj.day === parseInt(day) && 
           (currentDate.getMonth() + 1) === parseInt(month) && 
           currentDate.getFullYear() === parseInt(year);
  };

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return '';
    const [day, month, year] = dateStr.split('/');
    return `${day}/${month}/${year}`;
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className="calendar-container" ref={calendarRef}>
      <div className="date-input-wrapper">
        <input
          type="text"
          value={value ? formatDisplayDate(value) : ''}
          placeholder={placeholder}
          readOnly
          className="date-input"
          onClick={() => setIsOpen(!isOpen)}
        />
        <img 
          src={dateIcon} 
          alt="Calendar" 
          className="date-icon"
          onClick={() => setIsOpen(!isOpen)}
        />
      </div>

      {isOpen && (
        <div className="calendar-dropdown">
          <div className="calendar-header">
            <button 
              className="nav-btn"
              onClick={() => navigateMonth(-1)}
            >
              &#8249;
            </button>
            <span className="month-year">
              {months[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <button 
              className="nav-btn"
              onClick={() => navigateMonth(1)}
            >
              &#8250;
            </button>
          </div>

          <div className="calendar-grid">
            <div className="weekdays">
              {weekDays.map(day => (
                <div key={day} className="weekday">{day}</div>
              ))}
            </div>

            <div className="days-grid">
              {days.map((dateObj, index) => (
                <button
                  key={index}
                  className={`day-cell ${
                    !dateObj.isCurrentMonth ? 'other-month' : ''
                  } ${isSelectedDate(dateObj) ? 'selected' : ''}`}
                  onClick={() => handleDateClick(dateObj)}
                >
                  {dateObj.day}
                </button>
              ))}
            </div>
          </div>

          <div className="calendar-footer">
            <button 
              className="select-btn"
              onClick={() => setIsOpen(false)}
            >
              Select
            </button>
            <button 
              className="close-btn"
              onClick={() => setIsOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;