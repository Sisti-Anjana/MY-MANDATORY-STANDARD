import React, { useState, useMemo } from 'react';

const IssuesByUser = ({ issues, portfolios, monitoredPersonnel, onEditIssue }) => {
  const [filters, setFilters] = useState({
    showMissedOnly: false,
    missedBy: '',
    monitoredBy: '',
    startDate: '',
    endDate: ''
  });

  const filteredIssues = useMemo(() => {
    let filtered = [...issues];

    if (filters.showMissedOnly) {
      filtered = filtered.filter(issue => issue.issues_missed_by);
    }

    if (filters.missedBy) {
      filtered = filtered.filter(issue => 
        issue.issues_missed_by && issue.issues_missed_by.toLowerCase().includes(filters.missedBy.toLowerCase())
      );
    }

    if (filters.monitoredBy) {
      filtered = filtered.filter(issue => 
        issue.monitored_by && issue.monitored_by.toLowerCase().includes(filters.monitoredBy.toLowerCase())
      );
    }

    if (filters.startDate) {
      const start = new Date(filters.startDate);
      start.setHours(0, 0, 0, 0);
      filtered = filtered.filter(issue => new Date(issue.created_at) >= start);
    }

    if (filters.endDate) {
      const end = new Date(filters.endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(issue => new Date(issue.created_at) <= end);
    }

    return filtered;
  }, [issues, filters]);

  const stats = useMemo(() => {
    const totalIssues = issues.length;
    const missedIssues = issues.filter(issue => issue.issues_missed_by).length;
    
    return {
      totalIssues,
      missedIssues
    };
  }, [issues]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      showMissedOnly: false,
      missedBy: '',
      monitoredBy: '',
      startDate: '',
      endDate: ''
    });
  };

  const handleExportToCSV = () => {
    // Create CSV header
    const headers = [
      'Date & Time',
      'Portfolio',
      'Site',
      'Issue Present',
      'Missed By',
      'Monitored By',
      'Details',
      'Case Number'
    ];

    // Create CSV rows
    const rows = filteredIssues.map(issue => [
      new Date(issue.created_at).toLocaleString(),
      issue.portfolio_name || '',
      issue.site_name || 'N/A',
      issue.issue_present || '',
      issue.issues_missed_by || 'N/A',
      issue.monitored_by || 'N/A',
      (issue.issue_details || '').replace(/,/g, ';'),
      issue.case_number || ''
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `issues_by_user_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">View All Issues by User</h2>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 rounded-lg p-6">
          <div className="text-sm text-blue-600 mb-1">Total Issues</div>
          <div className="text-4xl font-bold text-blue-600">{stats.totalIssues}</div>
        </div>
        <div className="bg-red-50 rounded-lg p-6">
          <div className="text-sm text-red-600 mb-1">Missed Issues</div>
          <div className="text-4xl font-bold text-red-600">{stats.missedIssues}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Issues</h3>
        
        <div className="space-y-4">
          {/* Show Missed Issues Only Checkbox */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="showMissedOnly"
              checked={filters.showMissedOnly}
              onChange={(e) => handleFilterChange('showMissedOnly', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="showMissedOnly" className="ml-2 text-sm font-medium text-gray-700">
              Show Missed Issues Only
            </label>
          </div>

          {/* Search Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Issues Missed By
              </label>
              <input
                type="text"
                value={filters.missedBy}
                onChange={(e) => handleFilterChange('missedBy', e.target.value)}
                placeholder="Search by missed by..."
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monitored By
              </label>
              <input
                type="text"
                value={filters.monitoredBy}
                onChange={(e) => handleFilterChange('monitoredBy', e.target.value)}
                placeholder="Search by monitored by..."
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Date Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
            >
              Clear Filters
            </button>
            <button
              onClick={handleExportToCSV}
              className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export to CSV
            </button>
          </div>
        </div>
      </div>

      {/* Issues Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Portfolio
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Site
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Issue Present
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Missed By
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Monitored By
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredIssues.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                    No issues found matching the filters
                  </td>
                </tr>
              ) : (
                filteredIssues.map((issue) => (
                  <tr key={issue.issue_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                      {new Date(issue.created_at).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {issue.portfolio_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {issue.site_name || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${
                        issue.issue_present === 'Yes' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {issue.issue_present}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {issue.issues_missed_by ? (
                        <span className="text-orange-600 font-medium">
                          {issue.issues_missed_by}
                        </span>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {issue.monitored_by || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">
                      {issue.issue_details || 'No issue present'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => onEditIssue(issue)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Info */}
        {filteredIssues.length > 0 && (
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-700">
            Showing {filteredIssues.length} of {issues.length} total issues
          </div>
        )}
      </div>
    </div>
  );
};

export default IssuesByUser;
