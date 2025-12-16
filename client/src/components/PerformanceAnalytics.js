/* eslint-disable */
import React, { useMemo, useState } from 'react';

const RANGE_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: '7days', label: 'Last 7 days' },
  { value: 'custom', label: 'Custom Range' }
];

// Resolve portfolio name from multiple possible shapes
const resolvePortfolioName = (issue, portfolios = []) => {
  if (issue?.portfolio_name) return issue.portfolio_name;
  if (issue?.portfolios?.name) return issue.portfolios.name;
  if (issue?.portfolio_id) {
    const match = portfolios.find(
      (p) => (p.portfolio_id || p.id) === issue.portfolio_id
    );
    if (match?.name) return match.name;
  }
  return 'Unknown';
};

const PerformanceAnalytics = ({ issues, portfolios, userDisplayMap = {} }) => {
  const [range, setRange] = useState('today');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [selectedPerformer, setSelectedPerformer] = useState(null);
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

  const rangeConfig = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    let start = new Date(startOfToday);
    let end = new Date(startOfToday);
    end.setHours(23, 59, 59, 999);

    if (range === 'yesterday') {
      start = new Date(startOfToday);
      start.setDate(start.getDate() - 1);
      end = new Date(start);
      end.setHours(23, 59, 59, 999);
    } else if (range === '7days') {
      start = new Date(startOfToday);
      start.setDate(start.getDate() - 6);
    } else if (range === 'custom') {
      if (customStart) {
        start = new Date(customStart);
        start.setHours(0, 0, 0, 0);
      }
      if (customEnd) {
        end = new Date(customEnd);
        end.setHours(23, 59, 59, 999);
      }
    }

    const filteredIssues = issues.filter(issue => {
      const createdAt = new Date(issue.created_at);
      if (Number.isNaN(createdAt.getTime())) return false;
      return createdAt >= start && createdAt <= end;
    });

    return {
      range,
      start,
      end,
      filteredIssues
    };
  }, [issues, range, customStart, customEnd]);

  const displayName = (name) => {
    if (!name) return 'Unknown';
    const key = name.toLowerCase();
    return (userDisplayMap && userDisplayMap[key]) || name;
  };

  const analytics = useMemo(() => {
    const dataset = rangeConfig.filteredIssues;
    const referenceDate = new Date(rangeConfig.end);
    referenceDate.setHours(0, 0, 0, 0);

    // Filter today's issues
    const periodIssues = dataset;

    // Calculate hourly coverage
    const hourlyCoverage = Array.from({ length: 24 }, (_, hour) => {
      const hourIssues = periodIssues.filter(issue => issue.issue_hour === hour);
      const uniquePortfolios = new Set(hourIssues.map(issue => issue.portfolio_name));
      return {
        hour,
        coverage: portfolios.length > 0 ? (uniquePortfolios.size / portfolios.length) * 100 : 0,
        portfoliosChecked: uniquePortfolios.size
      };
    });

    // Find peak and lowest coverage hours
    const peakHour = hourlyCoverage.reduce((max, current) => 
      current.coverage > max.coverage ? current : max
    );
    const lowestHour = hourlyCoverage.reduce((min, current) => 
      current.coverage < min.coverage ? current : min
    );

    // Calculate hours with 100% coverage
    const fullCoverageHours = hourlyCoverage.filter(h => h.coverage === 100).length;

    // Calculate overall 24-hour coverage
    const uniquePortfoliosToday = new Set(periodIssues.map(issue => issue.portfolio_name));
    const totalPortfolios = portfolios.length || 26;
    const overallCoverage = (uniquePortfoliosToday.size / totalPortfolios) * 100;

    // Calculate performance score (0-10)
    const avgCoverage = hourlyCoverage.reduce((sum, h) => sum + h.coverage, 0) / 24;
    const performanceScore = Math.round((avgCoverage / 10));

    // Calculate total issues logged
    const totalIssuesLogged = periodIssues.length;

    // Calculate active hours
    const activeHours = hourlyCoverage.filter(h => h.portfoliosChecked > 0).length;

    // Calculate coverage consistency
    const hoursWithGoodCoverage = hourlyCoverage.filter(h => h.coverage >= 70).length;

    // Build per-user stats
    const perUserMap = {};
    periodIssues.forEach((issue) => {
      const userRaw = (issue.monitored_by || 'Unknown').trim();
      const user = userRaw || 'Unknown';
      if (!perUserMap[user]) {
        perUserMap[user] = {
          user,
          displayName: displayName(user),
          issues: 0,
          issuesYes: 0,
          missedAlerts: 0,
          portfolios: new Set(), // For display purposes
          portfolioVisits: new Set(), // Track unique portfolio visits
          portfolioIssues: [], // Store issues with times for visit detection
          hours: new Set()
        };
      }
      const bucket = perUserMap[user];
      bucket.issues += 1;
      if ((issue.issue_present || '').toString().toLowerCase() === 'yes') {
        bucket.issuesYes += 1;
      }
      // Hour tracking
      if (issue.issue_hour !== undefined && issue.issue_hour !== null) {
        bucket.hours.add(issue.issue_hour);
      }
      // Portfolio tracking - count visits, not issues
      const portfolioName = resolvePortfolioName(issue, portfolios);
      if (portfolioName && portfolioName !== 'Unknown') {
        bucket.portfolios.add(portfolioName); // For display
        
        // Store issue with time for visit detection
        if (!bucket.portfolioIssues) {
          bucket.portfolioIssues = [];
        }
        const issueTime = issue.created_at ? new Date(issue.created_at) : new Date();
        bucket.portfolioIssues.push({
          portfolio: portfolioName,
          time: issueTime
        });
      }
    });

    // Count missed alerts for each user separately
    // An issue is "missed" by a user if their name appears in issues_missed_by
    periodIssues.forEach((issue) => {
      if (issue.issues_missed_by) {
        const missedBy = issue.issues_missed_by.trim();
        if (missedBy) {
          // Check if any user in the map matches this missed_by value
          Object.keys(perUserMap).forEach(userKey => {
            if (missedBy.toLowerCase().includes(userKey.toLowerCase()) || userKey.toLowerCase().includes(missedBy.toLowerCase())) {
              perUserMap[userKey].missedAlerts += 1;
            }
          });
        }
      }
    });

    // Count missed alerts for each user separately
    // An issue is "missed" by a user if their name appears in issues_missed_by
    periodIssues.forEach((issue) => {
      if (issue.issues_missed_by) {
        const missedBy = issue.issues_missed_by.trim().toLowerCase();
        if (missedBy) {
          // Check if any user in the map matches this missed_by value
          Object.keys(perUserMap).forEach(userKey => {
            const userKeyLower = userKey.toLowerCase();
            // Match if the missed_by field contains the user name or vice versa
            if (missedBy.includes(userKeyLower) || userKeyLower.includes(missedBy)) {
              perUserMap[userKey].missedAlerts += 1;
            }
          });
        }
      }
    });

    const perUserStats = Object.values(perUserMap).map((u) => {
      // Detect portfolio visits based on time gaps (>15 minutes = new visit)
      const portfolioVisitsMap = {};
      if (u.portfolioIssues) {
        u.portfolioIssues.forEach(({ portfolio, time }) => {
          if (!portfolioVisitsMap[portfolio]) {
            portfolioVisitsMap[portfolio] = [];
          }
          portfolioVisitsMap[portfolio].push(time);
        });
      }

      let totalVisits = 0;
      // Count portfolio visits: each lock/unlock session = 1 visit
      // Group issues logged within 5 seconds as same lock session (1 visit)
      // Any gap > 5 seconds = new lock session = new visit
      const SESSION_GAP_MS = 5000; // 5 seconds - issues within this window = same lock session
      Object.keys(portfolioVisitsMap).forEach(portfolio => {
        const times = portfolioVisitsMap[portfolio].sort((a, b) => a - b);
        let visitCount = 0;
        let lastIssueTime = null;
        times.forEach(time => {
          // If first issue or gap > 5 seconds, it's a new lock session = new visit
          if (!lastIssueTime || (time - lastIssueTime) > SESSION_GAP_MS) {
            visitCount++;
          }
          lastIssueTime = time;
        });
        totalVisits += visitCount;
      });

      return {
        ...u,
        displayName: u.displayName || displayName(u.user),
        portfoliosCount: totalVisits, // Count portfolio visits based on time gaps
        hoursCount: u.hours.size
      };
    });

    // Leaderboards
    const byIssuesYes = [...perUserStats].sort((a, b) => b.issuesYes - a.issuesYes || b.issues - a.issues);
    const byCoverage = [...perUserStats].sort((a, b) => b.portfoliosCount - a.portfoliosCount || b.issues - a.issues);
    const byHours = [...perUserStats].sort((a, b) => b.hoursCount - a.hoursCount || b.issues - a.issues);

    return {
      peakHour,
      lowestHour,
      fullCoverageHours,
      overallCoverage,
      performanceScore,
      portfoliosChecked: uniquePortfoliosToday.size,
      totalPortfolios,
      totalIssuesLogged,
      activeHours,
      coverageConsistency: hoursWithGoodCoverage,
      perUserStats,
      leaderboard: {
        issuesYes: byIssuesYes.slice(0, 7),
        coverage: byCoverage.slice(0, 7),
        hours: byHours.slice(0, 7)
      }
    };
  }, [portfolios, rangeConfig]);

  const getPerformanceLabel = (score) => {
    if (score >= 8) return { text: 'Excellent', color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' };
    if (score >= 5) return { text: 'Good', color: 'text-lime-600', bgColor: 'bg-lime-50', borderColor: 'border-lime-200' };
    if (score >= 3) return { text: 'Fair', color: 'text-yellow-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' };
    return { text: 'Needs Improvement', color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' };
  };

  const performanceLabel = getPerformanceLabel(analytics.performanceScore);

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Performance Analytics</h2>
          <p className="text-sm text-gray-500">Coverage, activity, and portfolio insights</p>
        </div>
        <div className={`px-4 py-3 rounded-lg border ${performanceLabel.borderColor} bg-white flex items-center gap-4 shadow-sm`}>
          <div className="relative w-12 h-12">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#e5e7eb" strokeWidth="3.5" />
              <circle
                cx="18"
                cy="18"
                r="15.915"
                fill="none"
                stroke={performanceLabel.color.replace('text-', '#')}
                strokeWidth="3.5"
                strokeDasharray={`${(analytics.performanceScore / 10) * 100}, 100`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-sm font-bold ${performanceLabel.color}`}>{analytics.performanceScore}</span>
              <span className="text-[8px] text-gray-500">/10</span>
            </div>
          </div>
          <div>
            <div className={`text-sm uppercase font-semibold tracking-wide ${performanceLabel.color}`}>
              {performanceLabel.text}
            </div>
            <div className="text-xs text-gray-500">24h coverage score</div>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-gray-500 tracking-wide">Range</span>
        <div className="flex gap-2 flex-wrap">
          {RANGE_OPTIONS.map(option => (
            <button
              key={option.value}
              onClick={() => setRange(option.value)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors ${
                range === option.value
                  ? 'bg-green-600 text-white border-green-600 shadow-sm'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-600'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <span className="text-xs text-gray-500">
          Showing {rangeConfig.filteredIssues.length} issue{rangeConfig.filteredIssues.length === 1 ? '' : 's'}.
        </span>
      </div>

      {range === 'custom' && (
        <div className="flex flex-wrap items-center gap-3 bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
          <div className="flex flex-col max-w-[180px]">
            <label className="text-xs font-semibold text-gray-600 tracking-wide mb-1">Start Date</label>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 w-full"
            />
          </div>
          <div className="flex flex-col max-w-[180px]">
            <label className="text-xs font-semibold text-gray-600 tracking-wide mb-1">End Date</label>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 w-full"
            />
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={() => {
                // If no dates set, default to today
                if (!customStart || !customEnd) {
                  const today = new Date();
                  const iso = today.toISOString().split('T')[0];
                  setCustomStart(iso);
                  setCustomEnd(iso);
                }
              }}
              className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              Apply
            </button>
            <button
              onClick={() => {
                const today = new Date();
                const iso = today.toISOString().split('T')[0];
                setCustomStart(iso);
                setCustomEnd(iso);
              }}
              className="px-3 py-1.5 bg-white text-gray-700 text-xs font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-4 gap-3 max-w-3xl">
        <MetricCard label="Overall Coverage" value={`${Math.round(analytics.overallCoverage)}%`} accent="text-green-600" highlight="bg-gradient-to-r from-emerald-50 to-green-100" />
        <MetricCard label="Portfolios Checked" value={analytics.portfoliosChecked} highlight="bg-gradient-to-r from-blue-50 to-sky-100" />
        <MetricCard label="Monitoring Active Hours" value={`${analytics.activeHours}/24`} highlight="bg-gradient-to-r from-amber-50 to-orange-100" />
        <MetricCard label="Issues Logged" value={analytics.totalIssuesLogged} highlight="bg-gradient-to-r from-purple-50 to-indigo-100" />
      </div>

      {rangeConfig.filteredIssues.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm rounded-lg px-4 py-3">
          No monitoring activity recorded for the selected range.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <CompactPanel title="Coverage Window" description="Hourly distribution of coverage" iconBg="bg-green-200">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Peak hour</span>
            <span className="font-semibold text-green-600">{analytics.peakHour.hour}:00</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>Lowest hour</span>
            <span className="font-semibold text-red-500">{analytics.lowestHour.hour}:00</span>
          </div>
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Hours with full coverage</span>
              <span>{analytics.fullCoverageHours}/24</span>
            </div>
            <ProgressBar value={analytics.fullCoverageHours} max={24} color="from-green-500 to-emerald-500" />
          </div>
        </CompactPanel>

        <CompactPanel title="Activity Snapshot" description="What’s been logged so far" iconBg="bg-blue-200">
          <dl className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <dt>Total Count</dt>
              <dd className="font-semibold text-gray-900">{analytics.totalIssuesLogged}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Monitoring Active Hours</dt>
              <dd className="font-semibold text-gray-900">{analytics.activeHours}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Consistent hours (70%+)</dt>
              <dd className="font-semibold text-gray-900">{analytics.coverageConsistency}</dd>
            </div>
          </dl>
          <div className="mt-3 text-[11px] text-gray-500">
            Consistency measures how many hours met the 70% coverage benchmark.
          </div>
        </CompactPanel>

        <CompactPanel title="Portfolio Coverage" description="How many portfolios have been touched" iconBg="bg-amber-200">
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>Checked</span>
                <span>{analytics.portfoliosChecked}</span>
              </div>
              <ProgressBar
                value={analytics.portfoliosChecked}
                max={analytics.totalPortfolios}
                color="from-emerald-500 to-green-500"
              />
            </div>
            <div>
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>Need attention</span>
                <span>{analytics.totalPortfolios - analytics.portfoliosChecked}</span>
              </div>
              <ProgressBar
                value={analytics.totalPortfolios - analytics.portfoliosChecked}
                max={analytics.totalPortfolios}
                color="from-orange-500 to-red-500"
              />
            </div>
          </div>
        </CompactPanel>
      </div>

      {analytics.perUserStats && analytics.perUserStats.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-900">Top Performers</h3>
              <p className="text-xs text-gray-500 mt-0.5">Leaders by coverage and findings</p>
            </div>
            <div className="p-5 space-y-6">
              <LeaderboardBlock 
                label="Most Total Portfolios Monitored" 
                items={analytics.leaderboard.coverage} 
                metricKey="portfoliosCount" 
                fallback="No data"
                onItemClick={setSelectedPerformer}
                allUserStats={analytics.perUserStats}
              />
              <div className="border-t border-gray-200 pt-5">
                <LeaderboardBlock 
                  label="Most Active Issues" 
                  items={analytics.leaderboard.issuesYes} 
                  metricKey="issuesYes" 
                  fallback="No data"
                  onItemClick={setSelectedPerformer}
                  allUserStats={analytics.perUserStats}
                />
              </div>
              <div className="border-t border-gray-200 pt-5">
                <LeaderboardBlock 
                  label="Most Monitoring Active Hours" 
                  items={analytics.leaderboard.hours} 
                  metricKey="hoursCount" 
                  fallback="No data"
                  onItemClick={setSelectedPerformer}
                  allUserStats={analytics.perUserStats}
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4" style={{ backgroundColor: '#76AB3F' }}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">Team Performance</h3>
                  <p className="text-sm text-white/90 mt-0.5">Filtered by: {RANGE_OPTIONS.find(r => r.value === range)?.label}</p>
                </div>
                <button
                  onClick={() => {
                    const header = ['User', 'Total Count', 'Total Portfolios Monitored', 'Monitoring Active Hours', 'Missed Alerts'];
                    const rows = analytics.perUserStats.map(u => [
                      u.displayName || u.user,
                      u.issues,
                      u.portfoliosCount,
                      u.hoursCount,
                      u.missedAlerts || 0
                    ]);
                    const csvContent = [header, ...rows]
                      .map(row => row.map(cell => `"${cell}"`).join(','))
                      .join('\n');
                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                    const link = document.createElement('a');
                    const url = URL.createObjectURL(blob);
                    link.setAttribute('href', url);
                    link.setAttribute('download', `user-performance-${range}-${new Date().toISOString().split('T')[0]}.csv`);
                    link.style.visibility = 'hidden';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="px-4 py-2 text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all hover:scale-105 flex items-center gap-2"
                  style={{ backgroundColor: '#76AB3F', color: 'white' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#5a8f2f')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#76AB3F')}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export Data
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 tracking-wider border-b border-gray-200">User</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 tracking-wider border-b border-gray-200">Total Count</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 tracking-wider border-b border-gray-200">Total Portfolios Monitored</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 tracking-wider border-b border-gray-200">Monitoring Active Hours</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 tracking-wider border-b border-gray-200">Missed Alerts</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {analytics.perUserStats.map((u, idx) => (
                    <tr 
                      key={u.user} 
                      className={`transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                      style={{ '--hover-color': 'rgba(118, 171, 63, 0.1)' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(118, 171, 63, 0.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = idx % 2 === 0 ? 'white' : 'rgba(0, 0, 0, 0.02)'}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm" style={{ backgroundColor: '#76AB3F' }}>
                            {(u.displayName || u.user || '?').charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-bold text-gray-900">{u.displayName || u.user}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-sm font-semibold text-gray-900">{u.issues}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                          {u.portfoliosCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 text-purple-800">
                          {u.hoursCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                          (u.missedAlerts || 0) === 0 
                            ? 'text-white' 
                            : (u.missedAlerts || 0) <= 3 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-red-100 text-red-800'
                        }`}
                        style={(u.missedAlerts || 0) === 0 ? { backgroundColor: '#76AB3F' } : {}}
                        >
                          {u.missedAlerts || 0}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Performer Details Modal */}
      {selectedPerformer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedPerformer(null)}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Header with gradient */}
            <div className="px-4 py-3 text-white" style={{ backgroundColor: '#76AB3F' }}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold">Top Performer Details</h3>
                  <p className="text-xs text-white/90 mt-0.5">Performance breakdown</p>
                </div>
                <button
                  onClick={() => setSelectedPerformer(null)}
                  className="text-white/80 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded p-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-4 space-y-3">
              {/* User Info Card */}
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold text-white ${
                    selectedPerformer.rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                    selectedPerformer.rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                    selectedPerformer.rank === 3 ? 'bg-gradient-to-br from-orange-300 to-orange-500' :
                    'bg-gradient-to-br from-gray-400 to-gray-600'
                  }`}>
                    {selectedPerformer.rank}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-gray-900">{selectedPerformer.displayName || selectedPerformer.user}</h4>
                    <p className="text-xs text-gray-600">Rank #{selectedPerformer.rank} in this category</p>
                  </div>
                </div>
              </div>

              {/* Category Info */}
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1 h-4 rounded" style={{ backgroundColor: '#76AB3F' }}></div>
                  <h5 className="text-xs font-bold text-gray-500 tracking-wide">Category Information</h5>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <span className="text-xs text-gray-500">Category</span>
                    <span className="text-xs font-semibold text-gray-900">{selectedPerformer.category}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <span className="text-xs text-gray-500">Metric</span>
                    <span className="text-xs font-semibold text-gray-900">{selectedPerformer.metric}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-xs text-gray-500">Achieved Value</span>
                    <span className="text-base font-bold" style={{ color: '#76AB3F' }}>{selectedPerformer.value}</span>
                  </div>
                </div>
              </div>

              {/* Why Top List */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5">
                <p className="text-xs font-semibold text-blue-900 mb-1">Why they're in the top list</p>
                <p className="text-xs text-blue-800 leading-relaxed">
                  {(selectedPerformer.displayName || selectedPerformer.user)} achieved <strong className="font-bold">{selectedPerformer.value}</strong> {selectedPerformer.metric.toLowerCase()}, ranking them #{selectedPerformer.rank} among all team members in the "{selectedPerformer.category}" category.
                </p>
              </div>

              {/* Additional Performance Metrics */}
              {selectedPerformer.fullStats && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-4 rounded" style={{ backgroundColor: '#76AB3F' }}></div>
                    <h5 className="text-xs font-bold text-gray-500 tracking-wide">Complete Performance Metrics</h5>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5">
                      <p className="text-xs font-semibold text-blue-700 mb-1">Total Count</p>
                      <p className="text-lg font-bold text-blue-900">{selectedPerformer.fullStats.issues || 0}</p>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-2.5">
                      <p className="text-xs font-semibold text-red-700 mb-1">Active Issues</p>
                      <p className="text-lg font-bold text-red-900">{selectedPerformer.fullStats.issuesYes || 0}</p>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-2.5">
                      <p className="text-xs font-semibold text-purple-700 mb-1">Active Hours</p>
                      <p className="text-lg font-bold text-purple-900">{selectedPerformer.fullStats.hoursCount || 0}</p>
                    </div>
                    <div className={`border rounded-lg p-2.5 ${
                      (selectedPerformer.fullStats.missedAlerts || 0) === 0 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-orange-50 border-orange-200'
                    }`}>
                      <p className={`text-xs font-semibold mb-1 ${(selectedPerformer.fullStats.missedAlerts || 0) === 0 ? 'text-green-700' : 'text-orange-700'}`}>Missed Alerts</p>
                      <p className={`text-lg font-bold ${(selectedPerformer.fullStats.missedAlerts || 0) === 0 ? 'text-green-900' : 'text-orange-900'}`}>
                        {selectedPerformer.fullStats.missedAlerts || 0}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setSelectedPerformer(null)}
                className="px-4 py-1.5 text-xs font-semibold text-white rounded-lg transition-colors"
                style={{ backgroundColor: '#76AB3F' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#5a8f2f')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#76AB3F')}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceAnalytics;

const MetricCard = ({ label, value, helper, accent, highlight }) => (
  <div className={`border border-gray-200 rounded-lg p-2 shadow-sm w-full ${highlight || 'bg-white'}`}>
    <div className="text-[10px] font-semibold text-gray-600 tracking-wide">{label}</div>
    <div className={`mt-0.5 text-lg font-bold text-gray-900 ${accent || ''}`}>{value}</div>
    {helper && <div className="text-[10px] text-gray-600 mt-0.5">Total {helper}</div>}
  </div>
);

const CompactPanel = ({ title, description, children }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm space-y-3">
    <div className="flex items-start">
      <div>
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </div>
    <div className="pt-2 border-t border-gray-100">
      {children}
    </div>
  </div>
);

const ProgressBar = ({ value, max, color }) => {
  const percent = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
      <div
        className={`h-2 bg-gradient-to-r ${color}`}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
};

const LeaderboardBlock = ({ label, items = [], metricKey, fallback = 'No data', onItemClick, allUserStats }) => {
  const getMetricDescription = (metricKey) => {
    switch(metricKey) {
      case 'portfoliosCount':
        return 'Total Portfolios Monitored';
      case 'issuesYes':
        return 'Active Issues';
      case 'hoursCount':
        return 'Monitoring Active Hours';
      default:
        return metricKey;
    }
  };

  return (
    <div>
      <h4 className="text-xs font-semibold text-gray-600 tracking-wide mb-3">{label}</h4>
      {items && items.length > 0 ? (
        <div className="space-y-2">
          {items.map((item, idx) => {
            const isTopThree = idx < 3;
            // Find complete user stats
            const fullUserStats = allUserStats?.find(u => u.user === item.user);
            return (
              <div 
                key={item.user} 
                onClick={() => onItemClick && onItemClick({
                  user: item.user,
                  displayName: item.displayName || item.user,
                  rank: idx + 1,
                  value: item[metricKey],
                  category: label,
                  metric: getMetricDescription(metricKey),
                  fullStats: fullUserStats
                })}
                className={`flex items-center justify-between py-2.5 px-3 rounded-lg transition-all cursor-pointer ${
                  isTopThree 
                    ? 'bg-gray-50 border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-semibold flex-shrink-0 ${
                    idx === 0 ? 'bg-green-100 text-green-700' :
                    idx === 1 ? 'bg-blue-100 text-blue-700' :
                    idx === 2 ? 'bg-purple-100 text-purple-700' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {idx + 1}
                  </div>
                  <span className={`text-sm truncate ${isTopThree ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                    {item.displayName || item.user}
                  </span>
                </div>
                <span className={`text-sm ml-3 flex-shrink-0 px-2.5 py-1 rounded ${
                  isTopThree 
                    ? 'font-bold text-gray-900 bg-white border border-gray-200' 
                    : 'font-semibold text-gray-700'
                }`}>
                  {item[metricKey]}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-sm text-gray-400 py-3 text-center">{fallback}</div>
      )}
    </div>
  );
};
