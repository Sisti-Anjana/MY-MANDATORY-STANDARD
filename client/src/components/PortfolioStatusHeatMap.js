import React, { useState, useEffect } from 'react';
import { portfoliosAPI, issuesAPI, reservationAPI } from '../services/api';
import ActionModal from './ActionModal';

const PortfolioStatusHeatMap = () => {
  const [portfolios, setPortfolios] = useState([]);
  const [issues, setIssues] = useState([]);
  const [activeReservations, setActiveReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentHour, setCurrentHour] = useState(new Date().getHours());
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
      setCurrentHour(new Date().getHours());
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
  // IMPORTANT: Card will only be green if all_sites_checked is TRUE
  const isPortfolioUpdated = (portfolioId) => {
    // First check: Find the portfolio and check if all_sites_checked is true
    const portfolio = portfolios.find(p => (p.portfolio_id || p.id) === portfolioId);
    const allSitesChecked = portfolio?.all_sites_checked || false;
    
    // If all_sites_checked is false, return false immediately (card won't be green)
    if (!allSitesChecked) {
      console.log(`🔒 Portfolio ${portfolioId} (${portfolio?.name}): all_sites_checked = FALSE - Card will NOT be green`);
      return false;
    }
    
    // If all_sites_checked is true, proceed with existing time-based logic
    const oneHourMs = 60 * 60 * 1000;
    const now = Date.now();
    
    // DEBUG: Log portfolio checking
    const portfolioIssues = issues.filter(issue => issue.portfolio_id === portfolioId);
    console.log(`🔍 Checking portfolio ID: ${portfolioId}`);
    console.log(`✅ all_sites_checked = TRUE`);
    console.log(`📊 Found ${portfolioIssues.length} issues for this portfolio`);
    
    if (portfolioIssues.length > 0) {
      portfolioIssues.forEach(issue => {
        const timeDiff = now - new Date(issue.created_at).getTime();
        console.log(`  ⏰ Issue created: ${new Date(issue.created_at).toLocaleString()}`);
        console.log(`  ⏱️ Time diff: ${Math.floor(timeDiff / 1000 / 60)} minutes ago`);
        console.log(`  ✅ Within 1 hour? ${timeDiff < oneHourMs}`);
        console.log(`  👤 Monitored by: ${issue.monitored_by}`);
      });
    }
    
    const result = issues.some(issue => (
      issue.portfolio_id === portfolioId &&
      (now - new Date(issue.created_at).getTime()) < oneHourMs &&
      (issue.case_number || issue.monitored_by || true)
    ));
    
    console.log(`🎯 Portfolio ${portfolioId} final status: ${result} (all_sites_checked=${allSitesChecked})`);
    return result;
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
    <div className="bg-white shadow rounded-lg p-6 overflow-visible">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            Portfolio Status Heat Map
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Time since last activity per portfolio (Current Hour: {currentHour}:00). Hover to see who's monitoring.
          </p>
        </div>
        
        {/* FIX: Manual Refresh Button */}
        <button
          onClick={() => {
            setLoading(true);
            fetchData();
          }}
          className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-all shadow-md"
          style={{ backgroundColor: '#76AB3F' }}
          title="Click to refresh now"
        >
          <svg 
            className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span className="text-sm font-medium">Refresh</span>
        </button>
      </div>
      
      {/* Last refresh time */}
      <p className="text-xs text-gray-500 mb-4">
        Last updated: {lastRefresh.toLocaleTimeString()} (Auto-refreshes every 30 seconds)
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
          <div className="w-4 h-4 rounded mr-2" style={{ backgroundColor: '#9333EA' }}></div>
          <span className="text-sm text-gray-600">Logging Issue...</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded mr-2" style={{ backgroundColor: '#76AB3F' }}></div>
          <span className="text-sm text-gray-600">Updated (&lt;1h)</span>
        </div>
      </div>

      {/* Portfolio Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 relative">
        {portfolios.map(portfolio => {
          // FIX: Use portfolio_id instead of id (Supabase uses portfolio_id)
          const portfolioId = portfolio.portfolio_id || portfolio.id;
          const hoursSince = getHoursSinceLastActivity(portfolioId);
          const updated = isPortfolioUpdated(portfolioId);
          const beingLogged = isPortfolioBeingLogged(portfolioId);
          const statusText = beingLogged ? 'Logging Issue...' : getStatusText(hoursSince, updated);
          const currentUser = getUserForCurrentHour(portfolioId);
          const isLocked = portfolio.is_locked || portfolio.locked; // Check if portfolio is locked
          
          // Determine background color and text color
          let bgColor, textColor, inlineStyle = {};
          if (beingLogged) {
            // PRIORITY 1: Being logged (violet/purple background) - like locked state
            bgColor = '';
            textColor = 'text-white';
            inlineStyle = { backgroundColor: '#9333EA' }; // Purple-600 color
          } else if (updated) {
            // PRIORITY 2: Updated (green background)
            bgColor = '';
            textColor = 'text-white';
            inlineStyle = { backgroundColor: '#76AB3F' };
          } else {
            // PRIORITY 3: Inactive states (red, orange, yellow, gray)
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
                p-4 rounded-lg hover:shadow-lg hover:scale-105 transition-all cursor-pointer relative group
                ${isLocked ? 'border-4 border-purple-600' : 'border-2 border-gray-200'}
              `}
              style={inlineStyle}
              title={currentUser ? `Monitored by: ${currentUser}` : 'No monitoring this hour'}
            >
              <div className="text-center">
                <h4 className="font-semibold text-sm mb-2 truncate" title={portfolio.name}>
                  {portfolio.name}
                </h4>
                <div className="text-2xl font-bold mb-1">
                  {beingLogged ? '🔄' : (updated ? '0h' : (hoursSince === Infinity ? '4h+' : `${hoursSince}h`))}
                </div>
                <div className="text-xs opacity-75">
                  {statusText}
                </div>
                {/* Show locked indicator if portfolio is locked */}
                {isLocked && (
                  <div className="mt-2 flex items-center justify-center gap-1 text-xs font-medium text-purple-700">
                    🔒 <span>Locked by {portfolio.locked_by || 'Admin'}</span>
                  </div>
                )}
                {/* Show user name if someone monitored this hour */}
                {currentUser && !isLocked && !beingLogged && (
                  <div className="mt-2 text-xs font-medium opacity-90">
                    👤 {currentUser}
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
      />
    </div>
  );
};

export default PortfolioStatusHeatMap;
