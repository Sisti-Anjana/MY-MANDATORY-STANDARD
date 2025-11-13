import React, { useMemo, useState } from 'react';

const ViewModes = [
  {
    id: 'all',
    label: 'All Logs',
    subtitle: 'Every entry logged by the user'
  },
  {
    id: 'issuesOnly',
    label: 'Issue Present',
    subtitle: 'Only logs where an issue was found'
  },
  {
    id: 'noIssue',
    label: 'No Issue',
    subtitle: 'Monitorings that reported no issue'
  }
];

const getCellToneClass = (count, max) => {
  if (!count || max === 0) {
    return 'bg-gray-50 border border-gray-100 text-gray-400';
  }

  const ratio = count / max;

  if (ratio >= 0.8) {
    return 'bg-green-600 text-white';
  }
  if (ratio >= 0.6) {
    return 'bg-green-500 text-white';
  }
  if (ratio >= 0.4) {
    return 'bg-green-400 text-white';
  }
  if (ratio >= 0.2) {
    return 'bg-green-200 text-green-900';
  }
  return 'bg-green-100 text-green-800';
};

const buildDate = (value, isEnd = false) => {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  if (isEnd) {
    date.setHours(23, 59, 59, 999);
  } else {
    date.setHours(0, 0, 0, 0);
  }

  return date;
};

