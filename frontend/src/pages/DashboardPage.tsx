import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../assets/css/dashboard.css';

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    if (token) {
      fetchStats();
    }
  }, [token]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/stats/summary', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1 className="dashboard-title">Dashboard Overview</h1>
        <button 
          onClick={fetchStats} 
          className="refresh-button"
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </header>

      {error && (
        <div className="error-alert">
          <svg className="error-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {loading && !stats ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading dashboard data...</p>
        </div>
      ) : stats ? (
        <div className="dashboard-content">
          {/* Summary Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12 1.586l-4 4v12.828l4-4V1.586zM3.707 3.293A1 1 0 002 4v10a1 1 0 00.293.707L6 18.414V5.586L3.707 3.293zM17.707 5.293L14 1.586v12.828l2.293 2.293A1 1 0 0018 16V6a1 1 0 00-.293-.707z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="stat-content">
                <h3 className="stat-title">Total URLs</h3>
                <p className="stat-value">{stats.totalUrls.toLocaleString()}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="stat-content">
                <h3 className="stat-title">Total Visits</h3>
                <p className="stat-value">{stats.totalVisits.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Recent URLs Section */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2 className="section-title">Recent URLs</h2>
              <span className="section-badge">{stats.recentUrls.length}</span>
            </div>
            <div className="url-list">
              {stats.recentUrls.map((url: any) => (
                <div key={url._id} className="url-item">
                  <div className="url-content">
                    <a 
                      href={url.originalUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="url-link"
                    >
                      {url.originalUrl}
                    </a>
                    <div className="url-meta">
                      <span className="url-visits">
                        <svg className="meta-icon" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                        {url.visits.toLocaleString()} visits
                      </span>
                      <span className="url-date">
                        {new Date(url.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Performing URLs Section */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2 className="section-title">Top Performing URLs</h2>
              <span className="section-badge">{stats.topUrls.length}</span>
            </div>
            <div className="url-list">
              {stats.topUrls.map((url: any, index: number) => (
                <div key={url._id} className="url-item">
                  <div className="url-rank">{index + 1}</div>
                  <div className="url-content">
                    <a 
                      href={url.originalUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="url-link"
                    >
                      {url.originalUrl}
                    </a>
                    <div className="url-meta">
                      <span className="url-visits">
                        <svg className="meta-icon" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                        {url.visits.toLocaleString()} visits
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <svg className="empty-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
          </svg>
          <h3>No Data Available</h3>
          <p>We couldn't find any statistics to display</p>
          <button onClick={fetchStats} className="retry-button">
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;