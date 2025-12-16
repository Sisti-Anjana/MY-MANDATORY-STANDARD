import React, { useState, useEffect } from 'react';
import { portfoliosAPI, issuesAPI, reservationAPI } from '../services/api';
import ActionModal from './ActionModal';

const APP_TIME_ZONE = 'America/New_York';

const getAppCurrentHour = () => {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      hour12: false,
      timeZone: APP_TIME_ZONE,
    }).formatToParts(new Date());
    const hourPart = parts.find((p) => p.type === 'hour');
    if (hourPart) {
      const h = parseInt(hourPart.value, 10);
      if (!Number.isNaN(h)) return h;
    }
  } catch (e) {
    console.warn('PortfolioStatusHeatMap: fallback to local hour', e);
  }
  return new Date().getHours();
};

const formatAppTime = (date) => {
  try {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: APP_TIME_ZONE,
    }).format(date);
  } catch (e) {
    console.warn('PortfolioStatusHeatMap: fallback to local time', e);
    return date.toLocaleTimeString();
  }
};

const PortfolioStatusHeatMap = () => {
  const [portfolios, setPortfolios] = useState([]);
  const [issues, setIssues] = useState([]);
  const [activeReservations, setActiveReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentHour, setCurrentHour] = useState(getAppCurrentHour());
  const [lastRefresh, setLastRefresh] = useState(new Date());
  
  // Modal state
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);
  const [modalTitle, setModalTitle] = useState('');

  // FIX: Fetch data function that can be called multiple times
  const fetchData = async () => {
    try {
      const [portfoliosResponse, issuesResponse, reservationsResponse] = await Promise.all([
        portfoliosAPI.getAll(),
        issuesAPI.getAll(),
        reservationAPI.getActive().catch(() => ({ data: [] })) // Fetch active reservations, fallback to empty array
      ]);
      
      // DEBUG: Log the data to see structure
      console.log('🔍 Portfolios data:', portfoliosResponse.data);
      console.log('🔍 Issues data:', issuesResponse.data);
      console.log('🔍 Active reservations:', reservationsResponse.data);
      
      // Check first portfolio and issue for ID field names
      if (portfoliosResponse.data.length > 0) {
        console.log('📋 First portfolio:', portfoliosResponse.data[0]);
        console.log('🔑 Portfolio ID fields:', Object.keys(portfoliosResponse.data[0]));
      }
      if (issuesResponse.data.length > 0) {
        console.log('📋 First issue:', issuesResponse.data[0]);
        console.log('🔑 Issue ID fields:', Object.keys(issuesResponse.data[0]));
      }
      
      setPortfolios(portfoliosResponse.data);
      setIssues(issuesResponse.data);
      setActiveReservations(reservationsResponse.data || []);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchData();

    // FIX: Auto-refresh every 30 seconds to show new issues
    const refreshInterval = setInterval(() => {
      fetchData();
    }, 30000); // Refresh every 30 seconds

    // Update current hour every minute
    const hourInterval = setInterval(() => {
      setCurrentHour(getAppCurrentHour());
    }, 60000);

    return () => {
      clearInterval(refreshInterval);
      clearInterval(hourInterval);
    };
  }, []);

  // Get user who logged ticket for this portfolio in the current hour
  const getUserForCurrentHour = (portfolioId) => {
    const relevantIssue = issues.find(issue => {
      return (
        issue.portfolio_id === portfolioId &&
        issue.issue_hour === currentHour &&
        issue.monitored_by && 
        issue.monitored_by.trim() !== ''
      );
    });

    return relevantIssue ? relevantIssue.monitored_by : null;
  };

  // Handle portfolio card click
  const handlePortfolioClick = (portfolio) => {
    const portfolioId = portfolio.portfolio_id || portfolio.id;
    setSelectedPortfolio(portfolioId);
    setModalTitle(portfolio.name);
    setShowActionModal(true);
  };

  // Check if portfolio is being logged (has active reservation)
  const isPortfolioBeingLogged = (portfolioId) => {
    return activeReservations.some(reservation => 
      reservation.portfolio_id === portfolioId && 
      reservation.issue_hour === currentHour
    );
  };

  // Hours since last activity for a portfolio (based on hour difference, not time difference)
  // Uses currentHour - issue_hour to calculate the difference
  const getHoursSinceLastActivity = (portfolioId) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Filter issues for today only
    const portfolioIssues = issues.filter(issue => {
      if (issue.portfolio_id !== portfolioId) return false;
      const issueDate = new Date(issue.created_at);
      issueDate.setHours(0, 0, 0, 0);
      return issueDate.getTime() === today.getTime();
    });
    
    if (portfolioIssues.length === 0) return Infinity; // Treat no activity as 4h+
    
    // Sort by created_at to get the most recent issue
    const sortedIssues = portfolioIssues.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const latestIssue = sortedIssues[0];
    
    // Calculate hour difference: currentHour - issue_hour
    const hoursDiff = currentHour - latestIssue.issue_hour;
    
    // Handle negative hoursDiff (e.g., issue logged at hour 23, current hour is 0)
    // In this case, treat as if it's from previous day, so it's 4h+
    if (hoursDiff < 0) {
      return Infinity; // Previous day = 4h+
    }
    
    return hoursDiff;
  };

  // Determine if a portfolio is "updated" recently (within the current hour)
  // IMPORTANT: Card will only be green if all_sites_checked is TRUE
  // Uses hour-based logic: issue_hour === currentHour means updated
  const isPortfolioUpdated = (portfolioId) => {
    // First check: Find the portfolio and check if all_sites_checked is true
    const portfolio = portfolios.find(p => (p.portfolio_id || p.id) === portfolioId);
    const allSitesChecked = portfolio?.all_sites_checked || false;
    
    // If all_sites_checked is false, return false immediately (card won't be green)
    if (!allSitesChecked) {
      console.log(`🔒 Portfolio ${portfolioId} (${portfolio?.name}): all_sites_checked = FALSE - Card will NOT be green`);
      return false;
    }
    
    // If all_sites_checked is true, check if there's an issue logged in the current hour
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Filter issues for today only
    const todayIssues = issues.filter(issue => {
      if (issue.portfolio_id !== portfolioId) return false;
      const issueDate = new Date(issue.created_at);
      issueDate.setHours(0, 0, 0, 0);
      return issueDate.getTime() === today.getTime();
    });
    
    // Check if any issue was logged in the current hour
    const result = todayIssues.some(issue => issue.issue_hour === currentHour);
    
    console.log(`🎯 Portfolio ${portfolioId} (${portfolio?.name}): updated=${result} (all_sites_checked=${allSitesChecked}, currentHour=${currentHour})`);
    return result;
  };

  // Get color based on hour difference (hoursSince = currentHour - issue_hour)
  const getColorClass = (hoursSince) => {
    // Mapping by inactivity hours based on hour difference:
    // 4h+ or negative (previous day) => red
    // 3h => orange
    // 2h => yellow
    // 1h => gray/blue
    // <1h (0) => handled as "Updated" (green) - not used here as updated check is separate
    if (hoursSince >= 4 || hoursSince === Infinity) return 'bg-red-200 text-red-800';
    if (hoursSince === 3) return 'bg-orange-200 text-orange-800';
    if (hoursSince === 2) return 'bg-yellow-200 text-yellow-800';
    if (hoursSince === 1) return 'bg-gray-200 text-gray-800';
    // Fallback to red when unmapped (shouldn't happen, but safety)
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
    <div className="bg-white shadow rounded-lg p-4 overflow-visible">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-base font-medium text-gray-900">Portfolio Status</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Current Hour: {currentHour}:00 | Hover for monitor | Auto-refreshes every 30 seconds
          </p>
        </div>
      </div>
      
      {/* Last refresh time */}
      <p className="text-[10px] text-gray-400 mb-2">
        Updated (EST): {formatAppTime(lastRefresh)}
      </p>
      
      {/* Legend and Controls */}
      <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
        <div className="flex flex-wrap gap-2 text-xs">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-200 rounded mr-1"></div>
          <span className="text-gray-600">4h+</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-orange-200 rounded mr-1"></div>
          <span className="text-gray-600">3h</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-yellow-200 rounded mr-1"></div>
          <span className="text-gray-600">2h</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-gray-200 rounded mr-1"></div>
          <span className="text-gray-600">1h</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded mr-1" style={{ backgroundColor: '#9333EA' }}></div>
          <span className="text-gray-600">Logging</span>
        </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded mr-1" style={{ backgroundColor: '#76AB3F' }}></div>
            <span className="text-gray-600">Updated</span>
          </div>
        </div>
        
        {/* Last refresh time */}
        <div className="text-[10px] text-gray-500">
          Updated (EST): {formatAppTime(lastRefresh)}
        </div>
      </div>

      {/* Ultra Compact Portfolio Grid - Optimized for space */}
      <div className="grid grid-cols-12 sm:grid-cols-16 md:grid-cols-20 lg:grid-cols-24 xl:grid-cols-28 2xl:grid-cols-32 gap-0.5 relative">
        {portfolios.map(portfolio => {
          // FIX: Use portfolio_id instead of id (Supabase uses portfolio_id)
          const portfolioId = portfolio.portfolio_id || portfolio.id;
          const hoursSince = getHoursSinceLastActivity(portfolioId);
          const updated = isPortfolioUpdated(portfolioId);
          const beingLogged = isPortfolioBeingLogged(portfolioId);
          const statusText = beingLogged ? 'Logging Issue...' : getStatusText(hoursSince, updated);
          const currentUser = getUserForCurrentHour(portfolioId);
          
          // Check if portfolio is locked by checking active reservations
          const isLocked = activeReservations.some(
            res => String(res.portfolio_id) === String(portfolioId) || 
                  String(res.portfolios?.portfolio_id) === String(portfolioId) ||
                  String(res.portfolio?.portfolio_id) === String(portfolioId)
          );
          
          // Determine background color and text color
          let bgColor, textColor, inlineStyle = {};
          
          if (isLocked) {
            // PRIORITY 1: Locked state (purple background)
            bgColor = '';
            textColor = 'text-white';
            inlineStyle = { backgroundColor: '#9333EA' }; // Purple-600 color
          } else if (beingLogged) {
            // PRIORITY 2: Being logged (blue background)
            bgColor = '';
            textColor = 'text-white';
            inlineStyle = { backgroundColor: '#3B82F6' }; // Blue-500 color
          } else if (updated) {
            // PRIORITY 3: Updated (green background)
            bgColor = '';
            textColor = 'text-white';
            inlineStyle = { backgroundColor: '#76AB3F' };
          } else {
            // PRIORITY 4: Inactive states (red, orange, yellow, gray)
            const colorClass = getColorClass(hoursSince);
            bgColor = colorClass;
            textColor = '';
          }
          
          return (
            <div
              key={portfolioId}
              onClick={() => handlePortfolioClick(portfolio)}
              className={`
                tooltip-container
                ${bgColor}
                ${textColor}
                p-0 hover:bg-gray-50 cursor-pointer relative group text-center aspect-square
                ${isLocked ? 'border-l-2 border-purple-800' : 'border-b border-r border-gray-100'}
                w-full h-5 flex flex-col justify-center text-[7px]'
              `}
              style={inlineStyle}
              title={currentUser ? `Monitored by: ${currentUser}` : 'No monitoring this hour'}
            >
              <div className="text-center">
                <div className="font-medium leading-none" title={portfolio.name}>
                  {portfolio.name[0]}{portfolio.name.split(' ').length > 1 ? portfolio.name.split(' ')[1][0] : portfolio.name[1]}
                </div>
                <div className="text-[8px] font-bold leading-none">
                  {beingLogged ? '🔄' : (updated ? '0' : (hoursSince === Infinity ? '4' : `${hoursSince}`))}
                </div>
                {/* Show locked indicator if portfolio is locked */}
                {isLocked && (
                  <div className="absolute -top-1 -right-1 text-[6px] text-white font-bold">
                    🔒
                  </div>
                )}
                {/* Show user name if someone monitored this hour */}
                {currentUser && !isLocked && !beingLogged && (
                  <div className="absolute bottom-0 right-0 text-[5px] text-gray-500">
                    {currentUser[0]}
                  </div>
                )}
              </div>

              {/* Simple hover tooltip */}
              {currentUser && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-[9999]">
                  <div className="bg-gray-900 text-white text-xs rounded py-2 px-3 shadow-xl whitespace-nowrap">
                    Monitored by: <span className="font-bold">{currentUser}</span>
                  </div>
                  {/* Tooltip arrow */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                    <div className="border-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {portfolios.filter(p => isPortfolioUpdated(p.portfolio_id || p.id)).length}
          </div>
          <div className="text-sm text-gray-600">Updated (&lt;1h)</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {portfolios.filter(p => getHoursSinceLastActivity(p.portfolio_id || p.id) === 1).length}
          </div>
          <div className="text-sm text-gray-600">Inactive 1h</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {portfolios.filter(p => getHoursSinceLastActivity(p.portfolio_id || p.id) === 2).length}
          </div>
          <div className="text-sm text-gray-600">Inactive 2h</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {portfolios.filter(p => {
              const h = getHoursSinceLastActivity(p.portfolio_id || p.id);
              return h === 3 || h >= 4 || h === Infinity;
            }).length}
          </div>
          <div className="text-sm text-gray-600">Inactive 3h+</div>
        </div>
      </div>

      {/* Action Modal for Portfolio Actions */}
      <ActionModal
        isOpen={showActionModal}
        onClose={() => setShowActionModal(false)}
        title={modalTitle}
        portfolioId={selectedPortfolio}
        portfolioData={portfolios.find(p => (p.portfolio_id || p.id) === selectedPortfolio)}
      />
    </div>
  );
};

export default PortfolioStatusHeatMap;
