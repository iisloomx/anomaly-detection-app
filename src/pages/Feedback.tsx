import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface FeedbackStats {
  totalFeedback: number;
  categoryBreakdown: Record<string, number>;
  averageRating: number;
}

export default function Feedback() {
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    category: 'general',
    rating: 5,
    comment: '',
  });
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8000/api/v1/feedback/stats');
        setStats(response.data);
      } catch (err) {
        setError('Failed to fetch feedback statistics');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus('submitting');

    try {
      await axios.post('http://localhost:8000/api/v1/feedback/submit', formData);
      setSubmitStatus('success');
      setFormData({ category: 'general', rating: 5, comment: '' });
      
      // Refresh stats
      const response = await axios.get('http://localhost:8000/api/v1/feedback/stats');
      setStats(response.data);
    } catch (err) {
      setSubmitStatus('error');
      console.error('Failed to submit feedback:', err);
    }
  };

  const chartData = stats ? {
    labels: Object.keys(stats.categoryBreakdown),
    datasets: [
      {
        label: 'Feedback by Category',
        data: Object.values(stats.categoryBreakdown),
        backgroundColor: 'rgba(14, 165, 233, 0.5)',
        borderColor: 'rgb(14, 165, 233)',
        borderWidth: 1,
      },
    ],
  } : null;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Feedback</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <h2 className="text-xl font-semibold mb-6">Submit Feedback</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="input-field"
              >
                <option value="general">General</option>
                <option value="ui">User Interface</option>
                <option value="performance">Performance</option>
                <option value="feature">Feature Request</option>
                <option value="bug">Bug Report</option>
              </select>
            </div>

            <div>
              <label htmlFor="rating" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Rating
              </label>
              <input
                type="range"
                id="rating"
                min="1"
                max="5"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
              </div>
            </div>

            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Comment
              </label>
              <textarea
                id="comment"
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                rows={4}
                className="input-field"
                placeholder="Share your thoughts..."
              />
            </div>

            <button
              type="submit"
              disabled={submitStatus === 'submitting'}
              className="btn-primary w-full"
            >
              {submitStatus === 'submitting' ? 'Submitting...' : 'Submit Feedback'}
            </button>

            {submitStatus === 'success' && (
              <p className="text-green-600 text-sm mt-2">Feedback submitted successfully!</p>
            )}
            {submitStatus === 'error' && (
              <p className="text-red-600 text-sm mt-2">Failed to submit feedback. Please try again.</p>
            )}
          </form>
        </div>

        <div className="space-y-8">
          {loading ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : error ? (
            <div className="text-red-600 text-center py-8">
              {error}
            </div>
          ) : stats ? (
            <>
              <div className="card">
                <h2 className="text-xl font-semibold mb-4">Statistics</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Feedback</p>
                    <p className="text-2xl font-semibold">{stats.totalFeedback}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Average Rating</p>
                    <p className="text-2xl font-semibold">{stats.averageRating.toFixed(1)}</p>
                  </div>
                </div>
              </div>

              {chartData && (
                <div className="card">
                  <h2 className="text-xl font-semibold mb-4">Category Breakdown</h2>
                  <div className="h-64">
                    <Bar
                      data={chartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: false,
                          },
                        },
                      }}
                    />
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