const PortfolioMonitoringMatrix = ({ issues = [], portfolios = [], monitoredPersonnel = [] }) => {
  const [viewMode, setViewMode] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const portfolioNames = useMemo(() => {
    const names = portfolios?.map((p) => p.name) ?? [];
    const unique = Array.from(new Set(names)).sort((a, b) => a.localeCompare(b));
    if (!searchTerm) return unique;
    return unique.filter((name) => name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [portfolios, searchTerm]);

  const filteredIssues = useMemo(() => {
    if (!issues || issues.length === 0) return [];

    const start = buildDate(startDate);
    const end = buildDate(endDate, true);

    return issues.filter((issue) => {
      if (!issue.portfolio_name || !issue.monitored_by) return false;

      const createdAt = new Date(issue.created_at);

      if (start && createdAt < start) return false;
      if (end && createdAt > end) return false;

      if (viewMode === 'issuesOnly') {
        return (issue.issue_present || '').toLowerCase() === 'yes';
      }

      if (viewMode === 'noIssue') {
        return (issue.issue_present || '').toLowerCase() === 'no';
      }

      return true;
    });
  }, [issues, startDate, endDate, viewMode]);

  const matrix = useMemo(() => {
    if (portfolioNames.length === 0 || monitoredPersonnel.length === 0) {
      return { rows: [], maxCell: 0, totalsByUser: {}, grandTotal: 0, totalsByPortfolio: {} };
    }

    const totalsByUser = Object.fromEntries(monitoredPersonnel.map((name) => [name, 0]));
    const totalsByPortfolio = {};
    let grandTotal = 0;
    let maxCell = 0;

    const rows = portfolioNames.map((portfolioName) => {
      const row = { portfolioName, values: {} };
      let rowTotal = 0;

      monitoredPersonnel.forEach((user) => {
        const count = filteredIssues.filter(
          (issue) =>
            issue.portfolio_name === portfolioName &&
            (issue.monitored_by || '').toLowerCase() === user.toLowerCase()
        ).length;

        row.values[user] = count;
        rowTotal += count;

        totalsByUser[user] = (totalsByUser[user] || 0) + count;
        if (!totalsByPortfolio[portfolioName]) totalsByPortfolio[portfolioName] = 0;
        totalsByPortfolio[portfolioName] += count;
        grandTotal += count;
        if (count > maxCell) maxCell = count;
      });

      row.total = rowTotal;
      return row;
    });

    return { rows, maxCell, totalsByUser, grandTotal, totalsByPortfolio };
  }, [filteredIssues, monitoredPersonnel, portfolioNames]);

  const exportToCSV = () => {
    if (!matrix.rows.length) return;

    const header = ['Portfolio', ...monitoredPersonnel, 'Total'];
    const rows = matrix.rows.map((row) => [
      row.portfolioName,
      ...monitoredPersonnel.map((user) => row.values[user] || 0),
      row.total
    ]);

    rows.push([
      'Total',
      ...monitoredPersonnel.map((user) => matrix.totalsByUser[user] || 0),
      matrix.grandTotal
    ]);

    const csvContent = [header, ...rows]
      .map((row) => row.map((value) => `"${value}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `portfolio_user_matrix_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg shadow p-5 bg-gradient-to-r from-[#76AB3F] to-[#5a8f2f] text-white">
        <h2 className="text-2xl font-bold">Portfolio Coverage Matrix</h2>
        <p className="text-sm text-green-50 mt-1">
          Track how often each monitoring user touches every portfolio. Use the filters to focus on the
          activity you care about.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 border border-gray-200 space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                Search Portfolio
              </label>
              <div className="relative">
                <svg
                  className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Start typing a portfolio name..."
                  className="w-full pl-9 pr-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
                setSearchTerm('');
                setViewMode('all');
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              Reset Filters
            </button>
            <button
              onClick={exportToCSV}
              className="px-4 py-2 text-sm font-medium text-white rounded-lg shadow transition-colors"
              style={{ backgroundColor: '#76AB3F' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#5a8f2f')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#76AB3F')}
            >
              Export Matrix
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {ViewModes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id)}
              className={`px-4 py-2 rounded-lg border text-sm font-semibold transition-all ${
                viewMode === mode.id
                  ? 'border-green-600 bg-green-100 text-green-700 shadow-sm'
                  : 'border-gray-200 text-gray-600 hover:border-green-500 hover:text-green-600'
              }`}
            >
              <div>{mode.label}</div>
              <div className="text-xs font-normal text-gray-400">{mode.subtitle}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50 flex flex-wrap items-center gap-4 justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Coverage Overview</h3>
            <p className="text-xs text-gray-500">
              {matrix.grandTotal} log(s) across {matrix.rows.length} portfolio(s) • {monitoredPersonnel.length} users
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-green-600"></span>
              High coverage
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-green-200"></span>
              Medium coverage
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-gray-100 border border-gray-200"></span>
              No logs
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-[#76AB3F] text-white text-xs uppercase tracking-wide">
                <th className="sticky left-0 z-20 px-4 py-3 text-left bg-[#76AB3F]">Portfolio / Monitored By</th>
                {monitoredPersonnel.map((user) => (
                  <th key={user} className="px-4 py-3 text-center whitespace-nowrap border-l border-green-200">
                    {user}
                  </th>
                ))}
                <th className="px-4 py-3 text-center whitespace-nowrap border-l border-green-200">Row Total</th>
              </tr>
            </thead>
            <tbody>
              {matrix.rows.length === 0 ? (
                <tr>
                  <td colSpan={monitoredPersonnel.length + 2} className="px-6 py-12 text-center text-gray-500">
                    No data available for the selected filters. Try adjusting the date range or reset filters.
                  </td>
                </tr>
              ) : (
                matrix.rows.map((row) => (
                  <tr key={row.portfolioName} className="hover:bg-green-50 transition-colors">
                    <th
                      className="sticky left-0 z-10 bg-white px-4 py-3 text-left font-semibold text-gray-900 border-b border-gray-100"
                      scope="row"
                    >
                      <div>{row.portfolioName}</div>
                      <div className="text-xs text-gray-400 font-normal">
                        {row.total} log{row.total === 1 ? '' : 's'}
                      </div>
                    </th>
                    {monitoredPersonnel.map((user) => {
                      const count = row.values[user] || 0;
                      const tone = getCellToneClass(count, matrix.maxCell);
                      return (
                        <td
                          key={`${row.portfolioName}-${user}`}
                          className={`px-3 py-2 text-center align-middle font-semibold transition-colors ${tone} border border-white`}
                          title={`${user} logged ${count} time${count === 1 ? '' : 's'} for ${row.portfolioName}`}
                        >
                          {count || 0}
                        </td>
                      );
                    })}
                    <td className="px-4 py-3 text-center font-semibold text-gray-800 bg-gray-50 border-l border-gray-200">
                      {row.total}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {matrix.rows.length > 0 && (
              <tfoot>
                <tr className="bg-gray-100 font-semibold">
                  <td className="sticky left-0 z-10 px-4 py-3 text-left text-gray-900 uppercase tracking-wide border-t border-gray-200">
                    Column Totals
                  </td>
                  {monitoredPersonnel.map((user) => (
                    <td key={user} className="px-4 py-3 text-center text-gray-800 border-t border-gray-200">
                      {matrix.totalsByUser[user] || 0}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-center text-gray-900 border-t border-gray-200">
                    {matrix.grandTotal}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};

export default PortfolioMonitoringMatrix;

