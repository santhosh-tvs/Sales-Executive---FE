import React from 'react';
import '../../../styles/Sales/Home1/Sales_Daily_Graph1.css';

const Sales_Daily_Graph1 = () => {
  // Sample data points based on the image
  const dataPoints = [
    { x: 10, y: 1000 },
    { x: 20, y: 850 },
    { x: 30, y: 1100 },
    { x: 40, y: 1200 },
    { x: 50, y: 1050 },
    { x: 60, y: 1000 },
    { x: 70, y: 1350 },
    { x: 80, y: 1500 },
    { x: 90, y: 1650 },
    { x: 100, y: 1900 },
    { x: 110, y: 2100 },
    { x: 120, y: 2200 }
  ];

  // Calculate SVG path
  const createPath = () => {
    const width = 600;
    const height = 300;
    const maxX = 120;
    const maxY = 2500;
    
    let path = '';
    
    dataPoints.forEach((point, index) => {
      const x = (point.x / maxX) * width;
      const y = height - (point.y / maxY) * height;
      
      if (index === 0) {
        path += `M ${x} ${y}`;
      } else {
        path += ` L ${x} ${y}`;
      }
    });
    
    return path;
  };

  // Create data points for circles
  const createDataPoints = () => {
    const width = 600;
    const height = 300;
    const maxX = 120;
    const maxY = 2500;
    
    return dataPoints.map((point, index) => ({
      x: (point.x / maxX) * width,
      y: height - (point.y / maxY) * height,
      value: point.y
    }));
  };

  return (
    <div className="sales-daily-graph-container">
      <div className="sales-daily-graph-content">
        <div className="graph-header">
          <h2 className="graph-title">Sales Daily Graph</h2>
        </div>
        
        <div className="graph-wrapper">
          <div className="y-axis-labels">
            <span>2500</span>
            <span>2000</span>
            <span>1500</span>
            <span>1000</span>
            <span>500</span>
            <span>0</span>
          </div>
          
          <div className="graph-area">
            <svg width="600" height="300" viewBox="0 0 600 300" className="graph-svg">
              {/* Grid lines */}
              <defs>
                <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                  <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#f0f0f0" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              
              {/* Main line */}
              <path
                d={createPath()}
                fill="none"
                stroke="#FF6B35"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              
              {/* Data points */}
              {createDataPoints().map((point, index) => (
                <circle
                  key={index}
                  cx={point.x}
                  cy={point.y}
                  r="5"
                  fill="#FF6B35"
                  stroke="white"
                  strokeWidth="2"
                />
              ))}
            </svg>
            
            <div className="x-axis-labels">
              <span>10</span>
              <span>20</span>
              <span>30</span>
              <span>40</span>
              <span>50</span>
              <span>60</span>
              <span>70</span>
              <span>80</span>
              <span>90</span>
              <span>100</span>
              <span>110</span>
              <span>120</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sales_Daily_Graph1;