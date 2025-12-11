import React, { useMemo, useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';

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

const getTodayString = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

const getDateRange = (range) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  switch (range) {
    case 'today':
      return {
        start: getTodayString(),
        end: getTodayString()
      };
    case 'yesterday': {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return {
        start: yesterday.toISOString().split('T')[0],
        end: yesterday.toISOString().split('T')[0]
      };
    }
    case 'week': {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - 6); // Last 7 days including today
      return {
        start: weekStart.toISOString().split('T')[0],
        end: getTodayString()
      };
    }
    case 'month': {
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      return {
        start: monthStart.toISOString().split('T')[0],
        end: getTodayString()
      };
    }
    default:
      return {
        start: getTodayString(),
        end: getTodayString()
      };
  }
};

const PortfolioMonitoringMatrix = ({ issues = [], portfolios = [], monitoredPersonnel = [] }) => {
  // Set default to today
  const todayRange = getDateRange('today');
  const [startDate, setStartDate] = useState(todayRange.start);
  const [endDate, setEndDate] = useState(todayRange.end);
  const [activeRange, setActiveRange] = useState('today');
  const [userSearch, setUserSearch] = useState(''); // Search by user name
  // Default to all hours
  const [selectedHour, setSelectedHour] = useState(''); // Filter by single hour (empty = all hours)
  const [issueFilter, setIssueFilter] = useState('all'); // 'yes' = Active Issues only, 'all' = All Issues (default for coverage)
  // Date helpers: display mmddyyyy, store ISO
  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return '';
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${mm}${dd}${yyyy}`;
    };
  const inputToISO = (val) => {
    if (!val) return '';
    const m = val.replace(/\D/g, '').match(/^(\d{2})(\d{2})(\d{4})$/);
    if (!m) return '';
    const [, mm, dd, yyyy] = m;
    return `${yyyy}-${mm}-${dd}`;
  };
  const [hoveredCell, setHoveredCell] = useState(null); // { user, hour, position: { top, left } }
  const [chartUserSearch, setChartUserSearch] = useState(''); // Search for users in chart
  const [selectedUser, setSelectedUser] = useState(null); // Selected user for detailed view
  const [showCharts, setShowCharts] = useState(true);

  // Update date range when issues change to ensure new issues are included
  useEffect(() => {
    // If viewing "Today" and a new issue is added, ensure it's included
    if (activeRange === 'today') {
      const todayRange = getDateRange('today');
      // Only update if dates don't match (handles day changes)
      if (startDate !== todayRange.start || endDate !== todayRange.end) {
        setStartDate(todayRange.start);
        setEndDate(todayRange.end);
      }
    }
  }, [issues.length, activeRange]); // Re-run when issues count changes

  const filteredIssues = useMemo(() => {
    if (!issues || issues.length === 0) return [];

    // Use same date format as IssueDetailsView for consistency
    const formatDate = (date) => {
      if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
        return '';
      }
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    return issues.filter((issue) => {
      // Allow issues even if portfolio_name is missing (might be set later via join)
      // But require monitored_by for user tracking
      if (!issue.monitored_by) return false;

      // Issue Present filter - match IssueDetailsView behavior
      if (issueFilter === 'yes') {
        if ((issue.issue_present || '').toString().toLowerCase() !== 'yes') {
          return false;
        }
      }

      // Date filtering using same method as IssueDetailsView
      if (!issue.created_at) return false;
      const createdDate = new Date(issue.created_at);
      if (Number.isNaN(createdDate.getTime())) return false;
      
      const issueDateString = formatDate(createdDate);
      
      // Compare dates as strings (YYYY-MM-DD format) for consistency
      if (startDate && issueDateString < startDate) return false;
      if (endDate && issueDateString > endDate) return false;

      return true;
    });
  }, [issues, startDate, endDate, issueFilter]);

  // Build matrix: Users (rows) x Hours (columns)
  const matrix = useMemo(() => {
    const allHours = Array.from({ length: 24 }, (_, i) => i); // 0-23
    // Filter hours based on selection (empty string = show all)
    const hours = selectedHour && selectedHour !== '' ? [parseInt(selectedHour, 10)] : allHours;
    
    // Get all unique users from filtered issues (not just monitoredPersonnel)
    // This ensures all users who logged issues appear in the matrix
    const usersFromIssues = new Set();
    filteredIssues.forEach(issue => {
      if (issue.monitored_by) {
        usersFromIssues.add(issue.monitored_by);
      }
    });
    
    // Combine users from issues and monitoredPersonnel, then deduplicate
    const allUsers = Array.from(new Set([
      ...Array.from(usersFromIssues),
      ...(monitoredPersonnel || [])
    ]));
    
    // Filter users based on search
    let users = allUsers;
    if (userSearch.trim()) {
      const searchLower = userSearch.toLowerCase();
      users = users.filter(user => 
        user && user.toLowerCase().includes(searchLower)
      );
    }
    
    // Sort users alphabetically for consistent display
    users = users.sort((a, b) => {
      const nameA = (a || '').toLowerCase();
      const nameB = (b || '').toLowerCase();
      return nameA.localeCompare(nameB);
    });
    
    if (users.length === 0) {
      return { 
        rows: [], 
        maxCell: 0, 
        totalsByUser: {}, 
        totalsByHour: {},
        grandTotal: 0,
        cellData: {} // { user-hour: { portfolios: [], issuesYes: [] } }
      };
    }

    const totalsByUser = Object.fromEntries(users.map((name) => [name, 0]));
    const totalsByHour = Object.fromEntries(hours.map((h) => [h, 0]));
    const cellData = {}; // Store detailed data for each cell
    let grandTotal = 0;
    let maxCell = 0;

    // Process each user
    const rows = users.map((user) => {
      const row = { userName: user, values: {}, total: 0 };
      let rowTotal = 0;

      // Process each hour
      hours.forEach((hour) => {
        // Get all issues for this user in this hour
        // Use case-insensitive matching and handle null/undefined/whitespace
        const userHourIssues = filteredIssues.filter(
          (issue) => {
            const issueUser = (issue.monitored_by || '').trim();
            const matrixUser = (user || '').trim();
            if (!issueUser || !matrixUser) return false;
            return issueUser.toLowerCase() === matrixUser.toLowerCase() &&
                   issue.issue_hour === hour;
          }
        );

        // Count portfolio VISITS (not issues) - detect separate visits based on time gaps
        // Group issues by portfolio and detect visits: if gap > 15 minutes = new visit
        const portfolioVisitsMap = {}; // Track visits per portfolio: { portfolioName: [visitTimes] }
        const portfolioInstances = []; // All portfolio visits for display
        const uniquePortfolios = new Set(); // For display purposes
        const issuesYes = []; // Issues with issue_present = "Yes"

        // First, collect all issues with their times, grouped by portfolio
        const portfolioIssuesMap = {};
        userHourIssues.forEach((issue) => {
          const portfolioName = issue.portfolio_name || 
                               issue.portfolios?.name || 
                               (issue.portfolio_id && portfolios.find(p => 
                                 (p.portfolio_id || p.id) === issue.portfolio_id
                               )?.name) ||
                               'Unknown';
          if (portfolioName && portfolioName !== 'Unknown') {
            uniquePortfolios.add(portfolioName);
            if (!portfolioIssuesMap[portfolioName]) {
              portfolioIssuesMap[portfolioName] = [];
            }
            const issueTime = issue.created_at ? new Date(issue.created_at) : new Date();
            portfolioIssuesMap[portfolioName].push({
              time: issueTime,
              issue: issue
            });
          }
        });

        // Count portfolio visits: each lock/unlock session = 1 visit
        // Group issues logged within 5 seconds as same lock session (1 visit)
        // Any gap > 5 seconds = new lock session = new visit
        Object.keys(portfolioIssuesMap).forEach(portfolioName => {
          const issues = portfolioIssuesMap[portfolioName].sort((a, b) => a.time - b.time);
          let visitCount = 0;
          let lastIssueTime = null;
          const SESSION_GAP_MS = 5000; // 5 seconds - issues within this window = same lock session

          issues.forEach(({ time, issue }) => {
            // If first issue or gap > 5 seconds, it's a new lock session = new visit
            if (!lastIssueTime || (time - lastIssueTime) > SESSION_GAP_MS) {
              visitCount++;
              portfolioInstances.push(portfolioName); // Count each lock session as one visit
            }
            lastIssueTime = time;

            // Track issues with "Yes"
            if ((issue.issue_present || '').toLowerCase() === 'yes') {
              issuesYes.push({
                portfolio: portfolioName,
                details: issue.issue_details || 'No details',
                caseNumber: issue.case_number || 'N/A',
                date: issue.created_at ? new Date(issue.created_at).toLocaleString() : 'N/A'
              });
            }
          });
        });

        const portfolioCount = portfolioInstances.length; // Count portfolio visits, not issues
        const portfolioNames = Array.from(uniquePortfolios); // Keep unique names for display

        // Store cell data for hover tooltip
        const cellKey = `${user}-${hour}`;
        cellData[cellKey] = {
          portfolios: portfolioNames, // Unique portfolio names for display
          portfolioInstances: portfolioInstances, // All instances (including duplicates)
          totalCount: portfolioCount, // Total count matching the cell value
          issuesYes: issuesYes
        };

        row.values[hour] = portfolioCount;
        rowTotal += portfolioCount;

        totalsByUser[user] = (totalsByUser[user] || 0) + portfolioCount;
        totalsByHour[hour] = (totalsByHour[hour] || 0) + portfolioCount;
        grandTotal += portfolioCount;
        if (portfolioCount > maxCell) maxCell = portfolioCount;
      });

      row.total = rowTotal;
      return row;
    });

    return { 
      rows, 
      maxCell, 
      totalsByUser, 
      totalsByHour,
      grandTotal,
      cellData
    };
  }, [filteredIssues, monitoredPersonnel, userSearch, selectedHour]);

  const exportToCSV = () => {
    if (!matrix.rows.length) return;

    const allHours = Array.from({ length: 24 }, (_, i) => i);
    const exportHours = selectedHour && selectedHour !== '' ? [parseInt(selectedHour, 10)] : allHours;
    const header = ['User', ...exportHours.map(h => `Hour ${h}`), 'Total'];
    const rows = matrix.rows.map((row) => [
      row.userName,
      ...exportHours.map((hour) => row.values[hour] || 0),
      row.total
    ]);

    rows.push([
      'Total',
      ...exportHours.map((hour) => matrix.totalsByHour[hour] || 0),
      matrix.grandTotal
    ]);

    const csvContent = [header, ...rows]
      .map((row) => row.map((value) => `"${value}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `user_hour_coverage_matrix_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Use filtered hours from matrix (already filtered based on selectedHour)
  const hours = useMemo(() => {
    const allHours = Array.from({ length: 24 }, (_, i) => i);
    return selectedHour && selectedHour !== '' ? [parseInt(selectedHour, 10)] : allHours;
  }, [selectedHour]);

  // Prepare chart data for user totals - Show ALL users who logged issues
  const userChartData = useMemo(() => {
    let filteredRows = matrix.rows.filter(row => row.total > 0); // Only show users who have coverage
    
    // Filter by chart user search
    if (chartUserSearch.trim()) {
      const searchLower = chartUserSearch.toLowerCase();
      filteredRows = filteredRows.filter(row => 
        row.userName.toLowerCase().includes(searchLower)
      );
    }
    
    return filteredRows
      .sort((a, b) => b.total - a.total) // Sort by total descending
      .map(row => ({
        user: row.userName.length > 20 ? row.userName.substring(0, 20) + '...' : row.userName,
        portfolios: row.total,
        fullName: row.userName
      }));
  }, [matrix.rows, chartUserSearch]);

  // Get detailed stats for selected user
  const selectedUserDetails = useMemo(() => {
    if (!selectedUser) return null;
    
    const userIssues = filteredIssues.filter(issue => 
      (issue.monitored_by || '').trim().toLowerCase() === selectedUser.toLowerCase()
    );
    
    const issuesYes = userIssues.filter(issue => 
      (issue.issue_present || '').toString().toLowerCase() === 'yes'
    ).length;
    
    const issuesMissed = userIssues.filter(issue => 
      issue.issues_missed_by && issue.issues_missed_by.toLowerCase().includes(selectedUser.toLowerCase())
    ).length;
    
    const uniquePortfolios = new Set(); // For display purposes
    const portfolioIssuesMap = {}; // Group issues by portfolio for visit detection
    const uniqueHours = new Set();
    const hourlyBreakdown = {};
    
    // First, collect all issues grouped by portfolio
    userIssues.forEach(issue => {
      const portfolioName = issue.portfolio_name || 
                           issue.portfolios?.name || 
                           (issue.portfolio_id && portfolios.find(p => 
                             (p.portfolio_id || p.id) === issue.portfolio_id
                           )?.name) ||
                           'Unknown';
      if (portfolioName && portfolioName !== 'Unknown') {
        uniquePortfolios.add(portfolioName);
        if (!portfolioIssuesMap[portfolioName]) {
          portfolioIssuesMap[portfolioName] = [];
        }
        const issueTime = issue.created_at ? new Date(issue.created_at) : new Date();
        portfolioIssuesMap[portfolioName].push({
          time: issueTime,
          hour: issue.issue_hour !== undefined && issue.issue_hour !== null ? issue.issue_hour : issueTime.getHours(),
          issue: issue
        });
      }
      
      if (issue.issue_hour !== undefined && issue.issue_hour !== null) {
        uniqueHours.add(issue.issue_hour);
        if (!hourlyBreakdown[issue.issue_hour]) {
          hourlyBreakdown[issue.issue_hour] = { portfolioIssues: {}, portfolios: new Set(), issues: 0, issuesYes: 0 };
        }
        hourlyBreakdown[issue.issue_hour].portfolios.add(portfolioName);
        hourlyBreakdown[issue.issue_hour].issues += 1;
        if ((issue.issue_present || '').toString().toLowerCase() === 'yes') {
          hourlyBreakdown[issue.issue_hour].issuesYes += 1;
        }
        
        // Store issue for visit detection per hour
        if (portfolioName && portfolioName !== 'Unknown') {
          if (!hourlyBreakdown[issue.issue_hour].portfolioIssues[portfolioName]) {
            hourlyBreakdown[issue.issue_hour].portfolioIssues[portfolioName] = [];
          }
          const issueTime = issue.created_at ? new Date(issue.created_at) : new Date();
          hourlyBreakdown[issue.issue_hour].portfolioIssues[portfolioName].push(issueTime);
        }
      }
    });
    
    // Count total portfolio visits: each lock/unlock session = 1 visit
    // Group issues logged within 5 seconds as same lock session (1 visit)
    // Any gap > 5 seconds = new lock session = new visit
    let totalVisits = 0;
    const SESSION_GAP_MS = 5000; // 5 seconds - issues within this window = same lock session
    Object.keys(portfolioIssuesMap).forEach(portfolioName => {
      const issues = portfolioIssuesMap[portfolioName].sort((a, b) => a.time - b.time);
      let visitCount = 0;
      let lastIssueTime = null;
      issues.forEach(({ time }) => {
        // If first issue or gap > 5 seconds, it's a new lock session = new visit
        if (!lastIssueTime || (time - lastIssueTime) > SESSION_GAP_MS) {
          visitCount++;
        }
        lastIssueTime = time;
      });
      totalVisits += visitCount;
    });
    
    // Count portfolio visits per hour: each lock/unlock session = 1 visit
    const hourlyBreakdownWithVisits = Object.keys(hourlyBreakdown).map(hour => {
      const hourData = hourlyBreakdown[hour];
      let hourVisits = 0;
      Object.keys(hourData.portfolioIssues).forEach(portfolioName => {
        const times = hourData.portfolioIssues[portfolioName].sort((a, b) => a - b);
        let visitCount = 0;
        let lastIssueTime = null;
        times.forEach(time => {
          // If first issue or gap > 5 seconds, it's a new lock session = new visit
          if (!lastIssueTime || (time - lastIssueTime) > SESSION_GAP_MS) {
            visitCount++;
          }
          lastIssueTime = time;
        });
        hourVisits += visitCount;
      });
      
      return {
        hour: parseInt(hour, 10),
        portfolios: hourVisits, // Count portfolio visits per hour based on time gaps
        issues: hourData.issues,
        issuesYes: hourData.issuesYes
      };
    }).sort((a, b) => a.hour - b.hour);
    
    return {
      userName: selectedUser,
      totalIssues: userIssues.length,
      issuesYes,
      issuesNo: userIssues.length - issuesYes,
      issuesMissed,
      portfoliosCovered: totalVisits, // Count portfolio visits based on time gaps
      hoursActive: uniqueHours.size,
      portfolioNames: Array.from(uniquePortfolios), // Unique names for display
      hourlyBreakdown: hourlyBreakdownWithVisits
    };
  }, [selectedUser, filteredIssues, portfolios]);

  return (
    <div className="space-y-6">
      <div className="rounded-lg shadow p-5 bg-gradient-to-r from-[#76AB3F] to-[#5a8f2f] text-white">
        <h2 className="text-2xl font-bold">Portfolio Coverage Matrix</h2>
        <p className="text-sm text-green-50 mt-1">
          Track how many portfolios each user covered in each hour. Hover over cells to see portfolio details and issues with "Yes".
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 border border-gray-200 space-y-5">
        {/* Search Filters - Row 1 */}
        <div className="grid grid-cols-4 gap-4 items-end">
          {/* User Name Search */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
              Search by User Name
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
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Type user name..."
                className="w-full pl-9 pr-9 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              {userSearch && (
                <button
                  onClick={() => setUserSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Hour Filter - Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
              Filter by Hour
            </label>
            <select
              value={selectedHour}
              onChange={(e) => setSelectedHour(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">All Hours</option>
              {Array.from({ length: 24 }, (_, i) => i).map(hour => (
                <option key={hour} value={hour}>
                  {hour}:00 {hour === new Date().getHours() ? '(Current)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Issue Filter */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
              Issue Filter
            </label>
            <select
              value={issueFilter}
              onChange={(e) => setIssueFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">All Issues (Coverage)</option>
              <option value="yes">Active Issues Only</option>
            </select>
          </div>

          {/* Quick Range Buttons */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
              Quick Range
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  const range = getDateRange('today');
                  setStartDate(range.start);
                  setEndDate(range.end);
                  setActiveRange('today');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  activeRange === 'today'
                    ? 'bg-green-600 text-white border-green-600'
                    : 'border-gray-300 text-gray-700 hover:border-green-500 hover:text-green-600'
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => {
                  const range = getDateRange('yesterday');
                  setStartDate(range.start);
                  setEndDate(range.end);
                  setActiveRange('yesterday');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  activeRange === 'yesterday'
                    ? 'bg-green-600 text-white border-green-600'
                    : 'border-gray-300 text-gray-700 hover:border-green-500 hover:text-green-600'
                }`}
              >
                Yesterday
              </button>
              <button
                type="button"
                onClick={() => {
                  const range = getDateRange('week');
                  setStartDate(range.start);
                  setEndDate(range.end);
                  setActiveRange('week');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  activeRange === 'week'
                    ? 'bg-green-600 text-white border-green-600'
                    : 'border-gray-300 text-gray-700 hover:border-green-500 hover:text-green-600'
                }`}
              >
                Week
              </button>
              <button
                type="button"
                onClick={() => {
                  const range = getDateRange('month');
                  setStartDate(range.start);
                  setEndDate(range.end);
                  setActiveRange('month');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  activeRange === 'month'
                    ? 'bg-green-600 text-white border-green-600'
                    : 'border-gray-300 text-gray-700 hover:border-green-500 hover:text-green-600'
                }`}
              >
                Month
              </button>
            </div>
          </div>
        </div>

        {/* Custom Date Range - Row 2 */}
        <div className="grid grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
              From Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setActiveRange('custom');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                To Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setActiveRange('custom');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <button
              onClick={() => {
                const range = getDateRange('today');
                setStartDate(range.start);
                setEndDate(range.end);
                setActiveRange('today');
                setUserSearch('');
                setSelectedHour(''); // Reset to all hours
                setIssueFilter('all'); // Reset to all issues
              }}
              className="px-3 py-2 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap"
            >
              Reset All Filters
            </button>
          </div>
          <div className="col-span-2"></div>
        </div>
      </div>

      {/* Graphical Representations */}
      {showCharts && matrix.rows.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-[#76AB3F] to-[#5a8f2f] px-6 py-4">
            <div>
              <h3 className="text-lg font-bold text-white">User Coverage Performance</h3>
              <p className="text-sm text-green-50">Top performers by portfolio coverage</p>
            </div>
          </div>
          <div className="p-6">
            {/* Search Bar for Chart */}
            <div className="mb-4 flex items-center gap-3">
              <div className="relative flex-1">
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
                  value={chartUserSearch}
                  onChange={(e) => setChartUserSearch(e.target.value)}
                  placeholder="Search user by name..."
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                {chartUserSearch && (
                  <button
                    onClick={() => setChartUserSearch('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              {userChartData.length > 0 && (
                <button
                  onClick={() => {
                    const header = ['User', 'Total Portfolios Monitored'];
                    const rows = userChartData.map(entry => [
                      entry.fullName,
                      entry.portfolios
                    ]);
                    const csvContent = [header, ...rows]
                      .map(row => row.map(cell => `"${cell}"`).join(','))
                      .join('\n');
                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                    const link = document.createElement('a');
                    const url = URL.createObjectURL(blob);
                    link.setAttribute('href', url);
                    link.setAttribute('download', `user-coverage-chart-${new Date().toISOString().split('T')[0]}.csv`);
                    link.style.visibility = 'hidden';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white rounded-lg shadow transition-colors whitespace-nowrap"
                  style={{ backgroundColor: '#76AB3F' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#5a8f2f')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#76AB3F')}
                >
                  Export Chart Data
                </button>
              )}
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart 
                data={userChartData} 
                margin={{ top: 20, right: 20, left: 20, bottom: 60 }}
                barCategoryGap="5%"
              >
                <defs>
                  <linearGradient id="barGradientTop" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#5a8f2f" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#76AB3F" stopOpacity={0.8}/>
                  </linearGradient>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#76AB3F" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#9fd86b" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                <XAxis 
                  dataKey="user" 
                  angle={-30}
                  textAnchor="end"
                  height={70}
                  tick={{ fontSize: 11, fill: '#6b7280', fontWeight: 500 }}
                  stroke="#9ca3af"
                  interval={0}
                />
                <YAxis 
                  label={{ 
                    value: 'Total Portfolios Monitored', 
                    angle: -90, 
                    position: 'insideLeft', 
                    style: { fontSize: 13, fontWeight: 600, fill: '#374151' } 
                  }}
                  tick={{ fontSize: 12, fill: '#6b7280', fontWeight: 500 }}
                  stroke="#9ca3af"
                  width={60}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.98)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    fontSize: '13px',
                    padding: '10px 12px'
                  }}
                  formatter={(value, name) => [
                    <span key="value" style={{ fontWeight: 700, color: '#76AB3F', fontSize: '14px' }}>{value}</span>,
                    <span key="name" style={{ color: '#6b7280' }}>Total Portfolios Monitored</span>
                  ]}
                  labelFormatter={(label, payload) => (
                    <div style={{ fontWeight: 600, color: '#111827', marginBottom: '4px', fontSize: '14px' }}>
                      {payload && payload[0] ? payload[0].payload.fullName : label}
                    </div>
                  )}
                  cursor={{ fill: 'rgba(118, 171, 63, 0.1)' }}
                />
                <Bar 
                  dataKey="portfolios" 
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                  onClick={(data) => {
                    if (data && data.fullName) {
                      setSelectedUser(data.fullName);
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  {userChartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`}
                      fill={index < 3 ? 'url(#barGradientTop)' : 'url(#barGradient)'}
                      style={{ 
                        cursor: 'pointer',
                        opacity: selectedUser && selectedUser.toLowerCase() === entry.fullName.toLowerCase() ? 0.7 : 1
                      }}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            {userChartData.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-gradient-to-b from-[#5a8f2f] to-[#76AB3F]"></div>
                  <span>Top 3 Performers</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-gradient-to-b from-[#76AB3F] to-[#9fd86b]"></div>
                  <span>Other Users</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      {selectedUser && selectedUserDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-[#76AB3F] to-[#5a8f2f] px-6 py-4 flex items-center justify-between sticky top-0 z-10">
              <div>
                <h3 className="text-xl font-bold text-white">User Performance Details</h3>
                <p className="text-sm text-green-50">{selectedUser}</p>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Total Alerts Generated</div>
                  <div className="text-2xl font-bold text-blue-900 mt-1">{selectedUserDetails.totalIssues}</div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="text-xs font-semibold text-red-600 uppercase tracking-wide">Active Issues</div>
                  <div className="text-2xl font-bold text-red-900 mt-1">{selectedUserDetails.issuesYes}</div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-xs font-semibold text-green-600 uppercase tracking-wide">Healthy Sites</div>
                  <div className="text-2xl font-bold text-green-900 mt-1">{selectedUserDetails.issuesNo}</div>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="text-xs font-semibold text-orange-600 uppercase tracking-wide">Missed Alerts</div>
                  <div className="text-2xl font-bold text-orange-900 mt-1">{selectedUserDetails.issuesMissed}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Total Portfolios Monitored</div>
                  <div className="text-2xl font-bold text-purple-900 mt-1">{selectedUserDetails.portfoliosCovered}</div>
                </div>
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">Monitoring Active Hours</div>
                  <div className="text-2xl font-bold text-indigo-900 mt-1">{selectedUserDetails.hoursActive}</div>
                </div>
              </div>

              {/* Portfolios List */}
              {selectedUserDetails.portfolioNames.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Total Portfolios Monitored ({selectedUserDetails.portfolioNames.length})</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedUserDetails.portfolioNames.map((portfolio, idx) => (
                      <span key={idx} className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        {portfolio}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Hourly Breakdown Chart */}
              {selectedUserDetails.hourlyBreakdown.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Hourly Breakdown</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={selectedUserDetails.hourlyBreakdown} margin={{ top: 20, right: 20, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                      <XAxis 
                        dataKey="hour" 
                        tick={{ fontSize: 11, fill: '#6b7280' }}
                        label={{ value: 'Hour', position: 'insideBottom', offset: -5, style: { fontSize: 12 } }}
                      />
                      <YAxis 
                        tick={{ fontSize: 11, fill: '#6b7280' }}
                        label={{ value: 'Count', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.98)',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                      />
                      <Bar dataKey="portfolios" fill="#76AB3F" name="Portfolios" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="issues" fill="#3b82f6" name="Issues" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="issuesYes" fill="#ef4444" name="Active Issues" radius={[4, 4, 0, 0]} />
                      <Legend />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Hourly Breakdown Table */}
              {selectedUserDetails.hourlyBreakdown.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Detailed Hourly Breakdown</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm border border-gray-200 rounded-lg">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left font-semibold text-gray-700">Hour</th>
                          <th className="px-4 py-2 text-right font-semibold text-gray-700">Portfolios</th>
                          <th className="px-4 py-2 text-right font-semibold text-gray-700">Total Alerts Generated</th>
                          <th className="px-4 py-2 text-right font-semibold text-gray-700">Active Issues</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedUserDetails.hourlyBreakdown.map((hour, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-4 py-2 font-medium text-gray-900">{hour.hour}:00</td>
                            <td className="px-4 py-2 text-right text-gray-700">{hour.portfolios}</td>
                            <td className="px-4 py-2 text-right text-gray-700">{hour.issues}</td>
                            <td className="px-4 py-2 text-right text-red-600 font-semibold">{hour.issuesYes}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toggle Charts Button and Export Matrix */}
      {matrix.rows.length > 0 && (
        <div className="flex justify-end items-center gap-3">
          <button
            onClick={() => setShowCharts(!showCharts)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {showCharts ? 'Hide Charts' : 'Show Charts'}
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
      )}

      {/* User Detail Modal */}
      {selectedUser && selectedUserDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-[#76AB3F] to-[#5a8f2f] px-6 py-4 flex items-center justify-between sticky top-0 z-10">
              <div>
                <h3 className="text-xl font-bold text-white">User Performance Details</h3>
                <p className="text-sm text-green-50">{selectedUser}</p>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Total Alerts Generated</div>
                  <div className="text-2xl font-bold text-blue-900 mt-1">{selectedUserDetails.totalIssues}</div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="text-xs font-semibold text-red-600 uppercase tracking-wide">Active Issues</div>
                  <div className="text-2xl font-bold text-red-900 mt-1">{selectedUserDetails.issuesYes}</div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-xs font-semibold text-green-600 uppercase tracking-wide">Healthy Sites</div>
                  <div className="text-2xl font-bold text-green-900 mt-1">{selectedUserDetails.issuesNo}</div>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="text-xs font-semibold text-orange-600 uppercase tracking-wide">Missed Alerts</div>
                  <div className="text-2xl font-bold text-orange-900 mt-1">{selectedUserDetails.issuesMissed}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Total Portfolios Monitored</div>
                  <div className="text-2xl font-bold text-purple-900 mt-1">{selectedUserDetails.portfoliosCovered}</div>
                </div>
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">Monitoring Active Hours</div>
                  <div className="text-2xl font-bold text-indigo-900 mt-1">{selectedUserDetails.hoursActive}</div>
                </div>
              </div>

              {/* Portfolios List */}
              {selectedUserDetails.portfolioNames.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Total Portfolios Monitored ({selectedUserDetails.portfolioNames.length})</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedUserDetails.portfolioNames.map((portfolio, idx) => (
                      <span key={idx} className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        {portfolio}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Hourly Breakdown Chart */}
              {selectedUserDetails.hourlyBreakdown.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Hourly Breakdown</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={selectedUserDetails.hourlyBreakdown} margin={{ top: 20, right: 20, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                      <XAxis 
                        dataKey="hour" 
                        tick={{ fontSize: 11, fill: '#6b7280' }}
                        label={{ value: 'Hour', position: 'insideBottom', offset: -5, style: { fontSize: 12 } }}
                      />
                      <YAxis 
                        tick={{ fontSize: 11, fill: '#6b7280' }}
                        label={{ value: 'Count', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.98)',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                      />
                      <Bar dataKey="portfolios" fill="#76AB3F" name="Portfolios" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="issues" fill="#3b82f6" name="Issues" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="issuesYes" fill="#ef4444" name="Active Issues" radius={[4, 4, 0, 0]} />
                      <Legend />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Hourly Breakdown Table */}
              {selectedUserDetails.hourlyBreakdown.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Detailed Hourly Breakdown</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm border border-gray-200 rounded-lg">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left font-semibold text-gray-700">Hour</th>
                          <th className="px-4 py-2 text-right font-semibold text-gray-700">Portfolios</th>
                          <th className="px-4 py-2 text-right font-semibold text-gray-700">Total Alerts Generated</th>
                          <th className="px-4 py-2 text-right font-semibold text-gray-700">Active Issues</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedUserDetails.hourlyBreakdown.map((hour, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-4 py-2 font-medium text-gray-900">{hour.hour}:00</td>
                            <td className="px-4 py-2 text-right text-gray-700">{hour.portfolios}</td>
                            <td className="px-4 py-2 text-right text-gray-700">{hour.issues}</td>
                            <td className="px-4 py-2 text-right text-red-600 font-semibold">{hour.issuesYes}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50 flex flex-wrap items-center gap-4 justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Coverage Overview</h3>
            <p className="text-xs text-gray-500">
              {matrix.grandTotal} portfolio coverage(s) across {matrix.rows.length} user(s) • {selectedHour && selectedHour !== '' ? `Hour ${selectedHour}:00` : '24 hours'}
              {issueFilter === 'yes' && <span className="ml-1">(Active Issues only)</span>}
              {(userSearch || (selectedHour && selectedHour !== '') || issueFilter === 'yes') && (
                <span className="ml-2 text-green-600 font-semibold">
                  (Filtered)
                </span>
              )}
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
              No coverage
            </span>
          </div>
        </div>

        <div className="overflow-x-auto overflow-y-visible">
          <table className="min-w-full text-sm relative">
            <thead>
              <tr className="bg-[#76AB3F] text-white text-xs uppercase tracking-wide">
                <th className="sticky left-0 z-20 px-4 py-3 text-left bg-[#76AB3F]">User / Hour</th>
                {hours.map((hour) => (
                  <th key={hour} className="px-3 py-3 text-center whitespace-nowrap border-l border-green-200 min-w-[60px]">
                    {hour}:00
                  </th>
                ))}
                <th className="px-4 py-3 text-center whitespace-nowrap border-l border-green-200">Total</th>
              </tr>
            </thead>
            <tbody>
              {matrix.rows.length === 0 ? (
                <tr>
                  <td colSpan={hours.length + 2} className="px-6 py-12 text-center text-gray-500">
                    {userSearch ? `No users found matching "${userSearch}"` : 'No data available for the selected filters. Try adjusting the date range or reset filters.'}
                  </td>
                </tr>
              ) : (
                matrix.rows.map((row) => (
                  <tr key={row.userName} className="hover:bg-green-50 transition-colors">
                    <th
                      className="sticky left-0 z-10 bg-white px-4 py-3 text-left font-semibold text-gray-900 border-b border-gray-100"
                      scope="row"
                    >
                      <div>{row.userName}</div>
                      <div className="text-xs text-gray-400 font-normal">
                        {row.total} portfolio{row.total === 1 ? '' : 's'} summary
                      </div>
                    </th>
                    {hours.map((hour) => {
                      const count = row.values[hour] || 0;
                      const tone = getCellToneClass(count, matrix.maxCell);
                      const cellKey = `${row.userName}-${hour}`;
                      const cellInfo = matrix.cellData[cellKey] || { portfolios: [], issuesYes: [] };
                      const isHovered = hoveredCell?.user === row.userName && hoveredCell?.hour === hour;

                      return (
                        <td
                          key={`${row.userName}-${hour}`}
                          className={`px-3 py-2 text-center align-middle font-semibold transition-colors ${tone} border border-white relative cursor-pointer`}
                          onMouseEnter={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const viewportHeight = window.innerHeight;
                            const spaceAbove = rect.top;
                            const spaceBelow = viewportHeight - rect.bottom;
                            
                            // Show tooltip above if there's more space above, otherwise below
                            const showAbove = spaceAbove > spaceBelow;
                            
                            setHoveredCell({ 
                              user: row.userName, 
                              hour,
                              position: {
                                top: showAbove ? rect.top - 10 : rect.bottom + 10,
                                left: rect.left + rect.width / 2,
                                showAbove: showAbove
                              }
                            });
                          }}
                          onMouseLeave={() => setHoveredCell(null)}
                        >
                          {count || 0}
                          
                          {/* Hover Tooltip */}
                          {isHovered && (cellInfo.portfolios.length > 0 || cellInfo.issuesYes.length > 0) && hoveredCell?.position && (
                            <div 
                              className="fixed z-[9999] w-80 bg-gray-900 text-white text-xs rounded-lg shadow-xl p-4 pointer-events-none"
                              style={{
                                top: `${hoveredCell.position.top}px`,
                                left: `${hoveredCell.position.left}px`,
                                transform: hoveredCell.position.showAbove 
                                  ? 'translate(-50%, -100%)' 
                                  : 'translate(-50%, 0)'
                              }}
                            >
                              <div className="font-bold text-sm mb-2 pb-2 border-b border-gray-700">
                                {row.userName} - Hour {hour}:00
                              </div>
                              
                              {/* Total Portfolios Monitored */}
                              {cellInfo.totalCount > 0 && (
                                <div className="mb-3">
                                  <div className="font-semibold text-green-400 mb-1">
                                    Total Portfolios Monitored ({cellInfo.totalCount}):
                                  </div>
                                  <div className="space-y-1 max-h-32 overflow-y-auto">
                                    {cellInfo.portfolioInstances && cellInfo.portfolioInstances.length > 0 ? (
                                      cellInfo.portfolioInstances.map((portfolio, idx) => (
                                        <div key={idx} className="text-gray-200 pl-2">
                                          • {portfolio}
                                        </div>
                                      ))
                                    ) : (
                                      cellInfo.portfolios.map((portfolio, idx) => (
                                        <div key={idx} className="text-gray-200 pl-2">
                                          • {portfolio}
                                        </div>
                                      ))
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Issues with "Yes" */}
                              {cellInfo.issuesYes.length > 0 && (
                                <div>
                                  <div className="font-semibold text-red-400 mb-1">
                                    Active Issues ({cellInfo.issuesYes.length}):
                                  </div>
                                  <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {cellInfo.issuesYes.map((issue, idx) => (
                                      <div key={idx} className="bg-gray-800 rounded p-2 border-l-2 border-red-500">
                                        <div className="font-medium text-white">{issue.portfolio}</div>
                                        <div className="text-gray-300 text-xs mt-1">{issue.details}</div>
                                        <div className="text-gray-400 text-xs mt-1">
                                          Case: {issue.caseNumber} • {issue.date}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Arrow pointing to cell */}
                              <div 
                                className={`absolute left-1/2 transform -translate-x-1/2 border-4 border-transparent ${
                                  hoveredCell.position.showAbove 
                                    ? 'top-full -mt-1 border-t-gray-900' 
                                    : 'bottom-full mb-1 border-b-gray-900'
                                }`}
                              ></div>
                            </div>
                          )}
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
                    Hour Totals
                  </td>
                  {hours.map((hour) => (
                    <td key={hour} className="px-4 py-3 text-center text-gray-800 border-t border-gray-200">
                      {matrix.totalsByHour[hour] || 0}
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
