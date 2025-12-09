import React, { useState, useMemo } from 'react';

const IssuesByUser = ({ issues, portfolios, monitoredPersonnel, onEditIssue, onDeleteIssue, isAdmin = false }) => {
  const [filters, setFilters] = useState({
    showMissedOnly: false,
    missedBy: '',
    monitoredBy: '',
    startDate: '',
    endDate: '',
    issueFilter: 'yes' // 'yes' = Issues Yes (default), 'all' = All Issues
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  
  // Performance Analytics Period Filtering
  const [analyticsPeriod, setAnalyticsPeriod] = useState('all'); // 'all', 'month', 'quarter', 'custom'
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedQuarter, setSelectedQuarter] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [selectedUserForAnalytics, setSelectedUserForAnalytics] = useState(''); // Individual user filter

  const filteredIssues = useMemo(() => {
    let filtered = [...issues];

    // Issue Present filter - default to "Issues Yes" only
    if (filters.issueFilter === 'yes') {
      filtered = filtered.filter(issue => 
        (issue.issue_present || '').toString().toLowerCase() === 'yes'
      );
    }
    // If 'all', show all issues (no filter applied)

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

    if (searchQuery) {
      filtered = filtered.filter(issue =>
        issue.portfolio_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.issue_details?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.case_number?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [issues, filters, searchQuery]);

  const stats = useMemo(() => {
    const totalIssues = issues.length;
    const missedIssues = issues.filter(issue => issue.issues_missed_by).length;
    const issuesWithProblems = issues.filter(issue => issue.issue_present?.toLowerCase() === 'yes').length;
    const issuesWithoutProblems = issues.filter(issue => issue.issue_present?.toLowerCase() === 'no').length;
    
    return {
      totalIssues,
      missedIssues,
      issuesWithProblems,
      issuesWithoutProblems
    };
  }, [issues]);

  // Filter issues based on analytics period
  const filteredIssuesForAnalytics = useMemo(() => {
    let filtered = [...issues];
    
    // Apply period filter
    if (analyticsPeriod === 'month' && selectedMonth) {
      const [year, month] = selectedMonth.split('-').map(Number);
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);
      
      filtered = filtered.filter(issue => {
        const issueDate = new Date(issue.created_at);
        return issueDate >= startDate && issueDate <= endDate;
      });
    } else if (analyticsPeriod === 'quarter' && selectedQuarter) {
      const quarter = parseInt(selectedQuarter);
      const startMonth = (quarter - 1) * 3;
      const startDate = new Date(selectedYear, startMonth, 1);
      const endDate = new Date(selectedYear, startMonth + 3, 0, 23, 59, 59, 999);
      
      filtered = filtered.filter(issue => {
        const issueDate = new Date(issue.created_at);
        return issueDate >= startDate && issueDate <= endDate;
      });
    } else if (analyticsPeriod === 'custom' && customStartDate && customEndDate) {
      const start = new Date(customStartDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(customEndDate);
      end.setHours(23, 59, 59, 999);
      
      filtered = filtered.filter(issue => {
        const issueDate = new Date(issue.created_at);
        return issueDate >= start && issueDate <= end;
      });
    }
    
    // Apply individual user filter if selected
    if (selectedUserForAnalytics) {
      filtered = filtered.filter(issue => 
        issue.monitored_by === selectedUserForAnalytics || 
        issue.issues_missed_by === selectedUserForAnalytics
      );
    }
    
    return filtered;
  }, [issues, analyticsPeriod, selectedMonth, selectedQuarter, selectedYear, customStartDate, customEndDate, selectedUserForAnalytics]);

  // FIX 4: Hourly Report Card with User Performance Analytics
  const userPerformanceAnalytics = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Use filtered issues for analytics
    const analyticsIssues = filteredIssuesForAnalytics;
    
    // Get all unique users from both monitored_by and issues_missed_by
    const allUsers = new Set();
    analyticsIssues.forEach(issue => {
      if (issue.monitored_by) allUsers.add(issue.monitored_by);
      if (issue.issues_missed_by) allUsers.add(issue.issues_missed_by);
    });

    // Calculate performance for each user
    const userStats = Array.from(allUsers).map(userName => {
      const monitoredIssues = analyticsIssues.filter(issue => issue.monitored_by === userName);
      const missedIssues = analyticsIssues.filter(issue => issue.issues_missed_by === userName);
      const issuesFoundByUser = monitoredIssues.filter(issue => issue.issue_present?.toLowerCase() === 'yes');
      
      // Calculate hourly breakdown (0-23)
      const hourlyBreakdown = Array.from({ length: 24 }, (_, hour) => {
        const hourIssues = monitoredIssues.filter(issue => issue.issue_hour === hour);
        return {
          hour,
          count: hourIssues.length,
          foundIssues: hourIssues.filter(issue => issue.issue_present?.toLowerCase() === 'yes').length
        };
      });

      // Calculate today's activity
      const todayIssues = monitoredIssues.filter(issue => {
        const issueDate = new Date(issue.created_at);
        issueDate.setHours(0, 0, 0, 0);
        return issueDate.getTime() === today.getTime();
      });

      const activeHours = hourlyBreakdown.filter(h => h.count > 0).length;
      const totalPortfoliosChecked = new Set(monitoredIssues.map(i => i.portfolio_name)).size;
      const accuracyRate = monitoredIssues.length > 0 
        ? ((monitoredIssues.length - missedIssues.length) / monitoredIssues.length * 100).toFixed(1)
        : 0;

      return {
        userName,
        totalMonitored: monitoredIssues.length,
        totalMissed: missedIssues.length,
        issuesFound: issuesFoundByUser.length,
        todayActivity: todayIssues.length,
        activeHours,
        totalPortfoliosChecked,
        accuracyRate: parseFloat(accuracyRate),
        hourlyBreakdown,
        performanceScore: activeHours >= 18 ? 'Excellent' : activeHours >= 12 ? 'Good' : activeHours >= 6 ? 'Fair' : 'Low'
      };
    });

    return userStats.sort((a, b) => b.totalMonitored - a.totalMonitored);
  }, [filteredIssuesForAnalytics]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      showMissedOnly: false,
      missedBy: '',
      monitoredBy: '',
      startDate: '',
      endDate: '',
      issueFilter: 'yes' // Reset to default: Issues Yes
    });
    setSearchQuery('');
  };

  const handleExportToCSV = () => {
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

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

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

  const normalizedUserSearch = userSearchQuery.trim().toLowerCase();
  const hasUserSearch = normalizedUserSearch.length > 0;
  const filteredUsers = hasUserSearch
    ? userPerformanceAnalytics.filter(user =>
        user.userName.toLowerCase().includes(normalizedUserSearch)
      )
    : [];

  const renderUserAnalyticsCards = () => {
    if (!hasUserSearch) {
      return (
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center text-gray-500 bg-gray-50">
          Type a monitoring user’s name in the search box above to view their detailed analytics.
        </div>
      );
    }

    if (filteredUsers.length === 0) {
      return (
        <div className="border-2 border-dashed border-red-200 rounded-xl p-6 text-center text-red-500 bg-red-50">
          No users found. Try a different name or clear the search.
        </div>
      );
    }

    return filteredUsers.map((user) => (
      <div key={user.userName} className="border-2 border-gray-200 rounded-xl p-5 hover:border-green-300 transition-all hover:shadow-lg">
        {/* User Header */}
        <div className="flex items-center justify-between mb-5 pb-4 border-b-2 border-gray-100">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl"
              style={{ background: 'linear-gradient(135deg, #76AB3F, #5a8f2f)' }}
            >
              {user.userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h4 className="text-xl font-bold text-gray-900">{user.userName}</h4>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    user.performanceScore === 'Excellent'
                      ? 'bg-green-100 text-green-700'
                      : user.performanceScore === 'Good'
                      ? 'bg-blue-100 text-blue-700'
                      : user.performanceScore === 'Fair'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {user.performanceScore} Performance
                </span>
                <span className="text-xs text-gray-600">•</span>
                <span className="text-xs text-gray-600">{user.activeHours} Active Hours</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold" style={{ color: '#76AB3F' }}>
              {user.totalMonitored}
            </div>
            <div className="text-xs text-gray-600 font-medium">Total Monitored</div>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-5">
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
            <div className="text-2xl font-bold text-green-700">{user.issuesFound}</div>
            <div className="text-xs text-green-600 font-medium mt-1">Issues Found</div>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
            <div className="text-2xl font-bold text-red-700">{user.totalMissed}</div>
            <div className="text-xs text-red-600 font-medium mt-1">Missed</div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
            <div className="text-2xl font-bold text-blue-700">{user.todayActivity}</div>
            <div className="text-xs text-blue-600 font-medium mt-1">Today's Activity</div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
            <div className="text-2xl font-bold text-purple-700">{user.totalPortfoliosChecked}</div>
            <div className="text-xs text-purple-600 font-medium mt-1">Portfolios Checked</div>
          </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
            <div className="text-2xl font-bold text-orange-700">{user.accuracyRate}%</div>
            <div className="text-xs text-orange-600 font-medium mt-1">Accuracy Rate</div>
          </div>
        </div>

        {/* Hourly Breakdown Chart */}
        <div>
          <h5 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            24-Hour Monitoring Activity
          </h5>
          <div className="grid grid-cols-12 gap-1">
            {user.hourlyBreakdown.map((hourData) => (
              <div key={hourData.hour} className="text-center">
                <div
                  className={`h-12 rounded-md transition-all cursor-pointer hover:opacity-80 ${
                    hourData.count === 0
                      ? 'bg-gray-100'
                      : hourData.count >= 5
                      ? 'bg-green-500'
                      : hourData.count >= 3
                      ? 'bg-green-400'
                      : hourData.count >= 1
                      ? 'bg-green-300'
                      : 'bg-gray-100'
                  }`}
                  title={`Hour ${hourData.hour}: ${hourData.count} checks${hourData.foundIssues > 0 ? `, ${hourData.foundIssues} issues found` : ''}`}
                >
                  {hourData.count > 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-white text-xs font-bold">
                      <div>{hourData.count}</div>
                      {hourData.foundIssues > 0 && <div className="text-[10px] mt-0.5">🔴</div>}
                    </div>
                  )}
                </div>
                <div className="text-[10px] text-gray-500 font-medium mt-1">{hourData.hour}</div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-4 mt-3 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-green-500"></div>
              <span className="text-gray-600">High Activity (5+)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-green-400"></div>
              <span className="text-gray-600">Medium (3-4)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-green-300"></div>
              <span className="text-gray-600">Low (1-2)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-gray-100 border border-gray-300"></div>
              <span className="text-gray-600">No Activity</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="text-red-500 font-bold">🔴</div>
              <span className="text-gray-600">Issues Found</span>
            </div>
          </div>
        </div>
      </div>
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-lg shadow p-5" style={{ backgroundColor: '#76AB3F' }}>
        <h2 className="text-2xl font-bold text-white">Issues by User</h2>
        <p className="text-gray-100 text-sm mt-1">Track and analyze issues by monitoring personnel</p>
      </div>

      {/* Stats Cards - Simple Numbers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-5 shadow border border-gray-200">
          <div className="text-sm text-gray-600 mb-1 font-medium">Total Issues</div>
          <div className="text-3xl font-bold text-gray-900">{stats.totalIssues}</div>
        </div>

        <div className="bg-white rounded-lg p-5 shadow border border-gray-200">
          <div className="text-sm text-gray-600 mb-1 font-medium">Missed Issues</div>
          <div className="text-3xl font-bold text-red-600">{stats.missedIssues}</div>
        </div>

        <div className="bg-white rounded-lg p-5 shadow border border-gray-200">
          <div className="text-sm text-gray-600 mb-1 font-medium">With Problems</div>
          <div className="text-3xl font-bold text-orange-600">{stats.issuesWithProblems}</div>
        </div>

        <div className="bg-white rounded-lg p-5 shadow border border-gray-200">
          <div className="text-sm text-gray-600 mb-1 font-medium">No Problems</div>
          <div className="text-3xl font-bold text-green-600">{stats.issuesWithoutProblems}</div>
        </div>
      </div>

      {/* FIX 4: Hourly Performance Report Cards for All Users */}
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
          <div className="flex flex-col gap-1">
            <h3 className="text-xl font-bold text-gray-900">User Performance Analytics</h3>
            <p className="text-sm text-gray-600">Individual hourly monitoring performance and statistics</p>
          </div>
        </div>

        {/* Period Filter Controls */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border-2 border-blue-200 mb-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <label className="text-sm font-bold text-gray-700">📅 Period Filter</label>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Period Type Selector */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Period Type</label>
                <select
                  value={analyticsPeriod}
                  onChange={(e) => {
                    setAnalyticsPeriod(e.target.value);
                    setSelectedMonth('');
                    setSelectedQuarter('');
                    setCustomStartDate('');
                    setCustomEndDate('');
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Time</option>
                  <option value="month">By Month</option>
                  <option value="quarter">By Quarter</option>
                  <option value="custom">Custom Period</option>
                </select>
              </div>

              {/* Month Selector */}
              {analyticsPeriod === 'month' && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Select Month</label>
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}

              {/* Quarter Selector */}
              {analyticsPeriod === 'quarter' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Select Quarter</label>
                    <select
                      value={selectedQuarter}
                      onChange={(e) => setSelectedQuarter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Quarter</option>
                      <option value="1">Q1 (Jan-Mar)</option>
                      <option value="2">Q2 (Apr-Jun)</option>
                      <option value="3">Q3 (Jul-Sep)</option>
                      <option value="4">Q4 (Oct-Dec)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Year</label>
                    <input
                      type="number"
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(parseInt(e.target.value) || new Date().getFullYear())}
                      min="2020"
                      max={new Date().getFullYear() + 1}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </>
              )}

              {/* Custom Period Selector */}
              {analyticsPeriod === 'custom' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      min={customStartDate}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </>
              )}

              {/* Individual User Selector */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Filter by User (Optional)</label>
                <select
                  value={selectedUserForAnalytics}
                  onChange={(e) => setSelectedUserForAnalytics(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Users</option>
                  {Array.from(new Set([
                    ...issues.map(i => i.monitored_by).filter(Boolean),
                    ...issues.map(i => i.issues_missed_by).filter(Boolean)
                  ])).sort().map(user => (
                    <option key={user} value={user}>{user}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Period Summary */}
            {(analyticsPeriod !== 'all' || selectedUserForAnalytics) && (
              <div className="mt-2 p-2 bg-blue-100 rounded text-xs text-gray-700">
                <strong>Showing:</strong> {
                  analyticsPeriod === 'month' && selectedMonth ? `Month: ${new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}` :
                  analyticsPeriod === 'quarter' && selectedQuarter ? `Q${selectedQuarter} ${selectedYear}` :
                  analyticsPeriod === 'custom' && customStartDate && customEndDate ? `${customStartDate} to ${customEndDate}` :
                  'All Time'
                }
                {selectedUserForAnalytics && ` | User: ${selectedUserForAnalytics}`}
                {` | ${filteredIssuesForAnalytics.length} issues`}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end sm:flex-wrap lg:flex-nowrap lg:gap-4 w-full lg:w-auto mb-6">
          <div className="flex items-center gap-2 w-full sm:w-72 lg:w-80">
            <div className="relative flex-1">
              <svg className="w-4 h-4 text-purple-600 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                placeholder="Search users by name..."
                className="w-full pl-9 pr-8 py-2 border-2 border-purple-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all shadow-sm"
              />
              {userSearchQuery && (
                <button
                  onClick={() => setUserSearchQuery('')}
                  className="absolute inset-y-0 right-0 px-3 text-xs text-red-600 hover:text-red-800 font-semibold"
                  type="button"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ backgroundColor: '#E8F5E0' }}>
            <svg className="w-5 h-5" style={{ color: '#76AB3F' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span className="text-sm font-semibold" style={{ color: '#76AB3F' }}>
              {hasUserSearch ? filteredUsers.length : 0} Matching Users
            </span>
          </div>
        </div>

        {/* Search status helper */}
        {hasUserSearch && (
          <div className="mb-6 flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border-2 border-purple-200">
            <span className="text-xs text-gray-600">
              Showing <span className="font-bold text-purple-600">{filteredUsers.length}</span> user(s) matching "{userSearchQuery}"
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const header = ['User', 'Total Monitored', 'Issues Found', 'Issues Missed', 'Active Hours', 'Performance Score', 'Portfolios Covered'];
                  const rows = filteredUsers.map(user => [
                    user.userName,
                    user.totalMonitored,
                    user.issuesFound,
                    user.issuesMissed,
                    user.activeHours,
                    user.performanceScore,
                    user.portfoliosCovered || 0
                  ]);
                  const csvContent = [header, ...rows]
                    .map(row => row.map(cell => `"${String(cell)}"`).join(','))
                    .join('\n');
                  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                  const link = document.createElement('a');
                  const url = URL.createObjectURL(blob);
                  link.setAttribute('href', url);
                  link.setAttribute('download', `user-analytics-${userSearchQuery}-${new Date().toISOString().split('T')[0]}.csv`);
                  link.style.visibility = 'hidden';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="px-3 py-1.5 text-xs font-medium text-white rounded-lg shadow transition-colors"
                style={{ backgroundColor: '#76AB3F' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#5a8f2f')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#76AB3F')}
              >
                Export Data
              </button>
              <button
                onClick={() => setUserSearchQuery('')}
                className="text-xs text-red-600 hover:text-red-800 font-medium flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear Search
              </button>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {renderUserAnalyticsCards()}
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filter & Search Issues
          </h3>
          {(filters.showMissedOnly || filters.missedBy || filters.monitoredBy || filters.startDate || filters.endDate || filters.issueFilter === 'all' || searchQuery) && (
            <span className="text-sm text-green-600 font-semibold bg-green-50 px-3 py-1 rounded-full">
              {filteredIssues.length} results found
            </span>
          )}
        </div>
        
        <div className="space-y-4">
          {/* ENHANCED Global Search - More Prominent */}
          <div className="bg-gradient-to-r from-green-50 to-lime-50 p-4 rounded-lg border-2 border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <label className="text-sm font-bold text-gray-700">
                🔍 Quick Search
              </label>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Type to search by name, portfolio, issue details, or case number..."
              className="w-full px-4 py-3 border-2 border-green-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all shadow-sm"
            />
            {searchQuery && (
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-gray-600">
                  Found <span className="font-bold text-green-600">{filteredIssues.length}</span> matching issue(s)
                </span>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-red-600 hover:text-red-800 font-medium flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear Search
                </button>
              </div>
            )}
          </div>

          {/* Issue Filter - Default to "Issues Yes" */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Issue Filter
            </label>
            <select
              value={filters.issueFilter}
              onChange={(e) => handleFilterChange('issueFilter', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="yes">Issues Yes (Default)</option>
              <option value="all">All Issues</option>
            </select>
          </div>

          {/* Checkbox Filter */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="showMissedOnly"
              checked={filters.showMissedOnly}
              onChange={(e) => handleFilterChange('showMissedOnly', e.target.checked)}
              className="w-4 h-4 border-gray-300 rounded focus:ring-green-500"
              style={{ accentColor: '#76AB3F' }}
            />
            <label htmlFor="showMissedOnly" className="ml-2 text-sm font-medium text-gray-700">
              Show Missed Issues Only
            </label>
          </div>

          {/* User Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Search by "Missed By" Name
              </label>
              <input
                type="text"
                value={filters.missedBy}
                onChange={(e) => handleFilterChange('missedBy', e.target.value)}
                placeholder="Type person's name who missed issues..."
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Search by "Monitored By" Name
              </label>
              <input
                type="text"
                value={filters.monitoredBy}
                onChange={(e) => handleFilterChange('monitoredBy', e.target.value)}
                placeholder="Type person's name who monitored..."
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Date Filters with Quick Buttons */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              📅 Date Range Filter
            </label>
            
            {/* Quick Date Range Buttons */}
            <div className="flex flex-wrap gap-2 mb-3">
              <button
                onClick={() => {
                  const today = new Date().toISOString().split('T')[0];
                  handleFilterChange('startDate', today);
                  handleFilterChange('endDate', today);
                }}
                className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold hover:bg-blue-200 transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => {
                  const yesterday = new Date();
                  yesterday.setDate(yesterday.getDate() - 1);
                  const dateStr = yesterday.toISOString().split('T')[0];
                  handleFilterChange('startDate', dateStr);
                  handleFilterChange('endDate', dateStr);
                }}
                className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold hover:bg-blue-200 transition-colors"
              >
                Yesterday
              </button>
              <button
                onClick={() => {
                  const lastWeek = new Date();
                  lastWeek.setDate(lastWeek.getDate() - 7);
                  const today = new Date().toISOString().split('T')[0];
                  handleFilterChange('startDate', lastWeek.toISOString().split('T')[0]);
                  handleFilterChange('endDate', today);
                }}
                className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-xs font-semibold hover:bg-purple-200 transition-colors"
              >
                Last 7 Days
              </button>
              <button
                onClick={() => {
                  const lastMonth = new Date();
                  lastMonth.setDate(lastMonth.getDate() - 30);
                  const today = new Date().toISOString().split('T')[0];
                  handleFilterChange('startDate', lastMonth.toISOString().split('T')[0]);
                  handleFilterChange('endDate', today);
                }}
                className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-xs font-semibold hover:bg-purple-200 transition-colors"
              >
                Last 30 Days
              </button>
              <button
                onClick={() => {
                  const firstDay = new Date();
                  firstDay.setDate(1);
                  const today = new Date().toISOString().split('T')[0];
                  handleFilterChange('startDate', firstDay.toISOString().split('T')[0]);
                  handleFilterChange('endDate', today);
                }}
                className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-semibold hover:bg-green-200 transition-colors"
              >
                This Month
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  From Date
                </label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  To Date
                </label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
            {(filters.startDate || filters.endDate) && (
              <div className="mt-2 text-xs text-gray-600">
                {filters.startDate && filters.endDate ? (
                  <span>Showing issues from <span className="font-bold">{filters.startDate}</span> to <span className="font-bold">{filters.endDate}</span></span>
                ) : filters.startDate ? (
                  <span>Showing issues from <span className="font-bold">{filters.startDate}</span> onwards</span>
                ) : (
                  <span>Showing issues up to <span className="font-bold">{filters.endDate}</span></span>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 bg-gray-600 text-white rounded text-sm font-medium hover:bg-gray-700 transition-colors"
            >
              Clear Filters
            </button>
            <button
              onClick={handleExportToCSV}
              className="px-4 py-2 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 transition-colors"
            >
              Export to CSV
            </button>
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded">
              <span className="text-sm font-medium text-gray-700">
                Showing {filteredIssues.length} of {issues.length} issues
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#76AB3F]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Portfolio
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Missed By
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Monitored By
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Details
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredIssues.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-12 text-center">
                    <div className="text-gray-500 font-medium">No issues found matching the filters</div>
                    <button
                      onClick={handleClearFilters}
                      className="text-green-600 hover:text-green-800 text-sm font-medium mt-2"
                    >
                      Clear filters to see all issues
                    </button>
                  </td>
                </tr>
              ) : (
                filteredIssues.map((issue) => (
                  <tr key={issue.issue_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                      {new Date(issue.created_at).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {issue.portfolio_name}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${
                        (issue.issue_present || '').toLowerCase() === 'yes' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {(issue.issue_present || '').toLowerCase() === 'yes' ? 'Issue' : 'No Issue'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {issue.issues_missed_by ? (
                        <span className="inline-flex px-2 py-1 bg-orange-100 text-orange-800 rounded font-medium text-xs">
                          {issue.issues_missed_by}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">N/A</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {issue.monitored_by || <span className="text-gray-400 text-xs">N/A</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 max-w-xs">
                      <div className="truncate" title={issue.issue_details}>
                        {issue.issue_details || <span className="text-gray-400 text-xs italic">No details</span>}
                      </div>
                      {issue.case_number && (
                        <div className="text-xs text-gray-600 mt-1">Case: {issue.case_number}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onEditIssue(issue)}
                          className="px-3 py-1.5 text-white rounded font-medium transition-colors text-sm"
                          style={{ backgroundColor: '#76AB3F' }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#5a8f2f'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = '#76AB3F'}
                        >
                          Edit
                        </button>
                        {isAdmin && onDeleteIssue && (
                          <button
                            onClick={() => onDeleteIssue(issue)}
                            className="px-3 py-1.5 text-white rounded font-medium transition-colors text-sm"
                            style={{ backgroundColor: '#dc2626' }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#b91c1c'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = '#dc2626'}
                            title="Delete this issue (Admin only)"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default IssuesByUser;
