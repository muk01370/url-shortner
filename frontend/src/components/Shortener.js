import React, { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import Dashboard from './Dashboard';

function Shortener({ token, setToken }) {
    const [url, setUrl] = useState('');
    const [shortenedUrls, setShortenedUrls] = useState([]);
    const [view, setView] = useState('shortener');

    useEffect(() => {
        if (view === 'shortener') {
            fetchUrls();
        }
    }, [view]);

    const fetchUrls = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/urls', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            console.log('Fetched URLs:', data);
            setShortenedUrls(data);
        } catch (error) {
            console.error('Fetch error:', error);
        }
    };

    const handleShorten = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/urls/shorten', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ originalUrl: url })
            });
            const data = await response.json();
            if (response.ok) {
                console.log('Shortened URL data:', data);
                setShortenedUrls([data, ...shortenedUrls]);
                setUrl('');
            } else {
                alert(data.error);
            }
        } catch (error) {
            console.error('Shorten error:', error);
        }
    };

    const handleDelete = async (shortId) => {
        // Optimistically update UI
        console.log('Attempting to delete URL with shortId:', shortId);
        const previousUrls = shortenedUrls;
        setShortenedUrls(shortenedUrls.filter(url => url.shortId !== shortId));

        try {
            const response = await fetch(`http://localhost:5000/api/urls/${shortId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Failed to delete URL');
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('Failed to delete URL');
            setShortenedUrls(previousUrls); // Revert on error
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
    };

    return (
        <div className="shortener">
            <div className="view-toggle">
                <button
                    onClick={() => setView('shortener')}
                    className={view === 'shortener' ? 'active' : ''}
                >
                    Shortener
                </button>
                <button
                    onClick={() => setView('dashboard')}
                    className={view === 'dashboard' ? 'active' : ''}
                >
                    Dashboard
                </button>
                <button onClick={logout} className="logout-btn">Logout</button>
            </div>
            {view === 'shortener' ? (
                <>
                    <form onSubmit={handleShorten}>
                        <input
                            type="text"
                            placeholder="Enter URL to shorten"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                        />
                        <button type="submit">Shorten</button>
                    </form>
                    <div className="url-list">
                        <h2>Your Shortened URLs</h2>
                        {shortenedUrls.length === 0 ? (
                            <p className="empty">No URLs shortened yet</p>
                        ) : (
                            shortenedUrls.map(url => {
                                console.log('Rendering URL:', url);
                                return (
                                    <div key={url.shortId} className="url-item">
                                        <div className="url-actions">
                                        <a href={url.shortUrl} target="_blank" rel="noopener noreferrer">
                                        {url.shortUrl || 'Invalid URL'}
                                        </a>
                                        <button
                                            className="delete-btn"
                                            onClick={() => handleDelete(url.shortId)}
                                        >
                                            Delete
                                        </button>
                                        </div>
                                        <div className="url-info">
                                            <p>Original URL: {url.originalUrl}</p>
                                        <div className="qr-code">
                                            {(() => {
                                                return (
                                                    <QRCodeCanvas
                                                        value={url.originalUrl}
                                                        size={100}
                                                        bgColor="#ffffff"
                                                        fgColor="#212529"
                                                        level="H"
                                                    />
                                                );
                                            })()}
                                        </div>
                                            </div>
                                        
                                    </div>
                                );
                            })
                        )}
                    </div>
                </>
            ) : (
                <Dashboard token={token} />
            )}
        </div>
    );
}

export default Shortener;