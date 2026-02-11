import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../header/Header';
import '../../../styles/Sales/Home1/Home_Page.css';

const Home_Page = () => {
  const [activeTab, setActiveTab] = useState('Sales');
  const navigate = useNavigate();

  // Navigation functions
  const handleMyActionsClick = () => {
    navigate('/my-actions');
  };

  const handleMyCollectionsClick = () => {
    navigate('/my-collections');
  };

  const handleMyCustomersClick = () => {
    navigate('/my-customers');
  };

  // Sample data for widgets
  const widgetData = {
    sales: {
      ctd: { value: 2500, target: 3000 },
      wtd: { value: 28300, target: 35000 },
      mtd: { value: 115400, target: 130000 },
      ytd: { value: 2000000, target: 2130000 }
    },
    receipt: {
      ctd: { value: 2500, target: 3000 },
      wtd: { value: 18300, target: 20500 },
      mtd: { value: 75400, target: 85000 },
      ytd: { value: 2554000, target: 2700000 }
    },
    beat: {
      ctd: { value: 20, target: 25 },
      wtd: { value: 55, target: 60 },
      mtd: { value: 220, target: 250 },
      ytd: { value: 220, target: 250 }
    }
  };

  // Sample chart data
  const chartData = {
    target: [1000, 950, 900, 850, 900, 950, 1000, 1050, 1100, 1150, 1200, 1250, 1300, 1350, 1400, 1450, 1500, 1550, 1600, 1650, 1700, 1750, 1800, 1850, 1900, 1950, 2000, 2050, 2100, 2150],
    actual: [950, 850, 800, 750, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000, 2100, 2200, 2300, 2400, 2500, 2600, 2700, 2800, 2900, 3000, 3100, 3200, 3300]
  };

  const customerData = [
    { name: 'DIVYA MOTORS', value: 35, color: '#FFD700' },
    { name: 'NMP CARS LLP', value: 25, color: '#FF6B35' },
    { name: 'SAMARTH AUTOCARE', value: 20, color: '#4ECDC4' },
    { name: 'NEHAL MOTOR BODY WORKS', value: 15, color: '#45B7D1' },
    { name: 'DWITY CARZ', value: 5, color: '#96CEB4' }
  ];

  const renderWidget = (title, data, type) => {
    const getProgressColor = (value, target) => {
      const percentage = (value / target) * 100;
      if (percentage >= 90) return '#28a745';
      if (percentage >= 70) return '#20409A';
      return '#dc3545';
    };

    return (
      <div className="widget-card">
        <div className="widget-header">
          <h3>{title}</h3>
          <div className="widget-mini-chart">
            {/* Mini chart placeholder */}
            <svg width="60" height="30" viewBox="0 0 60 30">
              <path
                d="M5,25 Q15,15 25,20 T45,10 T55,15"
                fill="none"
                stroke="#FF6B35"
                strokeWidth="2"
              />
            </svg>
          </div>
        </div>
        <div className="widget-metrics">
          {Object.entries(data).map(([period, values]) => (
            <div key={period} className="metric-item">
              <div className="metric-label">{period.toUpperCase()}</div>
              <div className="metric-value">₹{values.value.toLocaleString()}</div>
              <div className="metric-target">{values.target.toLocaleString()}</div>
              <div 
                className="metric-progress"
                style={{
                  backgroundColor: getProgressColor(values.value, values.target),
                  width: `${Math.min((values.value / values.target) * 100, 100)}%`
                }}
              ></div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderBeatWidget = (title, data) => {
    return (
      <div className="widget-card">
        <div className="widget-header">
          <h3>{title}</h3>
          <div className="widget-mini-chart">
            <svg width="60" height="30" viewBox="0 0 60 30">
              <rect x="5" y="20" width="8" height="8" fill="#FF6B35" />
              <rect x="15" y="15" width="8" height="13" fill="#FF6B35" />
              <rect x="25" y="10" width="8" height="18" fill="#FF6B35" />
              <rect x="35" y="12" width="8" height="16" fill="#FF6B35" />
              <rect x="45" y="8" width="8" height="20" fill="#FF6B35" />
            </svg>
          </div>
        </div>
        <div className="widget-metrics">
          {Object.entries(data).map(([period, values]) => (
            <div key={period} className="metric-item">
              <div className="metric-label">{period.toUpperCase()}</div>
              <div className="metric-value">{values.value}</div>
              <div className="metric-target">{values.target}</div>
              <div 
                className="metric-progress"
                style={{
                  backgroundColor: values.value >= values.target ? '#28a745' : '#20409A',
                  width: `${Math.min((values.value / values.target) * 100, 100)}%`
                }}
              ></div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderMainChart = () => {
    const maxValue = Math.max(...chartData.target, ...chartData.actual);
    const chartHeight = 300;
    const chartWidth = 800;

    return (
      <div className="main-chart-container">
        <div className="chart-header">
          <div className="chart-title">Day wise Target v/s Actuals - MTD</div>
          <div className="chart-legend">
            <div className="legend-item">
              <div className="legend-dot target"></div>
              <span>Target</span>
            </div>
            <div className="legend-item">
              <div className="legend-dot actual"></div>
              <span>Actual</span>
            </div>
            <div className="chart-stats">
              <span>Sales Daily Graph</span>
              <span className="chart-value">₹6,478K</span>
              <span className="chart-growth">↗ 2.5%</span>
            </div>
          </div>
        </div>
        <svg width={chartWidth} height={chartHeight} className="main-chart-svg">
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="40" height="30" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 30" fill="none" stroke="#f0f0f0" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Target line */}
          <path
            d={chartData.target.map((value, index) => {
              const x = (index / (chartData.target.length - 1)) * chartWidth;
              const y = chartHeight - (value / maxValue) * chartHeight;
              return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
            }).join(' ')}
            fill="none"
            stroke="#FFA500"
            strokeWidth="3"
            strokeLinecap="round"
          />
          
          {/* Actual line */}
          <path
            d={chartData.actual.map((value, index) => {
              const x = (index / (chartData.actual.length - 1)) * chartWidth;
              const y = chartHeight - (value / maxValue) * chartHeight;
              return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
            }).join(' ')}
            fill="none"
            stroke="#2563eb"
            strokeWidth="3"
            strokeLinecap="round"
          />
          
          {/* Data points */}
          {chartData.target.map((value, index) => {
            const x = (index / (chartData.target.length - 1)) * chartWidth;
            const y = chartHeight - (value / maxValue) * chartHeight;
            return (
              <circle
                key={`target-${index}`}
                cx={x}
                cy={y}
                r="4"
                fill="#FFA500"
                stroke="white"
                strokeWidth="2"
              />
            );
          })}
          
          {chartData.actual.map((value, index) => {
            const x = (index / (chartData.actual.length - 1)) * chartWidth;
            const y = chartHeight - (value / maxValue) * chartHeight;
            return (
              <circle
                key={`actual-${index}`}
                cx={x}
                cy={y}
                r="4"
                fill="#2563eb"
                stroke="white"
                strokeWidth="2"
              />
            );
          })}
        </svg>
        <div className="chart-x-axis">
          {Array.from({length: 30}, (_, i) => i + 1).map(day => (
            <span key={day}>{day}</span>
          ))}
        </div>
      </div>
    );
  };

  const renderPieChart = () => {
    const total = customerData.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;
    const radius = 80;
    const centerX = 120;
    const centerY = 120;

    return (
      <div className="pie-chart-container">
        <div className="pie-chart-header">
          <h3>Customer wise Trend - MTD</h3>
          <div className="pie-chart-total">
            <span>Collection: ₹1,800</span>
          </div>
        </div>
        <div className="pie-chart-content">
          <div className="pie-chart-legend">
            {customerData.map((item, index) => (
              <div key={index} className="pie-legend-item">
                <div 
                  className="pie-legend-color" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <span>{item.name}</span>
              </div>
            ))}
            <div className="pie-legend-item">
              <div className="pie-legend-color" style={{ backgroundColor: '#E8E8E8' }}></div>
              <span>5+ See More</span>
            </div>
          </div>
          <div className="pie-chart-svg-container">
            <svg width="240" height="240" viewBox="0 0 240 240">
              {customerData.map((item, index) => {
                const angle = (item.value / total) * 360;
                const startAngle = currentAngle;
                const endAngle = currentAngle + angle;
                
                const x1 = centerX + radius * Math.cos((startAngle * Math.PI) / 180);
                const y1 = centerY + radius * Math.sin((startAngle * Math.PI) / 180);
                const x2 = centerX + radius * Math.cos((endAngle * Math.PI) / 180);
                const y2 = centerY + radius * Math.sin((endAngle * Math.PI) / 180);
                
                const largeArcFlag = angle > 180 ? 1 : 0;
                
                const pathData = [
                  `M ${centerX} ${centerY}`,
                  `L ${x1} ${y1}`,
                  `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                  'Z'
                ].join(' ');
                
                currentAngle += angle;
                
                return (
                  <path
                    key={index}
                    d={pathData}
                    fill={item.color}
                    stroke="white"
                    strokeWidth="2"
                  />
                );
              })}
            </svg>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      <Header />
      
      <div className="dashboard-content">
        {/* Overview Header with Action Buttons in same row */}
        <div className="dashboard-header">
          <h1>Over View</h1>
          <div className="action-buttons">
            <button className="action-btn" onClick={handleMyActionsClick}>My Actions</button>
            <button className="action-btn" onClick={handleMyCollectionsClick}>My Collections</button>
            <button className="action-btn" onClick={handleMyCustomersClick}>My Customers</button>
          </div>
        </div>

        {/* Widgets Row */}
        <div className="widgets-row">
          {renderWidget('Sales', widgetData.sales, 'sales')}
          {renderWidget('Receipt', widgetData.receipt, 'receipt')}
          {renderBeatWidget('Beat', widgetData.beat)}
        </div>

        {/* Chart Tabs */}
        <div className="chart-tabs">
          {['Sales', 'Receipt', 'Beat'].map(tab => (
            <button
              key={tab}
              className={`chart-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Main Chart */}
        <div className="main-chart-section">
          {renderMainChart()}
        </div>

        {/* Customer Pie Chart */}
        <div className="pie-chart-section">
          {renderPieChart()}
        </div>
      </div>
    </div>
  );
};

export default Home_Page;