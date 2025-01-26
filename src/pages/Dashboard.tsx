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
import { ChartSquareBarIcon, ExclamationIcon, ServerIcon, BellIcon } from '@heroicons/react/outline';
import axios from 'axios';
import MetricCard from '../components/dashboard/MetricCard';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

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
  const [metrics, setMetrics] = useState<Metrics>({
    totalLogs: 0,
    totalAnomalies: 0,
    systemHealth: 0,
    activeAlerts: 0,
  });
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData>({
    labels: [],
    anomalies: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [metricsResponse, timeSeriesResponse] = await Promise.all([
          axios.get('http://localhost:8000/api/v1/data/metrics'),
          axios.get('http://localhost:8000/api/v1/data/timeseries'),
        ]);

        setMetrics(metricsResponse.data);
        setTimeSeriesData(timeSeriesResponse.data);
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
          icon={ChartSquareBarIcon}
        />
        <MetricCard
          title="Anomalies Detected"
          value={metrics.totalAnomalies.toLocaleString()}
          icon={ExclamationIcon}
          trend={{ value: 12, isPositive: false }}
        />
        <MetricCard
          title="System Health"
          value={`${metrics.systemHealth}%`}
          icon={ServerIcon}
          trend={{ value: 3, isPositive: true }}
        />
        <MetricCard
          title="Active Alerts"
          value={metrics.activeAlerts}
          icon={BellIcon}
        />
      </div>

      <div className="card">
        <Line options={chartOptions} data={chartData} />
      </div>
    </div>
  );
}
