import React from 'react';

const IssuesChart = ({ issues, coverageData }) => {
  // Prepare chart data
  const chartData = coverageData?.coverage_by_hour.map(hour => ({
    hour: `${hour.hour}:00`,
    coverage: hour.coverage_percentage,
    portfolios: hour.portfolios_with_issues
  })) || [];

  const maxCoverage = Math.max(...chartData.map(d => d.coverage));
  const peakHours = chartData.filter(d => d.coverage === maxCoverage);

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Issues Coverage Chart
      </h3>
      <p className="text-sm text-gray-600 mb-6">
        Visual representation of issue coverage across all hours
      </p>
      
      {/* Simple Bar Chart */}
      <div className="space-y-2">
        {chartData.map((data, index) => {
          const barHeight = (data.coverage / 100) * 200; // Scale to max 200px
          const barColor = data.coverage === 0 ? 'bg-gray-200' :
                          data.coverage < 25 ? 'bg-green-300' :
                          data.coverage < 50 ? 'bg-yellow-300' :
                          data.coverage < 75 ? 'bg-orange-300' : 'bg-red-300';
          
          return (
            <div key={index} className="flex items-end space-x-1">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600">{data.hour}</span>
                  <span className="text-xs font-medium text-gray-900">
                    {data.coverage}%
                  </span>
                </div>
                <div 
                  className={`w-full ${barColor} rounded-t transition-all duration-300 hover:opacity-80`}
                  style={{ height: `${Math.max(barHeight, 4)}px` }}
                  title={`${data.hour}: ${data.coverage}% coverage (${data.portfolios} portfolios)`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart Legend */}
      <div className="mt-6 flex flex-wrap gap-4">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-gray-200 rounded mr-2"></div>
          <span className="text-sm text-gray-600">No Coverage (0%)</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-300 rounded mr-2"></div>
          <span className="text-sm text-gray-600">Low (1-24%)</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-yellow-300 rounded mr-2"></div>
          <span className="text-sm text-gray-600">Medium (25-49%)</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-orange-300 rounded mr-2"></div>
          <span className="text-sm text-gray-600">High (50-74%)</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-300 rounded mr-2"></div>
          <span className="text-sm text-gray-600">Critical (75%+)</span>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {maxCoverage}%
          </div>
          <div className="text-sm text-gray-600">Peak Coverage</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {peakHours.length}
          </div>
          <div className="text-sm text-gray-600">Peak Hours</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {chartData.filter(d => d.coverage > 0).length}
          </div>
          <div className="text-sm text-gray-600">Monitoring Active Hours</div>
        </div>
      </div>
    </div>
  );
};

export default IssuesChart;
