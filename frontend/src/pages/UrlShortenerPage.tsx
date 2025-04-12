import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../assets/css/urlShortener.css';

const UrlShortenerPage: React.FC = () => {
  const [originalUrl, setOriginalUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [urls, setUrls] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    if (token) {
      fetchUrls();
    }
  }, [token]);

  const fetchUrls = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/url/user/urls', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setUrls(response.data);
    } catch (err) {
      console.error('Error fetching URLs:', err);
      setError('Failed to load your URLs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post('/api/url/shorten', { originalUrl }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setShortUrl(`${window.location.origin}/${response.data.shortCode}`);
      fetchUrls();
      setOriginalUrl('');
    } catch (err) {
      console.error('Error shortening URL:', err);
      setError('Failed to shorten URL. Please check the URL and try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id?: string) => {
    navigator.clipboard.writeText(text);
    if (id) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div className="url-shortener-container">
      <header className="url-header">
        <h1 className="url-title">URL Shortener</h1>
        <p className="url-subtitle">Create short, memorable links and track their performance</p>
      </header>

      {error && (
        <div className="error-alert">
          <svg className="error-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="shorten-form">
        <div className="input-group">
          <input
            type="url"
            value={originalUrl}
            onChange={(e) => setOriginalUrl(e.target.value)}
            placeholder="Paste your long URL here..."
            className="url-input"
            required
          />
          <button
            type="submit"
            disabled={loading || !originalUrl}
            className="shorten-button"
          >
            {loading ? (
              <>
                <svg className="button-spinner" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                </svg>
                Shortening...
              </>
            ) : (
              'Shorten URL'
            )}
          </button>
        </div>
      </form>

      {shortUrl && (
        <div className="result-card">
          <h3 className="result-title">Your Short URL</h3>
          <div className="result-content">
            <a 
              href={shortUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="short-url"
            >
              {shortUrl}
            </a>
            <button
              onClick={() => copyToClipboard(shortUrl)}
              className="copy-button"
            >
              <svg className="copy-icon" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
              </svg>
              Copy
            </button>
          </div>
        </div>
      )}

      <div className="url-list-section">
        <div className="section-header">
          <h2 className="section-title">Your URLs</h2>
          <button 
            onClick={fetchUrls} 
            disabled={loading}
            className="refresh-button"
          >
            <svg className="refresh-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Refresh
          </button>
        </div>

        {loading && urls.length === 0 ? (
          <div className="loading-state">
            <svg className="loading-spinner" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            </svg>
            <p>Loading your URLs...</p>
          </div>
        ) : urls.length === 0 ? (
          <div className="empty-state">
            <svg className="empty-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
            </svg>
            <h3>No URLs Found</h3>
            <p>Create your first shortened URL above</p>
          </div>
        ) : (
          <div className="url-list">
            {urls.map((url) => (
              <div key={url._id} className="url-card">
                <div className="url-info">
                  <div className="url-original">
                    <a 
                      href={url.originalUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="original-link"
                    >
                      {url.originalUrl}
                    </a>
                  </div>
                  <div className="url-meta">
                    <a 
                      href={`${window.location.origin}/${url.shortCode}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="short-link"
                    >
                      {window.location.origin}/{url.shortCode}
                    </a>
                    <div className="url-stats">
                      <span className="stat-item">
                        <svg className="stat-icon" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                        {url.visits} visits
                      </span>
                      <span className="stat-item">
                        <svg className="stat-icon" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        {new Date(url.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(`${window.location.origin}/${url.shortCode}`, url._id)}
                  className={`copy-button ${copiedId === url._id ? 'copied' : ''}`}
                >
                  {copiedId === url._id ? 'Copied!' : 'Copy'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UrlShortenerPage;