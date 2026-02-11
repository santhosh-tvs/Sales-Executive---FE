import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import '../../../styles/DashBoard/SalesDailyGraph.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const SalesDailyGraph = () => {
  const data = {
    labels: ['10', '20', '30', '40', '50', '60', '70', '80', '90', '100', '110', '120'],
    datasets: [
      {
        label: 'Sales',
        data: [1000, 850, 1100, 1200, 1100, 1000, 1500, 1550, 1700, 1900, 2200, 2200],
        borderColor: '#ff6b35',
        backgroundColor: '#ff6b35',
        borderWidth: 3,
        fill: false,
        tension: 0.4,
        pointBackgroundColor: '#ff6b35',
        pointBorderColor: '#ff6b35',
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#333',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#ff6b35',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: {
          display: true,
          color: '#e0e0e0',
          drawBorder: false,
        },
        ticks: {
          color: '#666',
          font: {
            size: 12,
          },
        },
        border: {
          display: false,
        },
      },
      y: {
        min: 0,
        max: 2500,
        ticks: {
          stepSize: 500,
          color: '#666',
          font: {
            size: 12,
          },
          callback: function(value) {
            return value;
          },
        },
        grid: {
          display: true,
          color: '#e0e0e0',
          drawBorder: false,
        },
        border: {
          display: false,
        },
      },
    },
    elements: {
      point: {
        hoverBackgroundColor: '#ff6b35',
        hoverBorderColor: '#fff',
        hoverBorderWidth: 2,
      },
    },
  };

  return (
    <div className="sales-daily-graph-container">
      <div className="graph-header">
        <h3 className="graph-title">Sales Daily Graph</h3>
      </div>
      <div className="chart-container">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default SalesDailyGraph;
