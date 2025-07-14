import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../AuthContext';

function Analytics() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    daily: [],
    weekly: [],
    monthly: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/sessions/stats');
        setStats(res.data);
      } catch (err) {
        // Show user-friendly error (could use a toast or set an error state)
        // Example: setError('Failed to fetch stats. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  const totalFocusTime = stats.daily.reduce((sum, day) => sum + day.focusTime, 0);
  const averageDaily = stats.daily.length > 0 ? totalFocusTime / stats.daily.length : 0;
  const bestDay = stats.daily.reduce((max, day) => day.focusTime > max ? day.focusTime : max, 0);

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-100 shadow-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytics</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4 rounded-lg">
          <p className="text-xs opacity-90">Total Focus Time</p>
          <p className="text-xl font-bold">{Math.round(totalFocusTime / 60)}m</p>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4 rounded-lg">
          <p className="text-xs opacity-90">Daily Average</p>
          <p className="text-xl font-bold">{Math.round(averageDaily / 60)}m</p>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-lg">
          <p className="text-xs opacity-90">Best Day</p>
          <p className="text-xl font-bold">{Math.round(bestDay / 60)}m</p>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-900">Last 7 Days</h4>
        <div className="space-y-2">
          {stats.daily.slice(-7).map((day, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">
                {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
              </span>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                    style={{ width: `${Math.min((day.focusTime / (8 * 60)) * 100, 100)}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{Math.round(day.focusTime / 60)}m</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Analytics; 