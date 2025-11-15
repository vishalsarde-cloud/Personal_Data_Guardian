import React, { useState } from 'react';
import './LogTable.css';

function LogTable({ logs }) {
  const [sortField, setSortField] = useState('timestamp');
  const [sortDirection, setSortDirection] = useState('desc');
  const [filterDecision, setFilterDecision] = useState('all');

  // Sort logs
  const sortedLogs = [...logs].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    if (sortField === 'timestamp') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Filter logs
  const filteredLogs = sortedLogs.filter(log => {
    if (filterDecision === 'all') return true;
    return filterDecision === 'approved' ? log.decision : !log.decision;
  });

  // Handle sort
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Format hash for display (show first 8 and last 4 characters)
  const formatHash = (hash) => {
    if (!hash) return 'N/A';
    if (hash.length <= 12) return hash;
    return `${hash.substring(0, 8)}...${hash.substring(hash.length - 4)}`;
  };

  // Format address for display
  const formatAddress = (address) => {
    if (!address) return 'N/A';
    if (address.length <= 12) return address;
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="log-table-container">
      <div className="table-header">
        <h2>Privacy Decision Log</h2>
        <div className="table-filters">
          <select 
            value={filterDecision} 
            onChange={(e) => setFilterDecision(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Decisions ({logs.length})</option>
            <option value="approved">Approved ({logs.filter(l => l.decision).length})</option>
            <option value="rejected">Rejected ({logs.filter(l => !l.decision).length})</option>
          </select>
        </div>
      </div>

      {filteredLogs.length === 0 ? (
        <div className="no-results">
          <p>No decisions match the current filter.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="log-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('id')} className="sortable">
                  ID {sortField === 'id' && <span className="sort-arrow">{sortDirection === 'asc' ? '↑' : '↓'}</span>}
                  }
                </th>
                <th onClick={() => handleSort('user')} className="sortable">
                  User {sortField === 'user' && <span className="sort-arrow">{sortDirection === 'asc' ? '↑' : '↓'}</span>}
                  }
                </th>
                <th onClick={() => handleSort('dataType')} className="sortable">
                  Data Type {sortField === 'dataType' && <span className="sort-arrow">{sortDirection === 'asc' ? '↑' : '↓'}</span>}
                  }
                </th>
                <th onClick={() => handleSort('decision')} className="sortable">
                  Decision {sortField === 'decision' && <span className="sort-arrow">{sortDirection === 'asc' ? '↑' : '↓'}</span>}
                  }
                </th>
                <th>Details Hash</th>
                <th>Transaction Hash</th>
                <th onClick={() => handleSort('timestamp')} className="sortable">
                  Timestamp {sortField === 'timestamp' && <span className="sort-arrow">{sortDirection === 'asc' ? '↑' : '↓'}</span>}
                  }
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td className="id-cell">{log.id}</td>
                  <td className="user-cell">
                    <span title={log.user}>{formatAddress(log.user)}</span>
                  </td>
                  <td className="data-type-cell">
                    <span className="data-type-tag">{log.dataType}</span>
                  </td>
                  <td className="decision-cell">
                    <span className={`decision-badge ${log.decision ? 'approved' : 'rejected'}`}>
                      {log.decision ? '✓ Approved' : '✗ Rejected'}
                    </span>
                  </td>
                  <td className="hash-cell">
                    <span 
                      title={log.detailsHash}
                      className="hash-display"
                    >
                      {formatHash(log.detailsHash)}
                    </span>
                  </td>
                  <td className="hash-cell">
                    {log.txHash ? (
                      <a 
                        href={`http://localhost:8545`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        title={log.txHash}
                        className="tx-link"
                      >
                        {formatHash(log.txHash)}
                      </a>
                    ) : (
                      <span className="no-tx">Local Only</span>
                    )}
                  </td>
                  <td className="timestamp-cell">
                    <div className="timestamp-display">
                      <div>{new Date(log.timestamp).toLocaleDateString()}</div>
                      <div className="time">{new Date(log.timestamp).toLocaleTimeString()}</div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default LogTable;