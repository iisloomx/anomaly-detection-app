import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
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
import { ChartBarSquareIcon, ExclamationTriangleIcon, ServerStackIcon, BellAlertIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import MetricCard from '../components/dashboard/MetricCard.tsx';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Mock data for development
const mockMetrics = {
  totalLogs: 15234,
  totalAnomalies: 127,
  systemHealth: 98,
  activeAlerts: 3,
};

const mockTimeSeriesData = {
  labels: Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toLocaleDateString();
  }),
  anomalies: [12, 19, 15, 23, 17, 25, 14],
};

interface Metrics {
  totalLogs: number;
  totalAnomalies: number;
  systemHealth: number;
  activeAlerts: number;
}

interface TimeSeriesData {
  labels: string[];
  anomalies: number[];
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState<Metrics>(mockMetrics);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData>(mockTimeSeriesData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Use mock data instead of API calls for now
        setMetrics(mockMetrics);
        setTimeSeriesData(mockTimeSeriesData);
      } catch (err) {
        setError('Failed to fetch dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Anomalies Over Time',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const chartData = {
    labels: timeSeriesData.labels,
    datasets: [
      {
        label: 'Anomalies',
        data: timeSeriesData.anomalies,
        borderColor: 'rgb(14, 165, 233)',
        backgroundColor: 'rgba(14, 165, 233, 0.5)',
      },
    ],
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse-slow">Loading dashboard data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Logs"
          value={metrics.totalLogs.toLocaleString()}
          icon={ChartBarSquareIcon}
        />
        <MetricCard
          title="Anomalies Detected"
          value={metrics.totalAnomalies.toLocaleString()}
          icon={ExclamationTriangleIcon}
          trend={{ value: 12, isPositive: false }}
        />
        <MetricCard
          title="System Health"
          value={`${metrics.systemHealth}%`}
          icon={ServerStackIcon}
          trend={{ value: 3, isPositive: true }}
        />
        <MetricCard
          title="Active Alerts"
          value={metrics.activeAlerts}
          icon={BellAlertIcon}
        />
      </div>

      <div className="card">
        <Line options={chartOptions} data={chartData} />
      </div>
    </div>
  );
}
