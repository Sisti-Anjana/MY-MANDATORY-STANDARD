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
    <div className="bg-white shadow rounded-lg p-2 w-max max-w-full overflow-hidden">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium text-gray-900">Portfolio Coverage</h3>
        <span className="text-xs text-gray-500">Red = 75%+</span>
      </div>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-1 mb-3 text-[10px]">
        <div className="flex items-center">
          <div className="w-2.5 h-2.5 bg-gray-100 rounded-sm mr-0.5"></div>
          <span className="text-gray-600">0%</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-200 rounded mr-1"></div>
          <span className="text-gray-600">1-24%</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-yellow-200 rounded mr-1"></div>
          <span className="text-gray-600">25-49%</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-orange-200 rounded mr-1"></div>
          <span className="text-gray-600">50-74%</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-200 rounded mr-1"></div>
          <span className="text-gray-600">75%+</span>
        </div>
      </div>

      {/* Heat Map Grid */}
      <div className="grid grid-cols-12 gap-0.5">
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
                p-0.5 rounded-sm text-center text-[8px] font-medium
                hover:shadow-sm cursor-pointer
                border border-gray-100 min-w-[20px] h-8 flex flex-col justify-center
              `}
              title={`Hour ${hour}: ${portfoliosWithIssues}/${totalPortfolios} portfolios (${coveragePercentage}%)`}
            >
              <div className="font-semibold leading-none">{hour}</div>
              <div className="text-[7px] opacity-75 leading-none">{coveragePercentage}%</div>
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="mt-2 grid grid-cols-3 gap-1 text-[9px]">
        <div className="text-center">
          <div className="text-sm font-bold text-gray-900">
            {coverageData ? Math.max(...coverageData.map(h => h.coverage_percentage)) : 0}%
          </div>
          <div className="text-[10px] text-gray-600">Peak Coverage</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-bold text-gray-900">
            {coverageData ? coverageData.filter(h => h.coverage_percentage > 0).length : 0}
          </div>
          <div className="text-[10px] text-gray-600">Active Hours</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-bold text-gray-900">
            {coverageData ? Math.round(coverageData.reduce((sum, h) => sum + h.coverage_percentage, 0) / coverageData.length) : 0}%
          </div>
          <div className="text-[10px] text-gray-600">Avg Coverage</div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioHeatMap;
