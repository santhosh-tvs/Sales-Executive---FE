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
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import '../../../styles/DashBoard/BeatPlanDailyVisitsGraph.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const BeatPlanDailyVisitsGraph = () => {
  const data = {
    labels: ['0', '1', '3', '5', '7', '9', '11', '13', '15', '17', '19', '21', '23', '25', '27', '29', '31'],
    datasets: [
      {
        label: 'Beat Plan Daily Visits',
        data: [20, 25, 30, 35, 32, 28, 22, 18, 45, 52, 48, 42, 40, 38, 35, 32, 58],
        borderColor: '#00bfff',
        backgroundColor: 'rgba(0, 191, 255, 0.2)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#00bfff',
        pointBorderColor: '#00bfff',
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: '#00bfff',
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2,
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
        borderColor: '#00bfff',
        borderWidth: 1,
        mode: 'index',
        intersect: false,
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
          maxTicksLimit: 8,
        },
        border: {
          display: false,
        },
      },
      y: {
        min: 0,
        max: 60,
        ticks: {
          stepSize: 15,
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
    elements: {
      point: {
        hoverBackgroundColor: '#00bfff',
        hoverBorderColor: '#fff',
        hoverBorderWidth: 2,
      },
    },
  };

  return (
    <div className="beat-plan-daily-visits-graph-container">
      <div className="graph-header">
        <h3 className="graph-title">Beat Plan Daily Visits graph</h3>
      </div>
      <div className="chart-container">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default BeatPlanDailyVisitsGraph;
