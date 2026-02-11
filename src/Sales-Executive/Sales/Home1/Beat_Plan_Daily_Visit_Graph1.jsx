import React from 'react';
import '../../../styles/Sales/Home1/Beat_Plan_Daily_Visit_Graph1.css';

const Beat_Plan_Daily_Visit_Graph1 = () => {
  // Sample data points based on the image
  const dataPoints = [
    { x: 0, y: 20 },
    { x: 1, y: 22 },
    { x: 3, y: 25 },
    { x: 5, y: 30 },
    { x: 7, y: 28 },
    { x: 9, y: 15 },
    { x: 11, y: 18 },
    { x: 13, y: 45 },
    { x: 15, y: 55 },
    { x: 17, y: 50 },
    { x: 19, y: 48 },
    { x: 21, y: 40 },
    { x: 23, y: 38 },
    { x: 25, y: 35 },
    { x: 27, y: 42 },
    { x: 29, y: 65 },
    { x: 31, y: 75 }
  ];

  const chartWidth = 1200;
  const chartHeight = 300;
  const maxX = 31;
  const maxY = 80;

  // Create the path for the line
  const createLinePath = () => {
    let path = '';
    
    dataPoints.forEach((point, index) => {
      const x = (point.x / maxX) * chartWidth;
      const y = chartHeight - (point.y / maxY) * chartHeight;
      
      if (index === 0) {
        path += `M ${x} ${y}`;
      } else {
        path += ` L ${x} ${y}`;
      }
    });
    
    return path;
  };

  // Create the area path (line + fill to bottom)
  const createAreaPath = () => {
    let path = '';
    
    // Start from bottom left
    const firstPoint = dataPoints[0];
    const firstX = (firstPoint.x / maxX) * chartWidth;
    path += `M ${firstX} ${chartHeight}`;
    
    // Go up to first point
    const firstY = chartHeight - (firstPoint.y / maxY) * chartHeight;
    path += ` L ${firstX} ${firstY}`;
    
    // Draw the line
    dataPoints.forEach((point, index) => {
      if (index > 0) {
        const x = (point.x / maxX) * chartWidth;
        const y = chartHeight - (point.y / maxY) * chartHeight;
        path += ` L ${x} ${y}`;
      }
    });
    
    // Close the area by going to bottom right and back to start
    const lastPoint = dataPoints[dataPoints.length - 1];
    const lastX = (lastPoint.x / maxX) * chartWidth;
    path += ` L ${lastX} ${chartHeight}`;
    path += ` Z`;
    
    return path;
  };

  // X-axis labels
  const xAxisLabels = [0, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31];

  return (
    <div className="beat-plan-daily-visit-graph-container">
      <div className="beat-plan-daily-visit-graph-content">
        <div className="graph-header">
          <h2 className="graph-title">Beat Plan Daily Visits graph</h2>
        </div>
        
        <div className="graph-wrapper">
          <div className="graph-area">
            <svg width={chartWidth} height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="graph-svg">
              {/* Grid lines */}
              <defs>
                <pattern id="grid-beat-plan" width="40" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 30" fill="none" stroke="#f0f0f0" strokeWidth="1"/>
                </pattern>
                
                {/* Gradient for area fill */}
                <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{stopColor: '#3498db', stopOpacity: 0.3}} />
                  <stop offset="100%" style={{stopColor: '#3498db', stopOpacity: 0.1}} />
                </linearGradient>
              </defs>
              
              <rect width="100%" height="100%" fill="url(#grid-beat-plan)" />
              
              {/* Area fill */}
              <path
                d={createAreaPath()}
                fill="url(#areaGradient)"
                stroke="none"
              />
              
              {/* Main line */}
              <path
                d={createLinePath()}
                fill="none"
                stroke="#3498db"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            
            <div className="x-axis-labels">
              {xAxisLabels.map((label, index) => (
                <span key={index} style={{left: `${(label / maxX) * 100}%`}}>
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Beat_Plan_Daily_Visit_Graph1;