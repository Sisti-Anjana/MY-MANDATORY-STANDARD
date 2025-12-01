import React, { useMemo, useState, useEffect } from 'react';

const formatDate = (date) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return '';
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getQuickRange = (key) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  switch (key) {
    case 'yesterday': {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return {
        start: formatDate(yesterday),
        end: formatDate(yesterday)
      };
    }
    case 'week': {
      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() - 6);
      return {
        start: formatDate(weekStart),
        end: formatDate(today)
      };
    }
    case 'month': {
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      return {
        start: formatDate(monthStart),
        end: formatDate(today)
      };
    }
    case 'today':
    default:
      return {
        start: formatDate(today),
        end: formatDate(today)
      };
  }
};

const IssueDetailsView = ({
  issues = [],
  portfolios = [],
  onEditIssue,
  onDeleteIssue,
  isAdmin = false,
  initialPortfolioId = '',
  initialHour = null,
}) => {
  const [selectedPortfolio, setSelectedPortfolio] = useState(initialPortfolioId || '');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedHour, setSelectedHour] = useState(
    initialHour !== null && initialHour !== undefined
      ? String(initialHour)
      : ''
  );
  const [activeRange, setActiveRange] = useState('today');
  const [searchQuery, setSearchQuery] = useState('');
  const clearSearch = () => {
    setSearchQuery('');
  };

  useEffect(() => {
    const { start, end } = getQuickRange('today');
    setStartDate(start);
    setEndDate(end);
    if (initialHour !== null && initialHour !== undefined) {
      setSelectedHour(String(initialHour));
    } else {
      setSelectedHour(String(new Date().getHours()));
    }
  }, [initialHour]);

  const handleQuickRange = (rangeKey) => {
    const { start, end } = getQuickRange(rangeKey);
    setActiveRange(rangeKey);
    setStartDate(start);
    setEndDate(end);
  };

  const handleCustomDateChange = (setter) => (event) => {
    setActiveRange('custom');
    setter(event.target.value);
  };

  const filteredIssues = useMemo(() => {
    if (!startDate || !endDate) return [];

    // Resolve selected portfolio name for extra safety (in case ids mismatch)
    const selectedPortfolioName =
      portfolios.find(
        (p) =>
          (p.portfolio_id || p.id) &&
          String(p.portfolio_id || p.id) === String(selectedPortfolio)
      )?.name || null;

    const searchLower = searchQuery.toLowerCase();

    return issues.filter(issue => {
      // Apply search filter if search query exists
      if (searchQuery) {
        const searchIn = [
          issue.portfolio_name || '',
          issue.issue_details || '',
          issue.case_number || '',
          issue.monitored_by || '',
          issue.issues_missed_by || '',
          issue.issue_hour?.toString() || ''
        ].join(' ').toLowerCase();
        
        if (!searchIn.includes(searchLower)) {
          return false;
        }
      }
      if (selectedPortfolio) {
        const matchesPortfolio =
          String(issue.portfolio_id) === String(selectedPortfolio) ||
          String(issue.portfolios?.portfolio_id) === String(selectedPortfolio) ||
          String(issue.portfolio?.portfolio_id) === String(selectedPortfolio) ||
          (selectedPortfolioName &&
            (issue.portfolio_name === selectedPortfolioName));

        if (!matchesPortfolio) {
          return false;
        }
      }

      if (selectedHour !== '') {
        if (issue.issue_hour !== parseInt(selectedHour, 10)) {
          return false;
        }
      }

      if (!issue.created_at) return false;
      const createdDate = new Date(issue.created_at);
      if (Number.isNaN(createdDate.getTime())) return false;
      const issueDateString = formatDate(createdDate);

      return issueDateString >= startDate && issueDateString <= endDate;
    });
  }, [issues, selectedPortfolio, startDate, endDate, selectedHour, searchQuery]);

  const sortedIssues = useMemo(() => {
    return [...filteredIssues].sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateB - dateA;
    });
  }, [filteredIssues]);

  const quickRanges = [
    { key: 'today', label: 'Today' },
    { key: 'yesterday', label: 'Yesterday' },
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' }
  ];

  const renderEmptyState = () => (
    <div className="text-center py-10 border border-dashed border-gray-300 rounded-lg bg-gray-50">
      <div className="text-lg font-semibold text-gray-700 mb-2">No issues found</div>
      <p className="text-sm text-gray-500">
        Try selecting a different portfolio or adjusting the date range.
      </p>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <div className="flex flex-col gap-6">
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Search issues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              type="button"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Portfolio
            </label>
            <select
              value={selectedPortfolio}
              onChange={(e) => setSelectedPortfolio(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">All Portfolios</option>
              {portfolios.map((portfolio) => (
                <option
                  key={portfolio.portfolio_id || portfolio.id}
                  value={portfolio.portfolio_id || portfolio.id}
                >
                  {portfolio.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Hour Filter
            </label>
            <select
              value={selectedHour}
              onChange={(e) => setSelectedHour(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">All Hours</option>
              {Array.from({ length: 24 }, (_, i) => i).map(hour => (
                <option key={hour} value={hour}>
                  {hour}:00
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Quick Range
            </label>
            <div className="flex flex-wrap gap-2">
              {quickRanges.map(range => (
                <button
                  key={range.key}
                  type="button"
                  onClick={() => handleQuickRange(range.key)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    activeRange === range.key
                      ? 'bg-green-600 text-white border-green-600'
                      : 'border-gray-300 text-gray-700 hover:border-green-500 hover:text-green-600'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              max={endDate || undefined}
              onChange={handleCustomDateChange(setStartDate)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={handleCustomDateChange(setEndDate)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Issue Results ({sortedIssues.length})
          </h3>
          <span className="text-sm text-gray-500">
            Showing newest first
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Portfolio</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Hour</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Issue</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Details</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Monitored By</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {sortedIssues.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-4 py-6">
                    {renderEmptyState()}
                  </td>
                </tr>
              )}
              {sortedIssues.map(issue => {
                const dateString = issue.created_at
                  ? new Date(issue.created_at).toLocaleString()
                  : 'N/A';
                const issuePresent = (issue.issue_present || '').toLowerCase() === 'yes';

                return (
                  <tr key={issue.issue_id || issue.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{dateString}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{issue.portfolio_name || 'Unknown'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">Hour {issue.issue_hour ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                          issuePresent ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {issuePresent ? 'Issue' : 'Clear'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {issue.issue_details || 'No details provided'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                      {issue.monitored_by || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        {onEditIssue && (
                          <button
                            type="button"
                            onClick={() => onEditIssue(issue)}
                            className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-800"
                          >
                            Edit
                          </button>
                        )}
                        {isAdmin && onDeleteIssue && (
                          <button
                            type="button"
                            onClick={() => onDeleteIssue(issue)}
                            className="px-3 py-1 text-sm font-medium text-red-600 hover:text-red-800"
                            title="Delete this issue (Admin only)"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default IssueDetailsView;

