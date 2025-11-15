import React, { useState, useEffect } from 'react';
import './App.css';
import LogTable from './components/LogTable';

function App() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Fetch logs from backend
  const fetchLogs = async () => {
    try {
      const response = await fetch('http://localhost:5000/logs');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setLogs(data.logs || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching logs:', err);
      setError(err.message);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/stats');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  // Initial data load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchLogs(), fetchStats()]);
      setLoading(false);
      setLastUpdate(new Date());
    };
    
    loadData();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchLogs();
      fetchStats();
      setLastUpdate(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Manual refresh
  const handleRefresh = async () => {
    setLoading(true);
    await Promise.all([fetchLogs(), fetchStats()]);
    setLoading(false);
    setLastUpdate(new Date());
  };

  if (loading && logs.length === 0) {
    return (
      <div className="App">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading privacy decisions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <div className="title-section">
            <h1>🛡️ Personal Data Guardian</h1>
            <p>Blockchain-based Privacy Decision Dashboard</p>
          </div>
          <div className="header-stats">
            <div className="stat">
              <span className="stat-value">{stats.total_decisions || 0}</span>
              <span className="stat-label">Total Decisions</span>
            </div>
            <div className="stat">
              <span className="stat-value">{stats.approved || 0}</span>
              <span className="stat-label">Approved</span>
            </div>
            <div className="stat">
              <span className="stat-value">{stats.rejected || 0}</span>
              <span className="stat-label">Rejected</span>
            </div>
            <div className="stat">
              <span className="stat-value">{stats.unique_users || 0}</span>
              <span className="stat-label">Users</span>
            </div>
          </div>
        </div>
      </header>

      <main className="App-main">
        <div className="controls">
          <div className="control-group">
            <button 
              onClick={handleRefresh} 
              disabled={loading}
              className="refresh-btn"
            >
              🔄 {loading ? 'Refreshing...' : 'Refresh'}
            </button>
            <div className="last-update">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </div>
          </div>
          
          <div className="blockchain-status">
            <div className={`status-indicator ${stats.blockchain_enabled ? 'enabled' : 'disabled'}`}>
              {stats.blockchain_enabled ? '🔗 Blockchain Connected' : '📁 Local Storage Only'}
            </div>
          </div>
        </div>

        {error && (
          <div className="error-banner">
            <strong>Connection Error:</strong> {error}
            <br />
            <small>Make sure the backend server is running on http://localhost:5000</small>
          </div>
        )}

        <div className="dashboard-content">
          {logs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🤷‍♂️</div>
              <h3>No Privacy Decisions Yet</h3>
              <p>
                Load the Chrome extension and visit a page with sensitive content to see decisions here.
              </p>
              <div className="empty-instructions">
                <strong>To test:</strong>
                <ol>
                  <li>Install the Chrome extension</li>
                  <li>Open <code>demo_pages/sensitive_demo.html</code></li>
                  <li>Click Approve or Reject on the banner</li>
                  <li>Return here to see the logged decision</li>
                </ol>
              </div>
            </div>
          ) : (
            <LogTable logs={logs} />
          )}
        </div>
      </main>

      <footer className="App-footer">
        <p>
          Personal Data Guardian &copy; 2024 | 
          <a href="http://localhost:5000/health" target="_blank" rel="noopener noreferrer"> API Status</a> | 
          Built for privacy transparency
        </p>
      </footer>
    </div>
  );
}

export default App;