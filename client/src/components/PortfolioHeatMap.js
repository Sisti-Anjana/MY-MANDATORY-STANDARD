import React from 'react';

const PortfolioHeatMap = ({ coverageData, totalPortfolios }) => {
  // Create a grid of hours (1-24) with coverage data
  const hours = Array.from({ length: 24 }, (_, i) => i + 1);
  
  // Function to get color based on coverage percentage
  const getColorClass = (coveragePercentage) => {
    if (coveragePercentage === 0) return 'bg-gray-100'; // No coverage
    if (coveragePercentage < 25) return 'bg-green-200'; // Low coverage (green)
    if (coveragePercentage < 50) return 'bg-yellow-200'; // Medium coverage (yellow)
    if (coveragePercentage < 75) return 'bg-orange-200'; // High coverage (orange)
    return 'bg-red-200'; // Very high coverage (red)
  };

  // Function to get text color based on background
  const getTextColor = (coveragePercentage) => {
    if (coveragePercentage === 0) return 'text-gray-400';
    if (coveragePercentage < 25) return 'text-green-800';
    if (coveragePercentage < 50) return 'text-yellow-800';
    if (coveragePercentage < 75) return 'text-orange-800';
    return 'text-red-800';
  };

  // Create coverage map
  const coverageMap = {};
  if (coverageData) {
    coverageData.forEach(hour => {
      coverageMap[hour.hour] = hour;
    });
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Portfolio Coverage Heat Map
      </h3>
      <p className="text-sm text-gray-600 mb-6">
        Coverage percentage by hour - Red indicates high issue activity (75%+ portfolios with issues)
      </p>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-gray-100 rounded mr-2"></div>
          <span className="text-sm text-gray-600">No issues (0%)</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-200 rounded mr-2"></div>
          <span className="text-sm text-gray-600">Low (1-24%)</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-yellow-200 rounded mr-2"></div>
          <span className="text-sm text-gray-600">Medium (25-49%)</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-orange-200 rounded mr-2"></div>
          <span className="text-sm text-gray-600">High (50-74%)</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-200 rounded mr-2"></div>
          <span className="text-sm text-gray-600">Critical (75%+)</span>
        </div>
      </div>

      {/* Heat Map Grid */}
      <div className="grid grid-cols-12 gap-1">
        {hours.map(hour => {
          const hourData = coverageMap[hour] || { coverage_percentage: 0, portfolios_with_issues: 0 };
          const coveragePercentage = hourData.coverage_percentage || 0;
          const portfoliosWithIssues = hourData.portfolios_with_issues || 0;
          
          return (
            <div
              key={hour}
              className={`
                ${getColorClass(coveragePercentage)}
                ${getTextColor(coveragePercentage)}
                p-2 rounded text-center text-xs font-medium
                hover:shadow-md transition-shadow cursor-pointer
                border border-gray-200
              `}
              title={`Hour ${hour}: ${portfoliosWithIssues}/${totalPortfolios} portfolios (${coveragePercentage}%)`}
            >
              <div className="font-bold">{hour}</div>
              <div className="text-xs opacity-75">{coveragePercentage}%</div>
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {coverageData ? Math.max(...coverageData.map(h => h.coverage_percentage)) : 0}%
          </div>
          <div className="text-sm text-gray-600">Peak Coverage</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {coverageData ? coverageData.filter(h => h.coverage_percentage > 0).length : 0}
          </div>
          <div className="text-sm text-gray-600">Active Hours</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {coverageData ? Math.round(coverageData.reduce((sum, h) => sum + h.coverage_percentage, 0) / coverageData.length) : 0}%
          </div>
          <div className="text-sm text-gray-600">Avg Coverage</div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioHeatMap;
