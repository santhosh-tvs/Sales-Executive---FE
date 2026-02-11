import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import '../../../styles/DashBoard/ReceiptDailyGraph.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ReceiptDailyGraph = () => {
  const data = {
    labels: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
    datasets: [
      {
        label: 'Series 1',
        data: [600, 475, 750, 50, 975, 100, 150, 700, 225, 100],
        backgroundColor: '#3b4cca',
        borderColor: '#3b4cca',
        borderWidth: 0,
        borderRadius: 2,
        barThickness: 30,
      },
      {
        label: 'Series 2',
        data: [500, 425, 740, 100, 600, 450, 950, 350, 825, 700],
        backgroundColor: '#ff6b35',
        borderColor: '#ff6b35',
        borderWidth: 0,
        borderRadius: 2,
        barThickness: 30,
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
        borderColor: '#ccc',
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
        categoryPercentage: 0.9,
        barPercentage: 0.8,
      },
      y: {
        min: 0,
        max: 1000,
        ticks: {
          stepSize: 250,
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
    interaction: {
      mode: 'index',
      intersect: false,
    },
    datasets: {
      bar: {
        categoryPercentage: 0.9,
        barPercentage: 0.8,
      }
    },
  };

  return (
    <div className="receipt-daily-graph-container">
      <div className="graph-header">
        <h3 className="graph-title">Receipt Daily Graph</h3>
      </div>
      <div className="chart-container">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default ReceiptDailyGraph;
