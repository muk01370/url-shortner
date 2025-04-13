import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function Dashboard({ token }) {
    const [stats, setStats] = useState([]);
    const [urls, setUrls] = useState([]);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/urls/stats', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setStats(data.stats);
            setUrls(data.urls);
        } catch (error) {
            console.error('Stats fetch error:', error);
        }
    };

    return (
        <div className="dashboard">
            <div className="card">
                <h2>Usage Statistics</h2>
                <div className="stats-summary">
                    <h3>Summary</h3>
                    {urls.length === 0 ? (
                        <p className="empty">No URLs available</p>
                    ) : (
                        <ul>
                            {urls.map(url => (
                                <li key={url.shortId} className="url-item">
                                    <a href={url.originalUrl} target="_blank">{url.shortId}</a>
                                    <p>Clicks: {url.clicks}</p>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className="stats-chart">
                    <h3>Clicks Over Time</h3>
                    {stats.length === 0 ? (
                        <p className="empty">No click data available</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={stats} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--neutral-300)" />
                                <XAxis dataKey="date" stroke="var(--neutral-600)" />
                                <YAxis stroke="var(--neutral-600)" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--neutral-50)',
                                        borderRadius: 'var(--radius-sm)',
                                        border: '1px solid var(--neutral-300)'
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="clicks"
                                    stroke="var(--primary)"
                                    strokeWidth={2}
                                    dot={{ fill: 'var(--primary)', r: 4 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;