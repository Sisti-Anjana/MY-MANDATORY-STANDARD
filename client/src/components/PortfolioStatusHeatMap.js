import React, { useState, useEffect } from 'react';
import { portfoliosAPI, issuesAPI } from '../services/api';

const PortfolioStatusHeatMap = () => {
  const [portfolios, setPortfolios] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [portfoliosResponse, issuesResponse] = await Promise.all([
          portfoliosAPI.getAll(),
          issuesAPI.getAll()
        ]);
        
        setPortfolios(portfoliosResponse.data);
        setIssues(issuesResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Hours since last activity for a portfolio (based on latest issue timestamp)
  const getHoursSinceLastActivity = (portfolioId) => {
    const portfolioIssues = issues.filter(issue => issue.portfolio_id === portfolioId);
    if (portfolioIssues.length === 0) return Infinity; // Treat no activity as 4h+
    const mostRecent = portfolioIssues.reduce((latest, curr) => {
      const currTime = new Date(curr.created_at).getTime();
      return currTime > latest ? currTime : latest;
    }, 0);
    const hours = (Date.now() - mostRecent) / 36e5;
    return Math.floor(hours);
  };

  // Determine if a portfolio is "updated" recently (within the last hour)
  const isPortfolioUpdated = (portfolioId) => {
    const oneHourMs = 60 * 60 * 1000;
    const now = Date.now();
    return issues.some(issue => (
      issue.portfolio_id === portfolioId &&
      (now - new Date(issue.created_at).getTime()) < oneHourMs &&
      (issue.case_number || issue.monitored_by || true)
    ));
  };

  // Get color based on issue count
  const getColorClass = (hoursSince) => {
    // Mapping by inactivity hours:
    // 4h+ => red, 3h => orange, 2h => yellow, 1h => grey, <1h handled as "Updated" (green)
    if (hoursSince >= 4 || hoursSince === Infinity) return 'bg-red-200 text-red-800';
    if (hoursSince === 3) return 'bg-orange-200 text-orange-800';
    if (hoursSince === 2) return 'bg-yellow-200 text-yellow-800';
    if (hoursSince === 1) return 'bg-gray-200 text-gray-800';
    // Fallback to red when unmapped
    return 'bg-red-200 text-red-800';
  };

  // Get status text
  const getStatusText = (hoursSince, updated) => {
    if (updated) return 'Updated';
    if (hoursSince === Infinity || hoursSince >= 4) return '4h+ Inactive';
    if (hoursSince === 3) return '3h Inactive';
    if (hoursSince === 2) return '2h Inactive';
    if (hoursSince === 1) return '1h Inactive';
    return 'Inactive';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Portfolio Status Heat Map
      </h3>
      <p className="text-sm text-gray-600 mb-6">
        Time since last activity per portfolio - Red indicates no activity for 4+ hours
      </p>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-200 rounded mr-2"></div>
          <span className="text-sm text-gray-600">No Activity (4h+)</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-orange-200 rounded mr-2"></div>
          <span className="text-sm text-gray-600">3h</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-yellow-200 rounded mr-2"></div>
          <span className="text-sm text-gray-600">2h</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-gray-200 rounded mr-2"></div>
          <span className="text-sm text-gray-600">1h</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-200 rounded mr-2"></div>
          <span className="text-sm text-gray-600">Updated (&lt;1h)</span>
        </div>
      </div>

      {/* Portfolio Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {portfolios.map(portfolio => {
          const hoursSince = getHoursSinceLastActivity(portfolio.id);
          const updated = isPortfolioUpdated(portfolio.id);
          const statusText = getStatusText(hoursSince, updated);
          
          return (
            <div
              key={portfolio.id}
              className={`
                ${updated ? 'bg-green-200 text-green-800' : getColorClass(hoursSince)}
                p-4 rounded-lg border-2 border-gray-200 hover:shadow-md transition-all cursor-pointer
              `}
              title={`${portfolio.name}: ${updated ? 'Updated <1h ago' : (hoursSince === Infinity ? 'No activity recorded' : `${hoursSince}h since last activity`)}`}
            >
              <div className="text-center">
                <h4 className="font-semibold text-sm mb-2 truncate" title={portfolio.name}>
                  {portfolio.name}
                </h4>
                <div className="text-2xl font-bold mb-1">
                  {updated ? '0h' : (hoursSince === Infinity ? '4h+' : `${hoursSince}h`)}
                </div>
                <div className="text-xs opacity-75">
                  {statusText}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {portfolios.filter(p => isPortfolioUpdated(p.id)).length}
          </div>
          <div className="text-sm text-gray-600">Updated (&lt;1h)</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {portfolios.filter(p => getHoursSinceLastActivity(p.id) === 1).length}
          </div>
          <div className="text-sm text-gray-600">Inactive 1h</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {portfolios.filter(p => getHoursSinceLastActivity(p.id) === 2).length}
          </div>
          <div className="text-sm text-gray-600">Inactive 2h</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {portfolios.filter(p => {
              const h = getHoursSinceLastActivity(p.id);
              return h === 3 || h >= 4 || h === Infinity;
            }).length}
          </div>
          <div className="text-sm text-gray-600">Inactive 3h+</div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioStatusHeatMap;
