import React, { useMemo } from 'react';

const PerformanceAnalytics = ({ issues, portfolios }) => {
  const analytics = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Filter today's issues
    const todayIssues = issues.filter(issue => {
      const issueDate = new Date(issue.created_at);
      issueDate.setHours(0, 0, 0, 0);
      return issueDate.getTime() === today.getTime();
    });

    // Calculate hourly coverage
    const hourlyCoverage = Array.from({ length: 24 }, (_, hour) => {
      const hourIssues = todayIssues.filter(issue => issue.issue_hour === hour);
      const uniquePortfolios = new Set(hourIssues.map(issue => issue.portfolio_name));
      return {
        hour,
        coverage: (uniquePortfolios.size / 26) * 100,
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
    const uniquePortfoliosToday = new Set(todayIssues.map(issue => issue.portfolio_name));
    const overallCoverage = (uniquePortfoliosToday.size / 26) * 100;

    // Calculate performance score (0-10)
    const avgCoverage = hourlyCoverage.reduce((sum, h) => sum + h.coverage, 0) / 24;
    const performanceScore = Math.round((avgCoverage / 10));

    // Calculate total issues logged
    const totalIssuesLogged = issues.filter(issue => {
      const issueDate = new Date(issue.created_at);
      const daysDiff = (today - issueDate) / (1000 * 60 * 60 * 24);
      return daysDiff <= 1;
    }).length;

    // Calculate active hours
    const activeHours = hourlyCoverage.filter(h => h.portfoliosChecked > 0).length;

    // Calculate coverage consistency
    const hoursWithGoodCoverage = hourlyCoverage.filter(h => h.coverage >= 70).length;

    return {
      peakHour,
      lowestHour,
      fullCoverageHours,
      overallCoverage,
      performanceScore,
      portfoliosChecked: uniquePortfoliosToday.size,
      totalPortfolios: 26,
      totalIssuesLogged,
      activeHours,
      coverageConsistency: hoursWithGoodCoverage
    };
  }, [issues, portfolios]);

  const getPerformanceLabel = (score) => {
    if (score >= 8) return { text: 'Excellent', color: 'text-green-600' };
    if (score >= 5) return { text: 'Good', color: 'text-blue-600' };
    if (score >= 3) return { text: 'Fair', color: 'text-yellow-600' };
    return { text: 'Needs Improvement', color: 'text-red-600' };
  };

  const performanceLabel = getPerformanceLabel(analytics.performanceScore);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Performance Analytics</h2>
        <p className="text-sm text-gray-600 mt-1">
          Comprehensive monitoring performance metrics and insights
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Coverage Statistics */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Coverage Statistics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Peak Coverage Hour</span>
              <span className="text-lg font-bold text-green-600">
                {analytics.peakHour.hour}:00
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Lowest Coverage Hour</span>
              <span className="text-lg font-bold text-red-600">
                {analytics.lowestHour.hour}:00
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Hours with 100% Coverage</span>
              <span className="text-lg font-bold text-blue-600">
                {analytics.fullCoverageHours} / 24
              </span>
            </div>
          </div>
        </div>

        {/* Performance Score */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Score</h3>
          <div className="flex flex-col items-center justify-center py-4">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="3"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="none"
                  stroke={analytics.performanceScore >= 5 ? '#3b82f6' : '#ef4444'}
                  strokeWidth="3"
                  strokeDasharray={`${(analytics.performanceScore / 10) * 100}, 100`}
                  transform="rotate(-90 18 18)"
                />
                <text
                  x="18"
                  y="18"
                  textAnchor="middle"
                  dy="0.3em"
                  className="text-3xl font-bold fill-gray-900"
                >
                  {analytics.performanceScore}
                </text>
                <text
                  x="18"
                  y="25"
                  textAnchor="middle"
                  className="text-xs fill-gray-600"
                >
                  Score
                </text>
              </svg>
            </div>
            <p className={`mt-4 text-lg font-semibold ${performanceLabel.color}`}>
              {performanceLabel.text}
            </p>
          </div>
        </div>
      </div>

      {/* 24-Hour Overall Coverage */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <svg className="w-6 h-6 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900">24-Hour Overall Coverage</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Percentage of unique portfolios monitored across the entire day
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-4">
            <div className="relative w-40 h-40 mx-auto">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="3"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="none"
                  stroke={analytics.overallCoverage >= 50 ? '#10b981' : '#ef4444'}
                  strokeWidth="3"
                  strokeDasharray={`${analytics.overallCoverage}, 100`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-gray-900">
                  {Math.round(analytics.overallCoverage)}%
                </span>
                <span className="text-sm text-gray-600">Coverage</span>
              </div>
            </div>
            <div className={`mt-4 text-center flex items-center justify-center gap-2 ${
              analytics.overallCoverage >= 50 ? 'text-green-600' : 'text-red-600'
            }`}>
              {analytics.overallCoverage >= 50 ? '✓' : '✕'}
              <span className="font-medium">
                {analytics.overallCoverage >= 50 ? 'Good Coverage' : 'Low Coverage'}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4">
              <h4 className="text-2xl font-bold text-purple-600 mb-1">
                {analytics.portfoliosChecked}
              </h4>
              <p className="text-sm text-gray-600">Out of {analytics.totalPortfolios} total</p>
              <p className="text-xs text-gray-500 mt-1">Portfolios Checked</p>
            </div>

            <div className="bg-white rounded-lg p-4">
              <h4 className="text-2xl font-bold text-red-600 mb-1">
                {analytics.totalPortfolios - analytics.portfoliosChecked}
              </h4>
              <p className="text-sm text-gray-600">Need attention</p>
              <p className="text-xs text-gray-500 mt-1">Unchecked Portfolios</p>
            </div>
          </div>
        </div>

        {/* Coverage Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium text-gray-700">Coverage Progress</span>
            <span className="text-gray-600">
              {analytics.portfoliosChecked} / {analytics.totalPortfolios}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className={`h-4 rounded-full ${
                analytics.overallCoverage >= 70 ? 'bg-green-500' :
                analytics.overallCoverage >= 40 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${analytics.overallCoverage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-2">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="text-sm font-semibold text-blue-900 mb-1">What does this metric show?</h4>
              <p className="text-sm text-blue-800">
                This shows the percentage of unique portfolios that were checked <strong>at least once</strong> during 
                the selected time period, regardless of which hour they were checked. It helps you understand your overall 
                portfolio coverage across the entire day.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <svg className="w-6 h-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900">Performance Insights</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {analytics.totalIssuesLogged}
            </div>
            <div className="text-xs text-gray-600">Total Issues Logged</div>
            <div className="text-xs text-gray-500 mt-1">Across 1 day(s)</div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {analytics.activeHours}
            </div>
            <div className="text-xs text-gray-600">Active Hours</div>
            <div className="text-xs text-gray-500 mt-1">Hours with activity</div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {analytics.portfoliosChecked}
            </div>
            <div className="text-xs text-gray-600">Portfolios Monitored</div>
            <div className="text-xs text-gray-500 mt-1">Out of {analytics.totalPortfolios} total</div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {analytics.coverageConsistency}/24
            </div>
            <div className="text-xs text-gray-600">Coverage Consistency</div>
            <div className="text-xs text-gray-500 mt-1">Hours with 70%+ coverage</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceAnalytics;
