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
    activeAlerts: 0
  });
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData>({
    labels: [],
    anomalies: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get start and end dates for the last 7 days
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);

        // Fetch metrics and timeseries data
        const [metricsResponse, timeSeriesResponse] = await Promise.all([
          axios.get('http://localhost:8000/api/v1/data/metrics', {
            params: {
              start_time: startDate.toISOString(),
              end_time: endDate.toISOString()
            }
          }),
          axios.get('http://localhost:8000/api/v1/data/timeseries', {
            params: {
              start_time: startDate.toISOString(),
              end_time: endDate.toISOString()
            }
          })
        ]);

        // Format metrics data
        setMetrics({
          totalLogs: metricsResponse.data.total_logs,
          totalAnomalies: metricsResponse.data.total_anomalies,
          systemHealth: metricsResponse.data.system_health,
          activeAlerts: metricsResponse.data.active_alerts
        });

        // Format time series data
        setTimeSeriesData({
          labels: timeSeriesResponse.data.labels.map((date: string) => 
            new Date(date).toLocaleDateString()
          ),
          anomalies: timeSeriesResponse.data.anomalies
        });

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to fetch dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Set up polling every 30 seconds
    const pollInterval = setInterval(fetchData, 30000);

    // Cleanup interval on component unmount
    return () => clearInterval(pollInterval);
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
      tooltip: {
        callbacks: {
          title: (context: any) => {
            return `Date: ${context[0].label}`;
          },
          label: (context: any) => {
            return `Anomalies: ${context.raw}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Anomalies'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Date'
        }
      }
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
        tension: 0.3
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
          value={`${Math.round(metrics.systemHealth)}%`}
          icon={ServerStackIcon}
          trend={{ value: 3, isPositive: true }}
        />
        <MetricCard
          title="Active Alerts"
          value={metrics.activeAlerts}
          icon={BellAlertIcon}
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <Line options={chartOptions} data={chartData} />
      </div>
    </div>
  );
}
