import React from 'react';
import '../../../styles/Sales/Home1/Receipt_Daily_Graph1.css';

const Receipt_Daily_Graph1 = () => {
  // Sample data points based on the image
  const dataPoints = [
    { x: 0, blue: 600, orange: 500 },
    { x: 1, blue: 450, orange: 400 },
    { x: 2, blue: 750, orange: 750 },
    { x: 3, blue: 50, orange: 100 },
    { x: 4, blue: 950, orange: 600 },
    { x: 5, blue: 100, orange: 450 },
    { x: 6, blue: 150, orange: 950 },
    { x: 7, blue: 700, orange: 350 },
    { x: 8, blue: 200, orange: 800 },
    { x: 9, blue: 100, orange: 700 }
  ];

  const maxValue = 1000;
  const chartHeight = 300;
  const chartWidth = 600;
  const barWidth = (chartWidth / dataPoints.length) * 0.8;
  const barSpacing = (chartWidth / dataPoints.length) * 0.2;

  return (
    <div className="receipt-daily-graph-container">
      <div className="receipt-daily-graph-content">
        <div className="graph-header">
          <h2 className="graph-title">Receipt Daily Graph</h2>
        </div>
        
        <div className="graph-wrapper">
          <div className="y-axis-labels">
            <span>1000</span>
            <span>750</span>
            <span>500</span>
            <span>250</span>
            <span>0</span>
          </div>
          
          <div className="graph-area">
            <svg width={chartWidth} height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="graph-svg">
              {/* Grid lines */}
              <defs>
                <pattern id="grid-receipt" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#f0f0f0" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid-receipt)" />
              
              {/* Bars */}
              {dataPoints.map((point, index) => {
                const x = (index * chartWidth) / dataPoints.length + barSpacing / 2;
                const blueHeight = (point.blue / maxValue) * chartHeight;
                const orangeHeight = (point.orange / maxValue) * chartHeight;
                const individualBarWidth = barWidth / 2;
                
                return (
                  <g key={index}>
                    {/* Blue bar */}
                    <rect
                      x={x}
                      y={chartHeight - blueHeight}
                      width={individualBarWidth}
                      height={blueHeight}
                      fill="#1f4e79"
                      className="bar blue-bar"
                    />
                    
                    {/* Orange bar */}
                    <rect
                      x={x + individualBarWidth + 2}
                      y={chartHeight - orangeHeight}
                      width={individualBarWidth}
                      height={orangeHeight}
                      fill="#FF6B35"
                      className="bar orange-bar"
                    />
                  </g>
                );
              })}
            </svg>
            
            <div className="x-axis-labels">
              {dataPoints.map((point, index) => (
                <span key={index}>{point.x}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Receipt_Daily_Graph1;