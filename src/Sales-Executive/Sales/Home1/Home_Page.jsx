import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';
import Header from '../../header/Header';
import '../../../styles/Sales/Home1/Home_Page.css';
import BellIcon from '../../../assets/Icons/Bell Pin.png';
import CoinIcon from '../../../assets/Icons/coin.png';
import ProfileIcon from '../../../assets/Icons/profile.png';
import SalesIcon from '../../../assets/Icons/Sales.png';
import ReceiptIcon from '../../../assets/Icons/Reciept.png';
import BeatIcon from '../../../assets/Icons/Beat.png';
import { apiService } from '../../../services/apiservice';

const Home_Page = () => {
  useAuth(); // Check authentication
  const [activeTab, setActiveTab] = useState('Sales');
  const navigate = useNavigate();

  // Beat API state
  const [beatCounts, setBeatCounts] = useState(null);
  const [beatGraphData, setBeatGraphData] = useState([]);
  const [beatPieData, setBeatPieData] = useState([]);
  const [beatLoading, setBeatLoading] = useState(true);

  // Chart interaction state
  const [chartTooltip, setChartTooltip] = useState(null);
  const [hoveredSlice, setHoveredSlice] = useState(null);
  const [hoveredLegend, setHoveredLegend] = useState(null);

  // Chart expand state: null | 'line' | 'pie'
  const [expandedChart, setExpandedChart] = useState(null);

  useEffect(() => {
    const fetchBeatData = async () => {
      setBeatLoading(true);
      try {
        const [countsRes, graphRes, pieRes] = await Promise.all([
          apiService.get('/dashboard/plan-visited-counts'),
          apiService.get('/dashboard/my-visit-day-wise-visited-graph'),
          apiService.get('/dashboard/my-visit-pie-chart-data'),
        ]);
        if (countsRes.success) setBeatCounts(countsRes.data);
        if (graphRes.success) setBeatGraphData(graphRes.data || []);
        if (pieRes.success) setBeatPieData(pieRes.customers || []);
      } catch (e) {
        console.error('Beat dashboard fetch error:', e);
      } finally {
        setBeatLoading(false);
      }
    };
    fetchBeatData();
  }, []);

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
    }
  };

  // Beat widget data from API (with fallback)
  const beatWidgetData = beatCounts
    ? {
        ctd: { value: beatCounts.today.visited, target: beatCounts.today.target },
        wtd: { value: beatCounts.week.visited,  target: beatCounts.week.target  },
        mtd: { value: beatCounts.month.visited, target: beatCounts.month.target },
        ytd: { value: beatCounts.year.visited,  target: beatCounts.year.target  },
      }
    : {
        ctd: { value: 0, target: 0 },
        wtd: { value: 0, target: 0 },
        mtd: { value: 0, target: 0 },
        ytd: { value: 0, target: 0 },
      };

  // Sample chart data (Sales/Receipt tabs — static for now)
  const chartData = {
    target: [1000, 950, 900, 850, 900, 950, 1000, 1050, 1100, 1150, 1200, 1250, 1300, 1350, 1400, 1450, 1500, 1550, 1600, 1650, 1700, 1750, 1800, 1850, 1900, 1950, 2000, 2050, 2100, 2150],
    actual: [950, 850, 800, 750, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000, 2100, 2200, 2300, 2400, 2500, 2600, 2700, 2800, 2900, 3000, 3100, 3200, 3300]
  };

  // Beat chart data from API
  const beatChartData = {
    target: beatGraphData.map(d => d.target_planned),
    actual: beatGraphData.map(d => d.actual_visited),
    labels: beatGraphData.map(d => d.day),
  };

  const customerData = [
    { name: 'DIVYA MOTORS', value: 35, color: '#FFD700' },
    { name: 'NMP CARS LLP', value: 25, color: '#FF6B35' },
    { name: 'SAMARTH AUTOCARE', value: 20, color: '#4ECDC4' },
    { name: 'NEHAL MOTOR BODY WORKS', value: 15, color: '#45B7D1' },
    { name: 'DWITY CARZ', value: 5, color: '#96CEB4' }
  ];

  // Pie chart colours for beat customers
  const PIE_COLORS = ['#FFD700', '#FF6B35', '#4ECDC4', '#45B7D1', '#96CEB4', '#A78BFA', '#F87171', '#34D399'];

  const beatCustomerData = beatPieData.slice(0, 8).map((c, i) => ({
    name: c.customer_name || c.garage_code || `Customer ${i + 1}`,
    value: c.visited_count,
    color: PIE_COLORS[i % PIE_COLORS.length],
  }));

  const renderWidget = (title, data, type) => {
    const getAccentColor = () => {
      if (type === 'sales') return '#20409A';
      if (type === 'receipt') return '#F36F21';
      return '#28a745';
    };

    const getProgressColor = (value, target) => {
      const pct = target > 0 ? (value / target) * 100 : 0;
      if (pct >= 90) return '#28a745';
      if (pct >= 70) return '#20409A';
      return '#dc3545';
    };

    const getWidgetIcon = () => {
      if (type === 'sales') return <img src={SalesIcon} alt="Sales" className="widget-icon" />;
      if (type === 'receipt') return <img src={ReceiptIcon} alt="Receipt" className="widget-icon" />;
      return null;
    };

    // Mini sparkline from values
    const vals = Object.values(data).map(v => v.value);
    const sparkMax = Math.max(...vals, 1);
    const sparkW = 60; const sparkH = 28;
    const sparkPath = vals.map((v, i) => {
      const x = (i / (vals.length - 1)) * sparkW;
      const y = sparkH - (v / sparkMax) * sparkH;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');

    const mtd = data.mtd || data.ctd;
    const trendPct = mtd.target > 0 ? Math.round(((mtd.value - mtd.target) / mtd.target) * 100) : 0;
    const accent = getAccentColor();

    return (
      <div className="widget-card" style={{ borderLeft: `4px solid ${accent}` }}>
        <div className="widget-header">
          <div>
            <h3>{title}</h3>
            <div className={`widget-trend ${trendPct >= 0 ? 'up' : 'down'}`}>
              {trendPct >= 0 ? '↑' : '↓'} {Math.abs(trendPct)}% vs target
            </div>
          </div>
          <div>
            {getWidgetIcon()}
          </div>
        </div>
        <div className="widget-metrics">
          {Object.entries(data).map(([period, values]) => (
            <div key={period} className="metric-item">
              <div className="metric-label">{period.toUpperCase()}</div>
              <div className="metric-value">₹{values.value.toLocaleString()}</div>
              <div className="metric-target">{values.target.toLocaleString()}</div>
              <div className="metric-progress-track">
                <div className="metric-progress" style={{
                  backgroundColor: getProgressColor(values.value, values.target),
                  width: `${values.target > 0 ? Math.min((values.value / values.target) * 100, 100) : 0}%`
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderBeatWidget = (title, data) => {
    const vals = Object.values(data).map(v => v.value);
    const sparkMax = Math.max(...vals, 1);
    const sparkW = 60; const sparkH = 28;
    const sparkPath = vals.map((v, i) => {
      const x = (i / Math.max(vals.length - 1, 1)) * sparkW;
      const y = sparkH - (v / sparkMax) * sparkH;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');

    const mtd = data.mtd;
    const trendPct = mtd.target > 0 ? Math.round(((mtd.value - mtd.target) / mtd.target) * 100) : 0;

    return (
      <div className="widget-card" style={{ borderLeft: '4px solid #10b981' }}>
        <div className="widget-header">
          <div>
            <h3>{title}</h3>
            {!beatLoading && (
              <div className={`widget-trend ${trendPct >= 0 ? 'up' : 'down'}`}>
                {trendPct >= 0 ? '↑' : '↓'} {Math.abs(trendPct)}% vs target
              </div>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
            <img src={BeatIcon} alt="Beat" className="widget-icon" />
            {!beatLoading && vals.some(v => v > 0) && (
              <svg width={sparkW} height={sparkH} style={{ display: 'block' }}>
                <path d={sparkPath} fill="none" stroke="#10b981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
              </svg>
            )}
          </div>
        </div>
        {beatLoading ? (
          <div style={{ padding: '12px 0', fontSize: '13px', color: '#9aa3b8' }}>Loading...</div>
        ) : (
          <div className="widget-metrics">
            {Object.entries(data).map(([period, values]) => (
              <div key={period} className="metric-item">
                <div className="metric-label">{period.toUpperCase()}</div>
                <div className="metric-value" style={{ color: '#10b981' }}>{values.value}</div>
                <div className="metric-target">{values.target}</div>
                <div className="metric-progress-track">
                  <div className="metric-progress" style={{
                    backgroundColor: values.value >= values.target ? '#10b981' : '#20409A',
                    width: `${values.target > 0 ? Math.min((values.value / values.target) * 100, 100) : 0}%`
                  }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderMainChart = () => {
    const isBeat = activeTab === 'Beat';
    const activeChart = isBeat ? beatChartData : chartData;
    const activeLabels = isBeat ? beatChartData.labels : Array.from({ length: 30 }, (_, i) => i + 1);

    if (isBeat && beatLoading) {
      return <div className="main-chart-container" style={{ padding: '40px', textAlign: 'center', color: '#9aa3b8' }}>Loading beat data...</div>;
    }
    if (isBeat && beatGraphData.length === 0) {
      return <div className="main-chart-container" style={{ padding: '40px', textAlign: 'center', color: '#9aa3b8' }}>No beat visit data for this month.</div>;
    }

    const W = 820;
    const H = 280;
    const PAD = { top: 16, right: 16, bottom: 8, left: 48 };
    const innerW = W - PAD.left - PAD.right;
    const innerH = H - PAD.top - PAD.bottom;

    const maxValue = Math.max(...activeChart.target, ...activeChart.actual, 1);
    const yTicks = 5;

    const xPos = (i, len) => PAD.left + (i / Math.max(len - 1, 1)) * innerW;
    const yPos = (v) => PAD.top + innerH - (v / maxValue) * innerH;

    // Smooth bezier curve path
    const linePath = (arr) => {
      if (arr.length < 2) return arr.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xPos(i, arr.length)} ${yPos(v)}`).join(' ');
      let d = `M ${xPos(0, arr.length)} ${yPos(arr[0])}`;
      for (let i = 1; i < arr.length; i++) {
        const x0 = xPos(i - 1, arr.length); const y0 = yPos(arr[i - 1]);
        const x1 = xPos(i, arr.length);     const y1 = yPos(arr[i]);
        const cpx = (x0 + x1) / 2;
        d += ` C ${cpx} ${y0}, ${cpx} ${y1}, ${x1} ${y1}`;
      }
      return d;
    };

    const areaPath = (arr) => {
      if (arr.length === 0) return '';
      const line = linePath(arr);
      return `${line} L ${xPos(arr.length - 1, arr.length)} ${PAD.top + innerH} L ${PAD.left} ${PAD.top + innerH} Z`;
    };

    // Today marker index (for beat chart)
    const todayIdx = isBeat ? (new Date().getDate() - 1) : -1;
    const todayX = todayIdx >= 0 && todayIdx < activeChart.actual.length ? xPos(todayIdx, activeChart.actual.length) : null;

    // Summary bar stats
    const totalPlanned = activeChart.target.reduce((s, v) => s + v, 0);
    const totalVisited = activeChart.actual.reduce((s, v) => s + v, 0);
    const totalMissed = Math.max(0, totalPlanned - totalVisited);
    const visitRate = totalPlanned > 0 ? Math.round((totalVisited / totalPlanned) * 100) : 0;

    const handleMouseMove = (e, arr, label, color) => {
      const svg = e.currentTarget.closest('svg');
      const rect = svg.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const relX = mouseX - PAD.left;
      const idx = Math.round((relX / innerW) * (arr.length - 1));
      const clampedIdx = Math.max(0, Math.min(arr.length - 1, idx));
      setChartTooltip({
        x: xPos(clampedIdx, arr.length),
        y: yPos(arr[clampedIdx]),
        value: arr[clampedIdx],
        label: activeLabels[clampedIdx] ?? clampedIdx + 1,
        series: label,
        color,
      });
    };

    const totalActual = activeChart.actual.reduce((s, v) => s + v, 0);
    const totalTarget = activeChart.target.reduce((s, v) => s + v, 0);
    const achievePct = totalTarget > 0 ? Math.round((totalActual / totalTarget) * 100) : 0;

    return (
      <div className="main-chart-container">
        <div className="chart-header">
          <div>
            <div className="chart-title">
              {isBeat ? 'Day wise Beat Visits — MTD' : 'Day wise Target vs Actuals — MTD'}
            </div>
            <div style={{ fontSize: '12px', color: '#9aa3b8', marginTop: '2px' }}>
              {isBeat
                ? `Total Planned: ${totalTarget} · Visited: ${totalActual}`
                : `Total Target: ₹${totalTarget.toLocaleString()} · Actual: ₹${totalActual.toLocaleString()}`}
            </div>
          </div>
          <div className="chart-legend">
            <div className="legend-item">
              <div className="legend-dot target"></div>
              <span>{isBeat ? 'Planned' : 'Target'}</span>
            </div>
            <div className="legend-item">
              <div className="legend-dot actual"></div>
              <span>{isBeat ? 'Visited' : 'Actual'}</span>
            </div>
            <div className="chart-stats">
              <span className={`chart-growth ${achievePct >= 90 ? '' : achievePct >= 70 ? 'warn' : 'danger'}`}>
                {achievePct >= 90 ? '↗' : achievePct >= 70 ? '→' : '↘'} {achievePct}% achieved
              </span>
            </div>
          </div>
        </div>

        <div style={{ position: 'relative' }} onMouseLeave={() => setChartTooltip(null)}>
          {/* Summary bar — beat only */}
          {isBeat && (
            <div className="chart-summary-bar">
              <div className="chart-stat-chip planned">
                <span className="chip-label">Planned</span>
                <span className="chip-value">{totalPlanned}</span>
              </div>
              <div className="chart-stat-chip visited">
                <span className="chip-label">Visited</span>
                <span className="chip-value">{totalVisited}</span>
              </div>
              <div className="chart-stat-chip missed">
                <span className="chip-label">Missed</span>
                <span className="chip-value">{totalMissed}</span>
              </div>
              <div className={`chart-stat-chip rate ${visitRate >= 80 ? 'good' : visitRate >= 50 ? 'warn' : 'bad'}`}>
                <span className="chip-label">Rate</span>
                <span className="chip-value">{visitRate}%</span>
              </div>
            </div>
          )}
          <svg
            width="100%"
            viewBox={`0 0 ${W} ${H}`}
            className="main-chart-svg"
            style={{ overflow: 'visible' }}
          >
            <defs>
              <linearGradient id="gradTarget" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFA500" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#FFA500" stopOpacity="0.01" />
              </linearGradient>
              <linearGradient id="gradActual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563eb" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#2563eb" stopOpacity="0.01" />
              </linearGradient>
            </defs>

            {/* Y-axis grid + labels */}
            {Array.from({ length: yTicks + 1 }, (_, i) => {
              const val = Math.round((maxValue / yTicks) * i);
              const y = yPos(val);
              return (
                <g key={i}>
                  <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y} stroke="#f0f2f8" strokeWidth="1" />
                  <text x={PAD.left - 6} y={y + 4} textAnchor="end" fontSize="10" fill="#b0b8cc">
                    {val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
                  </text>
                </g>
              );
            })}

            {/* Area fills */}
            <path d={areaPath(activeChart.target)} fill="url(#gradTarget)" />
            <path d={areaPath(activeChart.actual)} fill="url(#gradActual)" />

            {/* Lines */}
            <path d={linePath(activeChart.target)} fill="none" stroke="#FFA500" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d={linePath(activeChart.actual)} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

            {/* Today marker — beat only */}
            {isBeat && todayX !== null && (
              <g>
                <line x1={todayX} y1={PAD.top} x2={todayX} y2={PAD.top + innerH} stroke="#10b981" strokeWidth="1.5" strokeDasharray="5 3" opacity="0.7" />
                <rect x={todayX - 16} y={PAD.top - 14} width="32" height="14" rx="4" fill="#10b981" opacity="0.9" />
                <text x={todayX} y={PAD.top - 3} textAnchor="middle" fontSize="9" fill="white" fontWeight="700">TODAY</text>
              </g>
            )}

            {/* Invisible hover zones */}
            <rect
              x={PAD.left} y={PAD.top} width={innerW} height={innerH}
              fill="transparent"
              onMouseMove={(e) => handleMouseMove(e, activeChart.target, isBeat ? 'Planned' : 'Target', '#FFA500')}
            />

            {/* Tooltip crosshair + dot */}
            {chartTooltip && (
              <g>
                <line x1={chartTooltip.x} y1={PAD.top} x2={chartTooltip.x} y2={PAD.top + innerH} stroke="#dde2ef" strokeWidth="1" strokeDasharray="4 3" />
                <circle cx={chartTooltip.x} cy={chartTooltip.y} r="5" fill={chartTooltip.color} stroke="white" strokeWidth="2" />
              </g>
            )}
          </svg>

          {/* Tooltip box */}
          {chartTooltip && (
            <div className="chart-tooltip" style={{
              left: `${(chartTooltip.x / W) * 100}%`,
              top: `${(chartTooltip.y / H) * 100}%`,
            }}>
              <div className="chart-tooltip-day">Day {chartTooltip.label}</div>
              <div className="chart-tooltip-row">
                <span style={{ color: '#FFA500' }}>●</span>
                <span>{isBeat ? 'Planned' : 'Target'}: <b>{activeChart.target[activeLabels.indexOf(chartTooltip.label)] ?? '—'}</b></span>
              </div>
              <div className="chart-tooltip-row">
                <span style={{ color: '#2563eb' }}>●</span>
                <span>{isBeat ? 'Visited' : 'Actual'}: <b>{activeChart.actual[activeLabels.indexOf(chartTooltip.label)] ?? '—'}</b></span>
              </div>
            </div>
          )}
        </div>

        <div className="chart-x-axis">
          {activeLabels.map((label, i) => <span key={i}>{label}</span>)}
        </div>
      </div>
    );
  };

  const renderPieChart = () => {
    const isBeat = activeTab === 'Beat';
    const activeData = isBeat ? beatCustomerData : customerData;

    if (isBeat && beatLoading) {
      return <div className="pie-chart-container" style={{ padding: '40px', textAlign: 'center', color: '#9aa3b8' }}>Loading...</div>;
    }
    if (isBeat && beatCustomerData.length === 0) {
      return <div className="pie-chart-container" style={{ padding: '40px', textAlign: 'center', color: '#9aa3b8' }}>No customer visit data for this month.</div>;
    }

    const total = activeData.reduce((sum, item) => sum + item.value, 0);
    const visitRatePie = beatCounts && isBeat
      ? (beatCounts.today.target > 0 ? Math.round((beatCounts.today.visited / beatCounts.today.target) * 100) : 0)
      : 100;
    const showWarning = isBeat && visitRatePie < 50;
    const cx = 120; const cy = 120;
    const outerR = 100; const innerR = 58; // donut hole

    const buildSlices = () => {
      if (activeData.length === 1) {
        return (
          <>
            <circle cx={cx} cy={cy} r={outerR} fill={activeData[0].color}
              opacity={hoveredSlice === 0 || hoveredLegend === 0 ? 1 : 0.85}
              onMouseEnter={() => setHoveredSlice(0)}
              onMouseLeave={() => setHoveredSlice(null)}
              style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
            />
            <circle cx={cx} cy={cy} r={innerR} fill="white" />
          </>
        );
      }

      let angle = -90;
      return activeData.map((item, index) => {
        const sliceDeg = total > 0 ? (item.value / total) * 360 : 0;
        const isHovered = hoveredSlice === index || hoveredLegend === index;
        const expandR = isHovered ? outerR + 8 : outerR;

        const toRad = (deg) => (deg * Math.PI) / 180;
        const x1o = cx + expandR * Math.cos(toRad(angle));
        const y1o = cy + expandR * Math.sin(toRad(angle));
        const x2o = cx + expandR * Math.cos(toRad(angle + sliceDeg));
        const y2o = cy + expandR * Math.sin(toRad(angle + sliceDeg));
        const x1i = cx + innerR * Math.cos(toRad(angle));
        const y1i = cy + innerR * Math.sin(toRad(angle));
        const x2i = cx + innerR * Math.cos(toRad(angle + sliceDeg));
        const y2i = cy + innerR * Math.sin(toRad(angle + sliceDeg));
        const large = sliceDeg > 180 ? 1 : 0;

        const d = [
          `M ${x1i} ${y1i}`,
          `L ${x1o} ${y1o}`,
          `A ${expandR} ${expandR} 0 ${large} 1 ${x2o} ${y2o}`,
          `L ${x2i} ${y2i}`,
          `A ${innerR} ${innerR} 0 ${large} 0 ${x1i} ${y1i}`,
          'Z'
        ].join(' ');

        angle += sliceDeg;
        return (
          <path
            key={index} d={d} fill={item.color}
            stroke="white" strokeWidth="2"
            opacity={hoveredSlice === null && hoveredLegend === null ? 1 : isHovered ? 1 : 0.45}
            style={{ cursor: 'pointer', transition: 'opacity 0.2s, d 0.2s' }}
            onMouseEnter={() => setHoveredSlice(index)}
            onMouseLeave={() => setHoveredSlice(null)}
          />
        );
      });
    };

    const activeHovered = hoveredSlice !== null ? hoveredSlice : hoveredLegend;
    const centerItem = activeHovered !== null ? activeData[activeHovered] : null;
    const centerPct = centerItem && total > 0 ? Math.round((centerItem.value / total) * 100) : null;

    return (
      <div className="pie-chart-container">
        <div className="pie-chart-header">
          <h3>{isBeat ? 'Customer wise Beat Visits — MTD' : 'Customer wise Trend — MTD'}</h3>
          <div className="pie-chart-total">
            <span className="pie-total-badge">{isBeat ? `${total} Visits` : 'Collection: ₹1,800'}</span>
          </div>
        </div>
        {showWarning && (
          <div className="pie-warning-banner">
            ⚠ Low visit rate today — only {visitRatePie}% of planned visits completed
          </div>
        )}
        <div className="pie-chart-content">
          <div className="pie-chart-svg-container" style={{ position: 'relative' }}>
            <svg width="240" height="240" viewBox="0 0 240 240" style={{ overflow: 'visible' }}>
              {buildSlices()}
              {/* Center text */}
              {centerItem ? (
                <>
                  <text x={cx} y={cy - 10} textAnchor="middle" fontSize="22" fontWeight="700" fill="#1a2340">{centerPct}%</text>
                  <text x={cx} y={cy + 10} textAnchor="middle" fontSize="9" fill="#9aa3b8" fontWeight="600">
                    {centerItem.name.length > 14 ? centerItem.name.slice(0, 14) + '…' : centerItem.name}
                  </text>
                  <text x={cx} y={cy + 26} textAnchor="middle" fontSize="11" fill="#F36F21" fontWeight="700">{centerItem.value} visits</text>
                </>
              ) : (
                <>
                  <text x={cx} y={cy - 6} textAnchor="middle" fontSize="24" fontWeight="700" fill="#1a2340">{total}</text>
                  <text x={cx} y={cy + 14} textAnchor="middle" fontSize="11" fill="#9aa3b8" fontWeight="500">Total</text>
                </>
              )}
            </svg>
          </div>

          <div className="pie-chart-legend">
            {activeData.map((item, index) => {
              const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
              const isActive = hoveredSlice === index || hoveredLegend === index;
              const rankEmoji = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : null;
              return (
                <div
                  key={index}
                  className={`pie-legend-item${isActive ? ' pie-legend-active' : ''}`}
                  onMouseEnter={() => setHoveredLegend(index)}
                  onMouseLeave={() => setHoveredLegend(null)}
                  style={{ cursor: 'pointer', transition: 'opacity 0.2s', opacity: (hoveredSlice !== null || hoveredLegend !== null) && !isActive ? 0.45 : 1 }}
                >
                  <div className="pie-legend-color" style={{ backgroundColor: item.color, flexShrink: 0 }}></div>
                  {rankEmoji && <span className="pie-rank-badge">{rankEmoji}</span>}
                  <span style={{ flex: 1, fontSize: '13px' }}>{item.name}{isBeat ? ` (${item.value})` : ''}</span>
                  <span className="pie-legend-pct" style={{ backgroundColor: item.color + '22', color: item.color }}>{pct}%</span>
                </div>
              );
            })}
            {!isBeat && (
              <div className="pie-legend-item">
                <div className="pie-legend-color" style={{ backgroundColor: '#E8E8E8' }}></div>
                <span style={{ flex: 1, fontSize: '13px' }}>5+ See More</span>
              </div>
            )}
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
            <button className="myaction-btn" onClick={handleMyActionsClick}>
              <img src={BellIcon} alt="Actions" className="btn-icon-white" />
              My Actions
            </button>
            <button className="mycollection-btn" onClick={handleMyCollectionsClick}>
              <img src={CoinIcon} alt="Collections" className="btn-icon-white" />
              My Collections
            </button>
            <button className="mycustomer-btn" onClick={handleMyCustomersClick}>
              <img src={ProfileIcon} alt="Customers" className="btn-icon-white" />
              My Customers
            </button>
          </div>
        </div>

        {/* Widgets Row */}
        <div className="widgets-row">
          {renderWidget('Sales', widgetData.sales, 'sales')}
          {renderWidget('Receipt', widgetData.receipt, 'receipt')}
          {renderBeatWidget('Beat', beatWidgetData)}
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

        {/* Charts Row — line + pie side by side, click/hover to expand */}
        <div className="charts-row">
          {/* Line Chart Panel */}
          <div
            className={`chart-panel ${
              expandedChart === 'line' ? 'chart-panel--expanded' :
              expandedChart === 'pie'  ? 'chart-panel--shrunk'   : ''
            }`}
            onClick={() => setExpandedChart(prev => prev === 'line' ? null : 'line')}
            onMouseEnter={() => !expandedChart && setExpandedChart('line')}
            onMouseLeave={() => setExpandedChart(prev => prev === 'line' ? null : prev)}
          >
            <div className="chart-panel-badge">
              {expandedChart === 'line' ? '↙ Click to restore' : '↗ Click to expand'}
            </div>
            {renderMainChart()}
          </div>

          {/* Pie Chart Panel */}
          <div
            className={`chart-panel ${
              expandedChart === 'pie'  ? 'chart-panel--expanded' :
              expandedChart === 'line' ? 'chart-panel--shrunk'   : ''
            }`}
            onClick={() => setExpandedChart(prev => prev === 'pie' ? null : 'pie')}
            onMouseEnter={() => !expandedChart && setExpandedChart('pie')}
            onMouseLeave={() => setExpandedChart(prev => prev === 'pie' ? null : prev)}
          >
            <div className="chart-panel-badge">
              {expandedChart === 'pie' ? '↙ Click to restore' : '↗ Click to expand'}
            </div>
            {renderPieChart()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home_Page;