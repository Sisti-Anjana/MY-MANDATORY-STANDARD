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

const PerformanceAnalytics = ({ issues, portfolios }) => {
  const [range, setRange] = useState('today');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

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
          issues: 0,
          issuesYes: 0,
          portfolios: new Set(),
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
      // Portfolio tracking
      const portfolioName = resolvePortfolioName(issue, portfolios);
      if (portfolioName && portfolioName !== 'Unknown') {
        bucket.portfolios.add(portfolioName);
      }
    });

    const perUserStats = Object.values(perUserMap).map((u) => ({
      ...u,
      portfoliosCount: u.portfolios.size,
      hoursCount: u.hours.size
    }));

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
        issuesYes: byIssuesYes.slice(0, 3),
        coverage: byCoverage.slice(0, 3),
        hours: byHours.slice(0, 3)
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
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Range</span>
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
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Start Date</label>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 w-full"
              max={customEnd || undefined}
            />
          </div>
          <div className="flex flex-col max-w-[180px]">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">End Date</label>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 w-full"
              min={customStart || undefined}
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

      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[150px] max-w-[200px]">
          <MetricCard label="Overall Coverage" value={`${Math.round(analytics.overallCoverage)}%`} accent="text-green-600" highlight="bg-gradient-to-r from-emerald-50 to-green-100" />
        </div>
        <div className="flex-1 min-w-[150px] max-w-[200px]">
          <MetricCard label="Portfolios Checked" value={analytics.portfoliosChecked} helper={`of ${analytics.totalPortfolios}`} highlight="bg-gradient-to-r from-blue-50 to-sky-100" />
        </div>
        <div className="flex-1 min-w-[150px] max-w-[200px]">
          <MetricCard label="Active Hours" value={`${analytics.activeHours}/24`} highlight="bg-gradient-to-r from-amber-50 to-orange-100" />
        </div>
        <div className="flex-1 min-w-[150px] max-w-[200px]">
          <MetricCard label="Issues Logged" value={analytics.totalIssuesLogged} highlight="bg-gradient-to-r from-purple-50 to-indigo-100" />
        </div>
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
              <dt>Total issues logged</dt>
              <dd className="font-semibold text-gray-900">{analytics.totalIssuesLogged}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Active monitoring hours</dt>
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
          <CompactPanel title="Top Performers" description="Leaders by coverage and findings" iconBg="bg-purple-200">
            <LeaderboardBlock label="Most issues (Yes)" items={analytics.leaderboard.issuesYes} metricKey="issuesYes" fallback="No data" />
            <div className="mt-3 border-t border-gray-100 pt-3">
              <LeaderboardBlock label="Most portfolios covered" items={analytics.leaderboard.coverage} metricKey="portfoliosCount" fallback="No data" />
            </div>
            <div className="mt-3 border-t border-gray-100 pt-3">
              <LeaderboardBlock label="Most active hours" items={analytics.leaderboard.hours} metricKey="hoursCount" fallback="No data" />
            </div>
          </CompactPanel>

          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Team Performance (per user)</h3>
                <p className="text-sm text-gray-500">Filtered by the selected range ({RANGE_OPTIONS.find(r => r.value === range)?.label})</p>
              </div>
              <button
                onClick={() => {
                  const header = ['User', 'Total Issues', 'Issues Yes', 'Portfolios Covered', 'Hours Active'];
                  const rows = analytics.perUserStats.map(u => [
                    u.user,
                    u.issues,
                    u.issuesYes,
                    u.portfoliosCount,
                    u.hoursCount
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
                className="px-4 py-2 text-sm font-medium text-white rounded-lg shadow transition-colors"
                style={{ backgroundColor: '#76AB3F' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#5a8f2f')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#76AB3F')}
              >
                Export Data
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wide">
                  <tr>
                    <th className="px-3 py-2">User</th>
                    <th className="px-3 py-2 text-right">Issues</th>
                    <th className="px-3 py-2 text-right">Issues Yes</th>
                    <th className="px-3 py-2 text-right">Portfolios</th>
                    <th className="px-3 py-2 text-right">Hours</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-800">
                  {analytics.perUserStats.map((u) => (
                    <tr key={u.user}>
                      <td className="px-3 py-2 font-semibold text-gray-900">{u.user}</td>
                      <td className="px-3 py-2 text-right">{u.issues}</td>
                      <td className="px-3 py-2 text-right">{u.issuesYes}</td>
                      <td className="px-3 py-2 text-right">{u.portfoliosCount}</td>
                      <td className="px-3 py-2 text-right">{u.hoursCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
    <div className="text-[10px] font-semibold text-gray-600 uppercase tracking-wide">{label}</div>
    <div className={`mt-0.5 text-lg font-bold text-gray-900 ${accent || ''}`}>{value}</div>
    {helper && <div className="text-[10px] text-gray-600 mt-0.5">Total {helper}</div>}
  </div>
);

const CompactPanel = ({ title, description, iconBg, children }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm space-y-3">
    <div className="flex items-start gap-2">
      <div className={`w-9 h-9 ${iconBg} rounded-lg flex items-center justify-center`}>
        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
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

const LeaderboardBlock = ({ label, items = [], metricKey, fallback = 'No data' }) => (
  <div>
    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</div>
    {items && items.length > 0 ? (
      <div className="flex flex-col gap-1">
        {items.map((item, idx) => (
          <div key={item.user} className="flex items-center justify-between text-sm text-gray-800">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-600 text-[11px] font-semibold flex items-center justify-center">{idx + 1}</span>
              <span className="font-semibold">{item.user}</span>
            </div>
            <span className="text-gray-700 font-semibold">{item[metricKey]}</span>
          </div>
        ))}
      </div>
    ) : (
      <div className="text-sm text-gray-500">{fallback}</div>
    )}
  </div>
);
