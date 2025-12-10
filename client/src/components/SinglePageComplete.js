import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../services/supabaseClient';
import HourlyCoverageChart from './HourlyCoverageChart';
import PerformanceAnalytics from './PerformanceAnalytics';
import IssuesByUser from './IssuesByUser';
import PortfolioMonitoringMatrix from './PortfolioMonitoringMatrix';
import EditIssueModal from './EditIssueModal';
import TicketLoggingTable from './TicketLoggingTable';
import AdminPanel from './AdminPanel';
import IssueDetailsView from './IssueDetailsView';
import PortfolioHourSessionDrawer from './PortfolioHourSessionDrawer';

const SinglePageComplete = ({ isAdmin = false, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [portfolios, setPortfolios] = useState([]);
  const [issues, setIssues] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentHour, setCurrentHour] = useState(new Date().getHours());
  const [lastCheckedHour, setLastCheckedHour] = useState(new Date().getHours());
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingIssue, setEditingIssue] = useState(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [monitoredPersonnel, setMonitoredPersonnel] = useState([]);
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedPortfolioForAction, setSelectedPortfolioForAction] = useState(null);
  const [activeReservations, setActiveReservations] = useState([]);
  const [interactedPortfolios, setInteractedPortfolios] = useState(new Set());
  const [updatingSitesCheckPortfolio, setUpdatingSitesCheckPortfolio] = useState(null);
  const [sitesCheckError, setSitesCheckError] = useState(null);
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false); // For auto-refresh indicator
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [sessionPortfolioName, setSessionPortfolioName] = useState(null);
  const [sessionHour, setSessionHour] = useState(null);
  const [sitesCheckedText, setSitesCheckedText] = useState(''); // Text for which sites were checked when "No" is selected
  const [showSitesCheckedInput, setShowSitesCheckedInput] = useState(false); // Show input when "No" is selected
  const [issueDetailsInitialPortfolioId, setIssueDetailsInitialPortfolioId] = useState('');
  const [lastRefresh, setLastRefresh] = useState(new Date()); // Track when data was last refreshed
  const [portfolioSearchTerm, setPortfolioSearchTerm] = useState(''); // Search term for filtering portfolios
  const [isPortfolioLockedByOther, setIsPortfolioLockedByOther] = useState(false); // Track if portfolio is locked by someone else
  const [portfolioLockedBy, setPortfolioLockedBy] = useState(null); // Track who locked the portfolio

  const ensureSessionId = () => {
    let sessionId = localStorage.getItem('session_id');
    if (!sessionId) {
      sessionId = `session-${Date.now()}`;
      localStorage.setItem('session_id', sessionId);
    }
    return sessionId;
  };

  const normalizeCheckedHour = (value) => {
    if (value === null || value === undefined) return null;
    return typeof value === 'number' ? value : parseInt(value, 10);
  };

  const normalizeCheckedDate = (value) => {
    if (!value) return null;
    try {
      const parsed = new Date(value);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed.toISOString().split('T')[0];
      }
    } catch (err) {
      console.warn('Unable to normalize all_sites_checked_date:', err);
    }
    return typeof value === 'string' ? value.split('T')[0] : null;
  };

  const hasLoggedIssueForCurrentHour = (portfolioId) => {
    if (!portfolioId) return false;
    const today = new Date().toISOString().split('T')[0];
    return issues.some(issue => {
      const issueDate = new Date(issue.created_at);
      if (Number.isNaN(issueDate.getTime())) return false;
      const issueDateString = issueDate.toISOString().split('T')[0];
      const matchesPortfolio = issue.portfolio_id === portfolioId ||
        issue.portfolios?.portfolio_id === portfolioId ||
        issue.portfolio_id === (portfolioId?.toString?.() || portfolioId);
      return (
        matchesPortfolio &&
        issue.issue_hour === currentHour &&
        issueDateString === today
      );
    });
  };

  const hasLoggedIssueForHour = (portfolioId, hour) => {
    if (!portfolioId || hour === null || hour === undefined) return false;
    const today = new Date().toISOString().split('T')[0];
    return issues.some(issue => {
      const issueDate = new Date(issue.created_at);
      if (Number.isNaN(issueDate.getTime())) return false;
      const issueDateString = issueDate.toISOString().split('T')[0];
      const matchesPortfolio = issue.portfolio_id === portfolioId ||
        issue.portfolios?.portfolio_id === portfolioId ||
        issue.portfolio_id === (portfolioId?.toString?.() || portfolioId);
      return (
        matchesPortfolio &&
        issue.issue_hour === hour &&
        issueDateString === today
      );
    });
  };

  const releaseReservationForPortfolio = async (portfolioId, hour = null, releaseAllUsers = false) => {
    if (!portfolioId) return;
    const sessionId = ensureSessionId();
    try {
      // CRITICAL: If releaseAllUsers is true, release ALL locks for this portfolio (all users)
      // This is used when a portfolio is completed, allowing other users to lock it again
      // Otherwise, only release locks for the current user's session
      let query = supabase
        .from('hour_reservations')
        .delete()
        .eq('portfolio_id', portfolioId);
      
      // If releaseAllUsers is false, only release locks for current user's session
      if (!releaseAllUsers) {
        query = query.eq('session_id', sessionId);
      }
      
      // If hour is specified, only release that hour's reservation
      if (hour !== null) {
        query = query.eq('issue_hour', hour);
      }
      // Otherwise, release ALL reservations for this portfolio (for current user or all users based on releaseAllUsers flag)

      const { error } = await query;

      if (error) {
        console.warn('Error releasing reservation:', error);
        return;
      }

      // Immediately refresh to update UI
      await fetchActiveReservations();
      // Also trigger a data refresh to ensure everything is synced
      await fetchDataBackground();
    } catch (err) {
      console.warn('Unexpected error releasing reservation:', err);
    }
  };

  // Load interacted portfolios from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('interactedPortfolios');
    if (stored) {
      setInteractedPortfolios(new Set(JSON.parse(stored)));
    }
  }, []);

  // Save interacted portfolios to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('interactedPortfolios', JSON.stringify(Array.from(interactedPortfolios)));
  }, [interactedPortfolios]);

  // Default portfolio cards structure (can be overridden by database data)
  const defaultPortfolioCards = [
    { name: 'Aurora', subtitle: 'Aurora' },
    { name: 'BESS & Trimark', subtitle: 'Multi Das' },
    { name: 'Chint', subtitle: 'Chint' },
    { name: 'eG/GByte/PD/GPM', subtitle: 'Multiple DAS' },
    { name: 'Guarantee Sites', subtitle: 'Powertrack' },
    { name: 'Intermountain West', subtitle: 'Powertrack' },
    { name: 'KK', subtitle: 'Powertrack' },
    { name: 'Locus', subtitle: 'Locus' },
    { name: 'Main Portfolio', subtitle: 'Powertrack' },
    { name: 'Mid Atlantic 1', subtitle: 'Powertrack' },
    { name: 'Mid Atlantic 2', subtitle: 'Powertrack' },
    { name: 'Midwest 1', subtitle: 'Powertrack' },
    { name: 'Midwest 2', subtitle: 'Powertrack' },
    { name: 'New England 1', subtitle: 'Powertrack' },
    { name: 'New England 2', subtitle: 'Powertrack' },
    { name: 'New England 3', subtitle: 'Powertrack' },
    { name: 'Nor Cal 1', subtitle: 'Powertrack' },
    { name: 'Nor Cal 2', subtitle: 'Powertrack' },
    { name: 'PLF', subtitle: 'Powertrack' },
    { name: 'Power Factor', subtitle: 'Power Factor' },
    { name: 'Secondary Portfolio', subtitle: 'Powertrack' },
    { name: 'So Cal 1', subtitle: 'Powertrack' },
    { name: 'So Cal 2', subtitle: 'Powertrack' },
    { name: 'So Cal 3', subtitle: 'Powertrack' },
    { name: 'SolarEdge', subtitle: 'SolarEdge' },
    { name: 'SolrenView', subtitle: 'Solrenview' }
  ];

  // Dynamically generate portfolio cards from database
  const portfolioCards = useMemo(() => {
    if (portfolios.length === 0) {
      return defaultPortfolioCards;
    }
    // Create cards from actual database portfolios - include ALL fields from database
    return portfolios.map(p => {
      // Use subtitle from database if available, otherwise fall back to default
      const defaultCard = defaultPortfolioCards.find(dc => dc.name === p.name);
      return {
        ...p, // Include all fields from database (portfolio_id, site_range, etc.)
        subtitle: p.subtitle || defaultCard?.subtitle || 'Portfolio'
      };
    });
  }, [portfolios]);

  // Unique color mapping for each portfolio's lock border
  const getPortfolioLockColor = (portfolioName) => {
    const colorMap = {
      'Aurora': 'border-purple-500',
      'BESS & Trimark': 'border-pink-500',
      'Chint': 'border-blue-500',
      'eG/GByte/PD/GPM': 'border-indigo-500',
      'Guarantee Sites': 'border-cyan-500',
      'Intermountain West': 'border-teal-500',
      'KK': 'border-emerald-500',
      'Locus': 'border-lime-500',
      'Main Portfolio': 'border-yellow-500',
      'Mid Atlantic 1': 'border-amber-500',
      'Mid Atlantic 2': 'border-orange-500',
      'Midwest 1': 'border-red-500',
      'Midwest 2': 'border-rose-500',
      'New England 1': 'border-fuchsia-500',
      'New England 2': 'border-violet-500',
      'New England 3': 'border-purple-600',
      'Nor Cal 1': 'border-blue-600',
      'Nor Cal 2': 'border-indigo-600',
      'PLF': 'border-cyan-600',
      'Power Factor': 'border-teal-600',
      'Secondary Portfolio': 'border-emerald-600',
      'So Cal 1': 'border-lime-600',
      'So Cal 2': 'border-yellow-600',
      'So Cal 3': 'border-orange-600',
      'SolarEdge': 'border-red-600',
      'SolrenView': 'border-pink-600'
    };
    return colorMap[portfolioName] || 'border-purple-500'; // Default purple if not found
  };

  useEffect(() => {
    fetchData();
    loadMonitoredPersonnel();
    fetchActiveReservations();
    
    const interval = setInterval(() => {
      const newHour = new Date().getHours();
      setCurrentHour(newHour);
      
      // Check if hour has changed - if so, reset all "all_sites_checked" statuses AND release all locks
      if (newHour !== lastCheckedHour) {
        console.log(`🕐 Hour changed from ${lastCheckedHour} to ${newHour}. Resetting all sites checked status and releasing all locks...`);
        
        // CRITICAL: Release ALL locks for the previous hour
        // This ensures a fresh start for each new hour
        const releaseAllLocksForPreviousHour = async () => {
          try {
            const nowIso = new Date().toISOString();
            // Delete all reservations for the previous hour (or any hour that's not the current hour)
            // This ensures all locks are cleared when hour changes
            const { error: deleteError } = await supabase
              .from('hour_reservations')
              .delete()
              .eq('issue_hour', lastCheckedHour);
            
            if (deleteError) {
              console.error('Error releasing locks for previous hour:', deleteError);
            } else {
              console.log(`✅ All locks for Hour ${lastCheckedHour} have been released. Fresh start for Hour ${newHour}.`);
              // Refresh reservations to update UI
              await fetchActiveReservations();
            }
          } catch (err) {
            console.error('Error releasing locks on hour change:', err);
          }
        };
        
        // Release all locks for previous hour
        releaseAllLocksForPreviousHour();
        
        // Reset all sites checked status
        resetAllSitesChecked();
        setLastCheckedHour(newHour);
      }
    }, 60000);
    
    // CRITICAL: Poll for active reservations every 2 seconds for real-time locks
    // Synchronized refresh to ensure all instances see same data
    const reservationInterval = setInterval(() => {
      fetchActiveReservations();
    }, 2000); // 2s for consistent sync across all instances

    // Listen for admin unlock events to immediately refresh reservations
    const handlePortfolioUnlocked = () => {
      console.log('🔓 Portfolio unlocked by admin - refreshing reservations...');
      fetchActiveReservations();
      fetchDataBackground();
    };

    window.addEventListener('portfolioUnlocked', handlePortfolioUnlocked);
    
    // CRITICAL: Reload issues and portfolios every 3 seconds for real-time updates
    // Synchronized refresh interval to ensure all instances stay in sync
    const dataRefreshInterval = setInterval(async () => {
      setIsAutoRefreshing(true);
      console.log('🔄 Auto-refreshing dashboard data in background...');
      await fetchDataBackground(); // Use background fetch instead of regular fetchData
      await fetchActiveReservations(); // Also refresh reservations to show locks
      setTimeout(() => setIsAutoRefreshing(false), 300); // Show indicator briefly
    }, 3000); // 3s for consistent sync across all instances
    
    return () => {
      clearInterval(interval);
      clearInterval(reservationInterval);
      clearInterval(dataRefreshInterval);
      window.removeEventListener('portfolioUnlocked', handlePortfolioUnlocked);
    };
  }, [lastCheckedHour]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check lock status when modal opens
  useEffect(() => {
    const checkLockStatus = async () => {
      console.log('🚀 useEffect triggered:', {
        showActionModal,
        selectedPortfolioForAction,
        portfoliosLength: portfolios.length
      });
      
      if (!showActionModal || !selectedPortfolioForAction) {
        console.log('⏸️ Early return - modal not open or no portfolio selected');
        return;
      }

      const portfolioToCheck = portfolios.find((p) => p.name === selectedPortfolioForAction);
      if (!portfolioToCheck) {
        setIsPortfolioLockedByOther(false);
        setPortfolioLockedBy(null);
        return;
      }

      const portfolioId = portfolioToCheck.portfolio_id || portfolioToCheck.id;
      if (!portfolioId) {
        setIsPortfolioLockedByOther(false);
        setPortfolioLockedBy(null);
        return;
      }

      const sessionId = ensureSessionId();
      const nowIso = new Date().toISOString();
      const loggedInUser = sessionStorage.getItem('username') || 
                          sessionStorage.getItem('fullName') || 
                          '';
      const currentUser = String(loggedInUser || '').trim();
      
      console.log('👤 Current logged-in user info:', {
        username: sessionStorage.getItem('username'),
        fullName: sessionStorage.getItem('fullName'),
        loggedInUser: loggedInUser,
        currentUser: currentUser,
        currentUserLower: currentUser.toLowerCase()
      });

      // CRITICAL: First check if user has a lock on a DIFFERENT portfolio
      // If they do, and it's not completed, disable the button
      // IMPORTANT: Only check locks for CURRENT hour - locks from previous hours are invalid
      const { data: myOtherReservations, error: myReservationsError } = await supabase
        .from('hour_reservations')
        .select('*')
        .eq('session_id', sessionId)
        .eq('issue_hour', currentHour) // CRITICAL: Only check current hour locks
        .gt('expires_at', nowIso)
        .order('reserved_at', { ascending: false });

      if (!myReservationsError && myOtherReservations && myOtherReservations.length > 0) {
        // Filter to get MY reservations (matching both session_id and monitored_by)
        const myActiveReservations = myOtherReservations.filter(r => {
          const rSessionId = String(r.session_id || '').trim();
          const rMonitoredBy = String(r.monitored_by || '').trim();
          const sessionMatches = rSessionId === String(sessionId || '').trim();
          const userMatches = rMonitoredBy.toLowerCase() === currentUser.toLowerCase();
          return sessionMatches && userMatches;
        });

        if (myActiveReservations.length > 0) {
          const myOtherLock = myActiveReservations[0];
          const otherPortfolioId = myOtherLock.portfolio_id;
          
          // Check if this is a DIFFERENT portfolio
          if (otherPortfolioId !== portfolioId) {
            // Check if the other portfolio is completed
            const otherPortfolio = portfolios.find(p => 
              (p.portfolio_id || p.id) === otherPortfolioId
            );
            const isOtherCompleted = otherPortfolio?.all_sites_checked === true;
            
            console.log('🔍 Found lock on different portfolio:', {
              otherPortfolioId,
              currentPortfolioId: portfolioId,
              otherPortfolioName: otherPortfolio?.name,
              isOtherCompleted
            });
            
            if (!isOtherCompleted) {
              // Other portfolio is NOT completed - disable button
              const otherPortfolioName = otherPortfolio?.name || 'another portfolio';
              setIsPortfolioLockedByOther(true);
              setPortfolioLockedBy(`You have an active lock on "${otherPortfolioName}" - complete it first`);
              console.log('❌ Button disabled - user has incomplete lock on different portfolio');
              return; // Don't check further
            } else {
              // Other portfolio is completed - allow locking this one
              console.log('✅ Other portfolio is completed - allowing lock on this portfolio');
            }
          }
        }
      }

      const { data: activeReservations, error: reservationCheckError } = await supabase
        .from('hour_reservations')
        .select('*')
        .eq('portfolio_id', portfolioId)
        .eq('issue_hour', currentHour)
        .gt('expires_at', nowIso);

      if (reservationCheckError) {
        console.error('Error checking reservation:', reservationCheckError);
        setIsPortfolioLockedByOther(false);
        setPortfolioLockedBy(null);
        return;
      }

      // CRITICAL: Check if THIS portfolio is locked by ME
      // Only enable "Log Issue" button if I have a lock on THIS specific portfolio
      if (activeReservations && activeReservations.length > 0) {
        console.log('🔍 Checking lock status:', {
          activeReservationsCount: activeReservations.length,
          currentUser: currentUser,
          currentUserLower: currentUser.toLowerCase(),
          sessionId: sessionId
        });

        // Check if it's MY lock by comparing monitored_by name (case-insensitive)
        const myActiveReservations = activeReservations.filter(r => {
          const rMonitoredBy = String(r.monitored_by || '').trim();
          const rSessionId = String(r.session_id || '').trim();
          const sessionMatches = rSessionId === String(sessionId || '').trim();
          const userMatches = rMonitoredBy.toLowerCase() === currentUser.toLowerCase();
          
          console.log('  Checking reservation:', {
            reservationMonitoredBy: rMonitoredBy,
            reservationMonitoredByLower: rMonitoredBy.toLowerCase(),
            myUser: currentUser,
            myUserLower: currentUser.toLowerCase(),
            userMatches,
            reservationSessionId: rSessionId,
            mySessionId: String(sessionId || '').trim(),
            sessionMatches,
            isMyLock: sessionMatches && userMatches
          });
          
          return sessionMatches && userMatches;
        });

        console.log('✅ My reservations found:', myActiveReservations.length);

        if (myActiveReservations.length === 0) {
          // Someone else has it locked OR I don't have a lock on this portfolio
          const otherLock = activeReservations[0];
          const lockedBy = String(otherLock.monitored_by || 'another user').trim();
          console.log('❌ Portfolio locked by someone else or not locked by me:', {
            lockedBy: lockedBy,
            currentUser: currentUser,
            willDisableButton: true
          });
          // Disable button - only enable if I have the lock
          setIsPortfolioLockedByOther(true);
          setPortfolioLockedBy(lockedBy);
          console.log('✅ State set: isPortfolioLockedByOther = true, portfolioLockedBy =', lockedBy);
        } else {
          // It's my lock - enable button
          console.log('✅ Portfolio is locked by me - button ENABLED');
          setIsPortfolioLockedByOther(false);
          setPortfolioLockedBy(null);
        }
      } else {
        // No lock found for THIS portfolio
        // But check if user has a lock on a DIFFERENT portfolio
        // If they do and it's not completed, disable button
        // If they don't have any lock, or their other lock is completed, allow locking this one
        
        // Check if user has ANY active lock
        // IMPORTANT: Only check locks for CURRENT hour - locks from previous hours are invalid
        const { data: myAnyReservations, error: myAnyError } = await supabase
          .from('hour_reservations')
          .select('*')
          .eq('session_id', sessionId)
          .eq('issue_hour', currentHour) // CRITICAL: Only check current hour locks
          .gt('expires_at', nowIso);

        if (!myAnyError && myAnyReservations && myAnyReservations.length > 0) {
          // Filter to get MY reservations
          const myAnyActiveReservations = myAnyReservations.filter(r => {
            const rSessionId = String(r.session_id || '').trim();
            const rMonitoredBy = String(r.monitored_by || '').trim();
            const sessionMatches = rSessionId === String(sessionId || '').trim();
            const userMatches = rMonitoredBy.toLowerCase() === currentUser.toLowerCase();
            return sessionMatches && userMatches;
          });

          if (myAnyActiveReservations.length > 0) {
            const myOtherLock = myAnyActiveReservations[0];
            const otherPortfolioId = myOtherLock.portfolio_id;
            
            // Check if this is a DIFFERENT portfolio
            if (otherPortfolioId !== portfolioId) {
              // Check if the other portfolio is completed
              // CRITICAL: Check if completed for CURRENT HOUR and TODAY
              const otherPortfolio = portfolios.find(p => 
                (p.portfolio_id || p.id) === otherPortfolioId
              );
              const isOtherCompleted = otherPortfolio?.all_sites_checked === true;
              const otherCheckedHour = normalizeCheckedHour(otherPortfolio?.all_sites_checked_hour);
              const otherCheckedDate = normalizeCheckedDate(otherPortfolio?.all_sites_checked_date);
              const today = new Date().toISOString().split('T')[0];
              const isOtherCompletedForCurrentHour = isOtherCompleted && 
                otherCheckedHour === currentHour && 
                otherCheckedDate === today;
              
              console.log('🔍 Checking other portfolio completion:', {
                portfolioName: otherPortfolio?.name,
                all_sites_checked: otherPortfolio?.all_sites_checked,
                checkedHour: otherCheckedHour,
                currentHour: currentHour,
                checkedDate: otherCheckedDate,
                today: today,
                isOtherCompletedForCurrentHour
              });
              
              if (!isOtherCompletedForCurrentHour) {
                // Other portfolio is NOT completed for current hour - disable button
                const otherPortfolioName = otherPortfolio?.name || 'another portfolio';
                console.log('❌ Button disabled - user has incomplete lock on different portfolio:', otherPortfolioName);
                setIsPortfolioLockedByOther(true);
                setPortfolioLockedBy(`You have an active lock on "${otherPortfolioName}" - complete it first (mark "All Sites Checked" = Yes)`);
                return;
              } else {
                // Other portfolio is completed for current hour - allow locking this one
                console.log('✅ Other portfolio is completed for current hour - button ENABLED (can lock this one)');
                setIsPortfolioLockedByOther(false);
                setPortfolioLockedBy(null);
                // Don't return - continue to check if THIS portfolio has a lock
              }
            }
          }
        }
        
        // No lock found for this portfolio AND no incomplete lock on other portfolio
        // Allow user to lock this portfolio
        console.log('ℹ️ No lock found - button ENABLED (can lock this portfolio)');
        setIsPortfolioLockedByOther(false);
        setPortfolioLockedBy(null);
      }
    };

    checkLockStatus();
  }, [showActionModal, selectedPortfolioForAction, portfolios, currentHour]);

  // Debug: Log state changes
  useEffect(() => {
    if (showActionModal && selectedPortfolioForAction) {
      console.log('🔘 Button state updated:', {
        isPortfolioLockedByOther,
        portfolioLockedBy,
        selectedPortfolioForAction,
        buttonDisabled: isPortfolioLockedByOther
      });
    }
  }, [isPortfolioLockedByOther, portfolioLockedBy, showActionModal, selectedPortfolioForAction]);

  const loadMonitoredPersonnel = async () => {
    let usersList = [];
    
    try {
      const { data, error } = await supabase
        .from('monitored_personnel')
        .select('name')
        .order('name', { ascending: true });

      if (error) {
        console.warn('Error fetching monitored_personnel from Supabase:', error.message);
        throw error;
      }

      if (data && data.length > 0) {
        usersList = data.map(person => person.name);
      }
    } catch (err) {
      console.warn('Falling back to local monitored personnel list:', err.message);
    }

    // If no data from Supabase, try localStorage
    if (usersList.length === 0) {
      const storedUsers = localStorage.getItem('monitoredPersonnel');
      if (storedUsers) {
        usersList = JSON.parse(storedUsers);
      } else {
        // Use default users
        usersList = [
          'Anjana', 'Anita P', 'Arun V', 'Bharat Gu', 'Deepa L', 
          'jenny', 'Kumar S', 'Lakshmi B', 'Manoj D', 'Rajesh K',
          'Ravi T', 'Vikram N'
        ];
        localStorage.setItem('monitoredPersonnel', JSON.stringify(usersList));
      }
    }
    
    // CRITICAL FIX: Add logged-in user to the list if not present
    const loggedInUser = sessionStorage.getItem('username') || 
                        sessionStorage.getItem('fullName');
    
    if (loggedInUser && !usersList.includes(loggedInUser)) {
      console.log('✅ Adding logged-in user to monitored personnel list:', loggedInUser);
      usersList.unshift(loggedInUser); // Add to beginning of list
      // Update localStorage to persist this change
      localStorage.setItem('monitoredPersonnel', JSON.stringify(usersList));
    }
    
    setMonitoredPersonnel(usersList);
  };

  // Reset all sites checked status for all portfolios (called on hour change)
  const resetAllSitesChecked = async () => {
    try {
      console.log('🔄 Resetting all sites checked status for new hour...');
      
      const { error } = await supabase
        .from('portfolios')
        .update({
          all_sites_checked: false,
          all_sites_checked_hour: null,
          all_sites_checked_date: null
        })
        .neq('portfolio_id', '00000000-0000-0000-0000-000000000000'); // Update all records
      
      if (error) {
        console.error('❌ Error resetting sites checked status:', error);
        return;
      }
      
      // Update local state
      setPortfolios(prev =>
        prev.map(p => ({
          ...p,
          all_sites_checked: false,
          all_sites_checked_hour: null,
          all_sites_checked_date: null
        }))
      );
      
      console.log('✅ Successfully reset all sites checked status');
    } catch (err) {
      console.error('❌ Unexpected error resetting sites checked:', err);
    }
  };

  const findPortfolioRecord = (portfolioName) =>
    portfolios.find(p => p.name === portfolioName);

  const isPortfolioSitesChecked = (portfolioName) => {
    const record = findPortfolioRecord(portfolioName);
    if (!record?.all_sites_checked) return false;
    
    // Check if the status is for the current hour and today's date
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const storedHour = normalizeCheckedHour(record.all_sites_checked_hour);
    const storedDate = normalizeCheckedDate(record.all_sites_checked_date);
    const isCurrentHour = storedHour === currentHour;
    const isToday = storedDate === today;
    
    // Only return true if checked for current hour and today
    return record.all_sites_checked === true && isCurrentHour && isToday;
  };

  const updatePortfolioSitesChecked = async (portfolioName, value) => {
    const record = findPortfolioRecord(portfolioName);
    if (!record) return;

    const portfolioId = record.portfolio_id || record.id;
    if (!portfolioId) {
      console.warn('Unable to determine portfolio id for', portfolioName);
      return;
    }

    setSitesCheckError(null);
    setUpdatingSitesCheckPortfolio(portfolioName);

    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

      // CRITICAL VALIDATION: Only the person who locked the portfolio can mark "All Sites Checked" = Yes
      if (value) {
        const sessionId = ensureSessionId();
        const nowIso = new Date().toISOString();
        const loggedInUser = sessionStorage.getItem('username') || 
                            sessionStorage.getItem('fullName') || 
                            '';
        const currentUser = String(loggedInUser || '').trim();
        
        // Check if current user has an active lock on this portfolio
        const { data: activeReservations, error: reservationCheckError } = await supabase
          .from('hour_reservations')
          .select('*')
          .eq('portfolio_id', portfolioId)
          .eq('issue_hour', currentHour)
          .gt('expires_at', nowIso);
        
        if (reservationCheckError) {
          console.error('Error checking reservation:', reservationCheckError);
          setSitesCheckError('Unable to verify portfolio lock. Please try again.');
          setUpdatingSitesCheckPortfolio(null);
          return;
        }
        
        // Filter to ensure BOTH session_id AND monitored_by match the current user
        const myActiveReservations = (activeReservations || []).filter(r => {
          const rSessionId = String(r.session_id || '').trim();
          const rMonitoredBy = String(r.monitored_by || '').trim();
          const mySessionIdStr = String(sessionId || '').trim();
          const myUserStr = String(currentUser || '').trim();
          
          const sessionMatches = rSessionId === mySessionIdStr;
          const userMatches = rMonitoredBy.toLowerCase() === myUserStr.toLowerCase();
          return sessionMatches && userMatches;
        });
        
        if (myActiveReservations.length === 0) {
          // No lock found for current user
          if (activeReservations && activeReservations.length > 0) {
            // Someone else has it locked
            const otherLock = activeReservations[0];
            const lockedBy = String(otherLock.monitored_by || 'another user').trim();
            const errorMsg = `❌ ERROR: This portfolio "${portfolioName}" (Hour ${currentHour}) is locked by "${lockedBy}". Only the person who locked it can mark "All Sites Checked" = Yes.`;
            console.error('❌ BLOCKED: Portfolio locked by someone else', {
              lockedBy,
              myUser: currentUser,
              portfolioName,
              hour: currentHour
            });
            setSitesCheckError(errorMsg);
            alert(errorMsg);
            setUpdatingSitesCheckPortfolio(null);
            return;
          } else {
            // No lock exists at all
            const errorMsg = `❌ ERROR: You must lock this portfolio first before marking "All Sites Checked" = Yes. Please lock the portfolio, log issues, then mark it as complete.`;
            console.warn('⚠️ No lock found - requiring lock first');
            setSitesCheckError(errorMsg);
            alert(errorMsg);
            setUpdatingSitesCheckPortfolio(null);
            return;
          }
        }
        
        console.log('✅ Lock validated - user has valid lock for marking complete:', {
          sessionId: myActiveReservations[0].session_id,
          monitoredBy: myActiveReservations[0].monitored_by
        });
      }

      if (value) {
        // Check if there are issues for the hour we're about to mark as checked
        // If all_sites_checked_hour is already set, check that hour; otherwise check current hour
        const record = findPortfolioRecord(portfolioName);
        const hourToCheck = record?.all_sites_checked_hour !== null && record?.all_sites_checked_hour !== undefined
          ? normalizeCheckedHour(record.all_sites_checked_hour)
          : currentHour;
        
        const hasLoggedIssue = hasLoggedIssueForHour(portfolioId, hourToCheck);
        if (!hasLoggedIssue) {
          // Also check current hour as fallback
          const hasCurrentHourIssue = hasLoggedIssueForCurrentHour(portfolioId);
          if (!hasCurrentHourIssue) {
            setSitesCheckError('Please log an issue for this hour before confirming all sites checked.');
            setUpdatingSitesCheckPortfolio(null);
            return;
          }
        }
      }
      
      // Prepare update data
      const updateData = {
        all_sites_checked: value,
        all_sites_checked_hour: value ? currentHour : null,
        all_sites_checked_date: value ? today : null
      };
      
      // If "No" is selected, preserve existing text or save new text
      // If "Yes" is selected, clear the text
      if (!value) {
        // Keep existing text if no new text entered, otherwise save new text
        if (sitesCheckedText.trim()) {
          updateData.sites_checked_details = sitesCheckedText.trim();
        } else if (record.sites_checked_details) {
          // Preserve existing text if user didn't enter new text
          updateData.sites_checked_details = record.sites_checked_details;
        }
      } else if (value) {
        // Clear text when "Yes" is selected
        updateData.sites_checked_details = null;
      }
      
      const { error } = await supabase
        .from('portfolios')
        .update(updateData)
        .eq('portfolio_id', portfolioId);

      if (error) {
        // If error is about missing sites_checked_details column, try without it
        if (error.message && error.message.includes('sites_checked_details') && error.message.includes('schema cache')) {
          console.warn('sites_checked_details column not found, updating without it');
          const updateDataWithoutDetails = {
            all_sites_checked: value,
            all_sites_checked_hour: value ? currentHour : null,
            all_sites_checked_date: value ? today : null
          };
          const { error: retryError } = await supabase
            .from('portfolios')
            .update(updateDataWithoutDetails)
            .eq('portfolio_id', portfolioId);
          if (retryError) throw retryError;
        } else {
          throw error;
        }
      }

      setPortfolios(prev =>
        prev.map(p =>
          (p.portfolio_id || p.id) === portfolioId
            ? { 
                ...p, 
                all_sites_checked: value,
                all_sites_checked_hour: value ? currentHour : null,
                all_sites_checked_date: value ? today : null,
                sites_checked_details: value ? null : (sitesCheckedText.trim() || p.sites_checked_details || null)
              }
            : p
        )
      );

      if (value) {
        // CRITICAL FIX: Release ALL reservations for this portfolio when "All Sites Checked" = Yes
        // This allows:
        // 1. The current user to immediately lock another portfolio after completing one
        // 2. Other users to lock this portfolio again in the same hour (since it's now free)
        console.log(`🔓 Releasing ALL locks for portfolio: ${portfolioName} (ID: ${portfolioId}) - allowing other users to lock it again`);
        await releaseReservationForPortfolio(portfolioId, null, true); // true = release ALL users' locks for this portfolio
        setSitesCheckedText(''); // Clear text when "Yes" is selected
        setShowSitesCheckedInput(false);
        // Force immediate refresh to update UI for all users
        await fetchActiveReservations();
        await fetchDataBackground();
        console.log('✅ All locks released for portfolio. Any user can now lock it again in the same hour.');
      }
    } catch (err) {
      console.error('Error updating sites checked status in Supabase:', err);
      setSitesCheckError('Failed to update sites status. Please try again.');
    } finally {
      setUpdatingSitesCheckPortfolio(null);
    }
  };

  const selectedPortfolioRecord = selectedPortfolioForAction
    ? findPortfolioRecord(selectedPortfolioForAction)
    : null;
  const selectedPortfolioSitesChecked = selectedPortfolioRecord?.all_sites_checked === true;
  
  // Load sites checked text when modal opens or portfolio changes
  useEffect(() => {
    if (selectedPortfolioRecord?.sites_checked_details) {
      setSitesCheckedText(selectedPortfolioRecord.sites_checked_details);
      setShowSitesCheckedInput(true);
    } else {
      setSitesCheckedText('');
      setShowSitesCheckedInput(selectedPortfolioSitesChecked === false);
    }
  }, [selectedPortfolioForAction, selectedPortfolioRecord?.sites_checked_details, selectedPortfolioSitesChecked]);

  const autoInsertPortfolios = async () => {
    console.log('🔧 Auto-inserting portfolios to database...');
    try {
      const portfoliosToInsert = portfolioCards.map(p => ({ name: p.name }));
      const { data, error } = await supabase
        .from('portfolios')
        .insert(portfoliosToInsert)
        .select();
      
      if (error) {
        console.error('❌ Error auto-inserting portfolios:', error);
      } else {
        console.log('✅ Successfully inserted', data.length, 'portfolios');
        // Refresh data
        fetchData();
      }
    } catch (error) {
      console.error('❌ Unexpected error auto-inserting portfolios:', error);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch portfolios - Always fetch fresh data (no cache)
      const { data: portfoliosData, error: portfoliosError } = await supabase
        .from('portfolios')
        .select('*')
        .order('name');
      
      if (portfoliosError) {
        console.error('❌ Error fetching portfolios:', portfoliosError);
        // Use hardcoded portfolios as fallback
        const hardcodedPortfolios = portfolioCards.map((p, index) => ({
          portfolio_id: `temp-${index}`,
          name: p.name,
          created_at: new Date().toISOString(),
          all_sites_checked: false
        }));
        setPortfolios(hardcodedPortfolios);
        console.log('✅ Using hardcoded portfolios as fallback:', hardcodedPortfolios.length);
      } else {
        console.log('✅ Fetched portfolios from database:', portfoliosData?.length || 0);
        if (!portfoliosData || portfoliosData.length === 0) {
          console.warn('⚠️ Database portfolios table is empty. Auto-inserting...');
          // Automatically insert portfolios
          await autoInsertPortfolios();
        } else {
          setPortfolios(portfoliosData);
          // Debug: Log portfolios with site ranges
          const portfoliosWithSites = portfoliosData.filter(p => p.site_range);
          if (portfoliosWithSites.length > 0) {
            console.log('✅ Portfolios with site ranges:', portfoliosWithSites.map(p => ({ name: p.name, site_range: p.site_range })));
          }
          // Debug: Check specifically for Mid Atlantic 1
          const midAtlantic1 = portfoliosData.find(p => p.name === 'Mid Atlantic 1' || p.name === 'Mid Atlantic 1');
          if (midAtlantic1) {
            console.log('🔍 Mid Atlantic 1 portfolio data:', midAtlantic1);
            console.log('🔍 Mid Atlantic 1 site_range:', midAtlantic1.site_range);
          }
        }
      }

      // Fetch sites
      const { data: sitesData, error: sitesError } = await supabase
        .from('sites')
        .select('*');
        // .order('site_name');  // Temporarily disabled - column may not exist
      
      if (sitesError) throw sitesError;
      setSites(sitesData || []);

      // Fetch issues with portfolio names
      const { data: issuesData, error: issuesError } = await supabase
        .from('issues')
        .select(`
          *,
          portfolios (
            portfolio_id,
            name
          )
        `)
        .order('created_at', { ascending: false });
      
      if (issuesError) throw issuesError;
      
      // Transform the data to include portfolio_name at root level
      const transformedIssues = (issuesData || []).map(issue => ({
        ...issue,
        portfolio_name: issue.portfolios?.name || 'Unknown'
      }));
      
      setIssues(transformedIssues);
      
      // Update last refresh timestamp
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // BACKGROUND FETCH - Same as fetchData but WITHOUT setting loading state
  // This prevents UI disruption during auto-refresh
  const fetchDataBackground = async () => {
    try {
      // NO setLoading(true) here - this is the key difference!
      
      // Fetch portfolios - Always fetch fresh data (no cache)
      const { data: portfoliosData, error: portfoliosError } = await supabase
        .from('portfolios')
        .select('*')
        .order('name');
      
      if (portfoliosError) {
        console.error('❌ Error fetching portfolios (background):', portfoliosError);
        // Don't update on error during background refresh
      } else {
        if (portfoliosData && portfoliosData.length > 0) {
          // CRITICAL: Force state update to trigger re-render
          // This ensures green cards update for all users
          setPortfolios(prev => {
            // Only update if data actually changed (by comparing JSON)
            const prevJson = JSON.stringify(prev);
            const newJson = JSON.stringify(portfoliosData);
            if (prevJson !== newJson) {
              return portfoliosData;
            }
            // Force update anyway to ensure UI refreshes
            return [...portfoliosData];
          });
        }
      }

      // Fetch sites
      const { data: sitesData, error: sitesError } = await supabase
        .from('sites')
        .select('*');
      
      if (!sitesError && sitesData) {
        setSites(sitesData);
      }

      // Fetch issues with portfolio names
      const { data: issuesData, error: issuesError } = await supabase
        .from('issues')
        .select(`
          *,
          portfolios (
            portfolio_id,
            name
          )
        `)
        .order('created_at', { ascending: false });
      
      if (!issuesError && issuesData) {
        // Transform the data to include portfolio_name at root level
        const transformedIssues = issuesData.map(issue => ({
          ...issue,
          portfolio_name: issue.portfolios?.name || 'Unknown'
        }));
        
        console.log(`📊 Fetched ${transformedIssues.length} issues at ${new Date().toLocaleTimeString()}`);
        setIssues(transformedIssues);
        // Update last refresh timestamp
        setLastRefresh(new Date());
      } else if (issuesError) {
        console.error('❌ Error fetching issues:', issuesError);
      }
    } catch (error) {
      console.error('Error in background fetch:', error);
      // Silently fail - don't disrupt user experience
    }
    // NO setLoading(false) here - we never set it to true!
  };

  const fetchActiveReservations = async () => {
    try {
      // CRITICAL FIX: Always fetch fresh reservations with portfolio names
      // IMPORTANT: Only fetch locks for the CURRENT hour - locks from previous hours are invalid
      const { data, error } = await supabase
        .from('hour_reservations')
        .select(`
          *,
          portfolios (
            portfolio_id,
            name
          )
        `)
        .eq('issue_hour', currentHour) // CRITICAL: Only get locks for current hour
        .gt('expires_at', new Date().toISOString())
        .order('reserved_at', { ascending: false }); // Get most recent first
      
      if (error) {
        console.error('Error fetching reservations:', error);
        return;
      }
      
      // Transform data to include portfolio_name at root level
      // CRITICAL: Ensure portfolio_name is always set correctly
      const transformedData = (data || []).map(r => {
        const portfolioName = r.portfolios?.name || 
                             (r.portfolio_name ? r.portfolio_name : 'Unknown');
        const portfolioId = r.portfolio_id || 
                           r.portfolios?.portfolio_id || 
                           null;
        
        return {
          ...r,
          portfolio_name: portfolioName,
          portfolio_id: portfolioId || r.portfolio_id
        };
      });
      
      // CRITICAL: Force state update even if data looks the same
      // This ensures React re-renders the cards
      setActiveReservations(transformedData);
      
      // Debug: Log reservations for troubleshooting
      console.log(`🔒 Fetched ${transformedData.length} active reservations at ${new Date().toLocaleTimeString()}`);
      if (transformedData.length > 0) {
        console.log('🔒 Active reservations:', transformedData.map(r => ({
          portfolio: r.portfolio_name,
          portfolio_id: r.portfolio_id,
          hour: r.issue_hour,
          user: r.monitored_by,
          expires_at: r.expires_at
        })));
      } else {
        console.log('🔒 No active reservations found');
      }
    } catch (error) {
      console.error('Error fetching active reservations:', error);
    }
  };

  const getLatestIssueForPortfolio = (portfolioName) => {
    const portfolioIssues = issues
      .filter(issue => issue.portfolio_name === portfolioName)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return portfolioIssues.length > 0 ? portfolioIssues[0] : null;
  };

  // Get last activity hour for a portfolio (from any date, not just today)
  // Returns { hour: number, isYesterday: boolean } or null
  const getLastActivityHour = (portfolioName) => {
    // Filter all issues for this portfolio (not just today)
    // Match by portfolio_name (exact match, case-insensitive)
    const portfolioIssues = issues
      .filter(issue => {
        const issuePortfolioName = (issue.portfolio_name || '').trim();
        const targetName = portfolioName.trim();
        return issuePortfolioName.toLowerCase() === targetName.toLowerCase();
      })
      .sort((a, b) => {
        // Sort by created_at descending (most recent first)
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateB - dateA;
      });

    if (portfolioIssues.length === 0) {
      return null; // No activity at all
    }

    // Get the most recent issue
    const latestIssue = portfolioIssues[0];
    const lastHour = latestIssue.issue_hour;
    
    if (lastHour === null || lastHour === undefined) {
      return null;
    }

    // Check if the issue is from yesterday (or earlier)
    // Use date strings for more reliable comparison (avoids timezone issues)
    const today = new Date();
    const todayDateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
    
    const issueDate = new Date(latestIssue.created_at);
    const issueDateStr = issueDate.toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Calculate yesterday's date string
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayDateStr = yesterday.toISOString().split('T')[0]; // YYYY-MM-DD
    
    // CRITICAL FIX: If issue hour is greater than current hour, it's definitely from yesterday
    // (or earlier) because hours can't be in the future. This is the most reliable check.
    let isYesterday = false;
    
    if (lastHour > currentHour) {
      // Issue hour is in the future relative to current hour, so it must be from yesterday or earlier
      isYesterday = true;
    } else if (issueDateStr < todayDateStr) {
      // Issue date is before today, so it's from yesterday or earlier
      isYesterday = true;
    } else if (issueDateStr === yesterdayDateStr) {
      // Issue date matches yesterday's date
      isYesterday = true;
    }
    // If issueDateStr === todayDateStr and lastHour <= currentHour, then isYesterday = false (it's from today)

    return {
      hour: lastHour,
      isYesterday: isYesterday
    };
  };

  // Get sites for a portfolio - show site_range if available, otherwise calculate from sites
  const getPortfolioSites = (portfolio) => {
    // First check if portfolio has a site_range field (from database)
    if (portfolio.site_range && String(portfolio.site_range).trim() !== '') {
      const siteRange = String(portfolio.site_range).trim();
      console.log(`✅ Found site_range for ${portfolio.name}:`, siteRange);
      return siteRange;
    }
    
    // Debug: Log if no site_range found
    if (!portfolio.site_range) {
      console.log(`⚠️ No site_range for ${portfolio.name}`);
    }
    
    // If no site_range, check if there are sites in the sites table
    if (!portfolio.portfolio_id) return null;
    if (!sites || sites.length === 0) return null;
    
    const portfolioSites = sites.filter(site => {
      return site.portfolio_id === portfolio.portfolio_id || 
             String(site.portfolio_id) === String(portfolio.portfolio_id);
    }).map(site => site.site_name || site.name).sort();

    if (portfolioSites.length === 0) return null;

    // If sites are numeric, try to show as range
    const numericSites = portfolioSites
      .map(name => {
        const match = name.match(/(\d+)/);
        return match ? parseInt(match[1]) : null;
      })
      .filter(num => num !== null)
      .sort((a, b) => a - b);

    if (numericSites.length > 0 && numericSites.length === portfolioSites.length) {
      // All sites are numeric - show as range
      const min = numericSites[0];
      const max = numericSites[numericSites.length - 1];
      if (min === max) {
        return `Site ${min}`;
      } else if (numericSites.length === max - min + 1) {
        // Continuous range
        return `Sites ${min} - ${max}`;
      } else {
        // Non-continuous, show count
        return `${portfolioSites.length} sites (${min}-${max})`;
      }
    }

    // Non-numeric or mixed - show first few and count
    if (portfolioSites.length <= 3) {
      return portfolioSites.join(', ');
    } else {
      return `${portfolioSites.slice(0, 2).join(', ')}, ... (${portfolioSites.length} total)`;
    }
  };

  // Get portfolio status for dashboard cards
  const getPortfolioStatus = (portfolioName) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const portfolioIssues = issues.filter(issue => {
      const issueDate = new Date(issue.created_at);
      issueDate.setHours(0, 0, 0, 0);
      return issue.portfolio_name === portfolioName && 
             issueDate.getTime() === today.getTime();
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const sitesConfirmed = isPortfolioSitesChecked(portfolioName);
    const record = findPortfolioRecord(portfolioName);
    const checkedHour = record?.all_sites_checked_hour ? normalizeCheckedHour(record.all_sites_checked_hour) : null;

    if (portfolioIssues.length === 0) {
      return { 
        status: 'No Activity (4h+)', 
        color: 'bg-red-100 border-red-300', 
        textColor: 'text-red-800' 
      };
    }

    // Find the most recent issue
    const latestIssue = portfolioIssues[0];
    const hoursDiff = currentHour - latestIssue.issue_hour;

    if (!sitesConfirmed) {
      return { 
        status: 'Awaiting sites confirmation', 
        color: 'bg-yellow-100 border-yellow-300', 
        textColor: 'text-yellow-800' 
      };
    }

    // CRITICAL FIX: If sites are confirmed, check if it's still the same hour
    // If checked in current hour, ALWAYS show green until next hour
    // This ensures once "All Sites Checked" = Yes is clicked, it stays green for the entire hour
    if (sitesConfirmed && checkedHour !== null && checkedHour === currentHour) {
      // Portfolio was checked in current hour - stay green for entire hour
      return { 
        status: 'Updated (<1h)', 
        color: 'bg-green-100 border-green-300', 
        textColor: 'text-green-800' 
      };
    }

    // Handle negative hoursDiff (e.g., issue logged at hour 23, current hour is 0)
    // In this case, treat as if it's from previous day, so it's 4h+
    if (hoursDiff < 0 || hoursDiff >= 4) {
      return { 
        status: 'No Activity (4h+)', 
        color: 'bg-red-100 border-red-300', 
        textColor: 'text-red-800' 
      };
    } else if (hoursDiff < 1) {
      return { 
        status: 'Updated (<1h)', 
        color: 'bg-green-100 border-green-300', 
        textColor: 'text-green-800' 
      };
    } else if (hoursDiff === 1) {
      return { 
        status: '1h Inactive', 
        color: 'bg-blue-100 border-blue-300', 
        textColor: 'text-blue-800' 
      };
    } else if (hoursDiff === 2) {
      return { 
        status: '2h Inactive', 
        color: 'bg-yellow-200 border-yellow-400', 
        textColor: 'text-yellow-900' 
      };
    } else if (hoursDiff === 3) {
      return { 
        status: '3h Inactive', 
        color: 'bg-orange-200 border-orange-400', 
        textColor: 'text-orange-900' 
      };
    } else {
      // Fallback for any other case (shouldn't happen, but just in case)
      return { 
        status: 'No Activity (4h+)', 
        color: 'bg-red-100 border-red-300', 
        textColor: 'text-red-800' 
      };
    }
  };

  // Check if portfolio is currently reserved (locked by someone)
  // CRITICAL FIX: Check for reservations for ANY hour, not just current hour
  // This ensures locks are visible even if they're for different hours
  const getPortfolioReservation = (portfolioName) => {
    const portfolio = portfolios.find(p => {
      const pName = (p.name || '').trim();
      return pName.toLowerCase() === portfolioName.trim().toLowerCase();
    });
    
    if (!portfolio) {
      console.warn(`⚠️ Portfolio not found: ${portfolioName}`);
      return null;
    }
    
    const portfolioId = portfolio.portfolio_id || portfolio.id;
    if (!portfolioId) {
      console.warn(`⚠️ Portfolio ID not found for: ${portfolioName}`);
      return null;
    }
    
    // Normalize IDs to strings for comparison (handles UUID and integer types)
    const normalizedPortfolioId = String(portfolioId).trim().toLowerCase();
    
    // DEBUG: Log what we're searching for
    console.log(`🔍 Searching for reservation:`, {
      portfolioName,
      portfolioId,
      normalizedPortfolioId,
      activeReservationsCount: activeReservations.length,
      currentHour
    });
    
    // Find reservation for this portfolio - check by portfolio_id OR portfolio_name
    // Use multiple matching strategies to ensure we catch all reservations
    const reservation = activeReservations.find(r => {
      // Strategy 1: Match by portfolio name (case-insensitive)
      const rPortfolioName = (r.portfolio_name || '').trim();
      if (rPortfolioName && rPortfolioName.toLowerCase() === portfolioName.trim().toLowerCase()) {
        console.log(`✅ Found reservation by name match:`, r);
        return true;
      }
      
      // Strategy 2: Match by portfolio_id (normalized string comparison for UUID safety)
      const rPortfolioId = r.portfolio_id ? String(r.portfolio_id).trim().toLowerCase() : null;
      if (rPortfolioId && rPortfolioId === normalizedPortfolioId) {
        return true;
      }
      
      // Strategy 3: Match by nested portfolio object name
      const nestedName = (r.portfolios?.name || '').trim();
      if (nestedName && nestedName.toLowerCase() === portfolioName.trim().toLowerCase()) {
        return true;
      }
      
      // Strategy 4: Match by nested portfolio object ID
      const nestedId = r.portfolios?.portfolio_id ? String(r.portfolios.portfolio_id).trim().toLowerCase() : null;
      if (nestedId && nestedId === normalizedPortfolioId) {
        return true;
      }
      
      return false;
    });
    
    if (reservation) {
      console.log(`🔒 Found reservation for ${portfolioName}:`, {
        portfolio_id: reservation.portfolio_id,
        hour: reservation.issue_hour,
        user: reservation.monitored_by
      });
    }
    
    return reservation || null;
  };

  const handlePortfolioClick = async (portfolioName) => {
    // Track that this portfolio has been interacted with
    setInteractedPortfolios(prev => new Set([...prev, portfolioName]));
    
    setSelectedPortfolioForAction(portfolioName);
    setShowActionModal(true);
    
    // CRITICAL FIX: Immediately refresh data when clicking a portfolio
    // This ensures users see the latest status (locks, green cards, etc.)
    await fetchActiveReservations();
    fetchDataBackground();
    
    // Check if portfolio is locked by someone else (check by monitored_by name)
    const portfolioToCheck = portfolios.find((p) => p.name === portfolioName);
    if (portfolioToCheck) {
      const portfolioId = portfolioToCheck.portfolio_id || portfolioToCheck.id;
      if (portfolioId) {
        const sessionId = ensureSessionId();
        const nowIso = new Date().toISOString();
        const loggedInUser = sessionStorage.getItem('username') || 
                            sessionStorage.getItem('fullName') || 
                            '';
        const currentUser = String(loggedInUser || '').trim();

        console.log('🔍 Checking lock for portfolio:', {
          portfolioName,
          portfolioId,
          currentHour,
          myUser: currentUser,
          mySessionId: sessionId
        });

        const { data: activeReservations, error: reservationCheckError } = await supabase
          .from('hour_reservations')
          .select('*')
          .eq('portfolio_id', portfolioId)
          .eq('issue_hour', currentHour)
          .gt('expires_at', nowIso);

        if (reservationCheckError) {
          console.error('Error checking reservation:', reservationCheckError);
          setIsPortfolioLockedByOther(false);
          setPortfolioLockedBy(null);
          return;
        }

        console.log('📋 Active reservations found:', activeReservations?.length || 0);
        if (activeReservations && activeReservations.length > 0) {
          activeReservations.forEach((r, idx) => {
            console.log(`  Reservation ${idx + 1}:`, {
              monitored_by: r.monitored_by,
              session_id: r.session_id,
              portfolio_id: r.portfolio_id,
              hour: r.issue_hour
            });
          });

          // Check if it's MY lock by comparing monitored_by name
          const myActiveReservations = activeReservations.filter(r => {
            const rMonitoredBy = String(r.monitored_by || '').trim();
            const rSessionId = String(r.session_id || '').trim();
            const sessionMatches = rSessionId === String(sessionId || '').trim();
            const userMatches = rMonitoredBy.toLowerCase() === currentUser.toLowerCase();
            const isMyLock = sessionMatches && userMatches;
            
            console.log('🔍 Checking if reservation is mine:', {
              reservationMonitoredBy: rMonitoredBy,
              myUser: currentUser,
              userMatches,
              reservationSessionId: rSessionId,
              mySessionId: String(sessionId || '').trim(),
              sessionMatches,
              isMyLock
            });
            
            return isMyLock;
          });

          if (myActiveReservations.length === 0) {
            // Someone else has it locked - check by monitored_by name
            const otherLock = activeReservations[0];
            const lockedBy = String(otherLock.monitored_by || 'another user').trim();
            console.log('❌ Portfolio is locked by someone else:', lockedBy);
            setIsPortfolioLockedByOther(true);
            setPortfolioLockedBy(lockedBy);
          } else {
            // It's my lock
            console.log('✅ Portfolio is locked by me');
            setIsPortfolioLockedByOther(false);
            setPortfolioLockedBy(null);
          }
        } else {
          // No lock found
          console.log('ℹ️ No lock found for this portfolio');
          setIsPortfolioLockedByOther(false);
          setPortfolioLockedBy(null);
        }
      }
    }
  };

  const handleViewIssues = () => {
    const targetName = selectedPortfolioForAction;
    setShowActionModal(false);

    // If we can resolve portfolio id, pass it so Issue Details can default to that portfolio
    const record = portfolios.find((p) => p.name === targetName);
    const pid = record?.portfolio_id || record?.id || '';
    setIssueDetailsInitialPortfolioId(pid || '');
    setActiveTab('issueDetails');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogIssue = async () => {
    // CRITICAL: Check state first - if button is disabled, don't proceed
    if (isPortfolioLockedByOther) {
      alert(`❌ ERROR: This portfolio "${selectedPortfolioForAction}" (Hour ${currentHour}) is locked by "${portfolioLockedBy}".\n\nOnly the person who locked it can log issues.`);
      return; // Block immediately
    }

    setShowActionModal(false);

    // CRITICAL VALIDATION: Double-check if portfolio is locked by someone else before opening drawer
    const portfolioToSelect = portfolios.find(
      (p) => p.name === selectedPortfolioForAction
    );
    
    if (!portfolioToSelect) {
      alert('❌ ERROR: Portfolio not found.');
      return;
    }

    const portfolioId = portfolioToSelect.portfolio_id || portfolioToSelect.id;
    if (!portfolioId) {
      alert('❌ ERROR: Portfolio ID not found.');
      return;
    }

    // Check if portfolio is locked by someone else
    const sessionId = ensureSessionId();
    const nowIso = new Date().toISOString();
    const loggedInUser = sessionStorage.getItem('username') || 
                        sessionStorage.getItem('fullName') || 
                        '';
    const currentUser = String(loggedInUser || '').trim();

    const { data: activeReservations, error: reservationCheckError } = await supabase
      .from('hour_reservations')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .eq('issue_hour', currentHour)
      .gt('expires_at', nowIso);

    if (reservationCheckError) {
      console.error('Error checking reservation:', reservationCheckError);
      alert('❌ ERROR: Unable to verify portfolio lock. Please try again.');
      return;
    }

    // Check if someone else has it locked
    if (activeReservations && activeReservations.length > 0) {
      // Filter to see if it's MY lock by comparing monitored_by name (case-insensitive)
      const myActiveReservations = activeReservations.filter(r => {
        const rSessionId = String(r.session_id || '').trim();
        const rMonitoredBy = String(r.monitored_by || '').trim();
        const sessionMatches = rSessionId === String(sessionId || '').trim();
        const userMatches = rMonitoredBy.toLowerCase() === currentUser.toLowerCase();
        return sessionMatches && userMatches;
      });

      if (myActiveReservations.length === 0) {
        // Someone else has it locked
        const otherLock = activeReservations[0];
        const lockedBy = String(otherLock.monitored_by || 'another user').trim();
        alert(`❌ ERROR: This portfolio "${selectedPortfolioForAction}" (Hour ${currentHour}) is locked by "${lockedBy}".\n\nOnly the person who locked it can open the session sheet and add issues.`);
        return; // Don't open the drawer
      }
    }

    // CRITICAL: Only pre-select portfolio if it's NOT locked by someone else
    // If it's locked by someone else, don't dispatch the event (which would create a new lock)
    if (isPortfolioLockedByOther) {
      console.log('🚫 NOT pre-selecting portfolio - it is locked by someone else');
      return; // Don't proceed - don't open drawer, don't pre-select
    }

    // Restore original behavior: scroll to main log form and pre-select portfolio
    setTimeout(() => {
      const formElement = document.getElementById('issue-log-form');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      if (portfolioToSelect) {
        if (portfolioId) {
          console.log('📋 Pre-selecting portfolio:', selectedPortfolioForAction, 'ID:', portfolioId);
          // This event is listened to by TicketLoggingTable to set portfolio_id,
          // which in turn triggers the locking/reservation logic.
          // CRITICAL: Only dispatch if portfolio is not locked by someone else
          window.dispatchEvent(
            new CustomEvent('preSelectPortfolio', {
              detail: { portfolio_id: portfolioId },
            })
          );
        } else {
          console.warn('⚠️ Portfolio ID not found for:', selectedPortfolioForAction);
        }
      }
    }, 100);

    // CRITICAL: Only open drawer if portfolio is NOT locked by someone else
    // Double-check one more time before opening
    if (isPortfolioLockedByOther) {
      console.log('🚫 NOT opening drawer - portfolio is locked by someone else');
      return; // Don't open drawer
    }

    // Also open the new session sheet for this portfolio and current hour
    setSessionPortfolioName(selectedPortfolioForAction);
    setSessionHour(currentHour);
  };

  const handleEditIssue = async (issue) => {
    // CRITICAL: Only the person who logged the issue (monitored_by) can edit it
    const loggedInUser = sessionStorage.getItem('username') || 
                        sessionStorage.getItem('fullName') || 
                        '';
    
    const issueMonitoredBy = (issue.monitored_by || '').trim();
    const currentUser = loggedInUser.trim();
    
    // Check if current user matches the person who logged the issue
    if (!issueMonitoredBy || currentUser.toLowerCase() !== issueMonitoredBy.toLowerCase()) {
      alert(`❌ ERROR: Only the person who logged this issue can edit it.\n\nThis issue was logged by: ${issueMonitoredBy || 'Unknown'}\n\nYou are logged in as: ${currentUser || 'Unknown'}`);
      return;
    }

    // CRITICAL: Also check if the portfolio is locked by someone else
    // Even if you logged the issue, you can't edit it if someone else has the portfolio locked
    const portfolioId = issue.portfolio_id;
    if (portfolioId) {
      const sessionId = ensureSessionId();
      const nowIso = new Date().toISOString();
      const issueHour = issue.issue_hour;

      const { data: activeReservations, error: reservationCheckError } = await supabase
        .from('hour_reservations')
        .select('*')
        .eq('portfolio_id', portfolioId)
        .eq('issue_hour', issueHour)
        .gt('expires_at', nowIso);

      if (!reservationCheckError && activeReservations && activeReservations.length > 0) {
        // Check if it's MY lock (both session_id AND monitored_by must match)
        const myActiveReservations = activeReservations.filter(r => {
          const rSessionId = String(r.session_id || '').trim();
          const rMonitoredBy = String(r.monitored_by || '').trim();
          const sessionMatches = rSessionId === String(sessionId || '').trim();
          const userMatches = rMonitoredBy.toLowerCase() === currentUser.toLowerCase();
          return sessionMatches && userMatches;
        });

        if (myActiveReservations.length === 0) {
          // Someone else has it locked
          const otherLock = activeReservations[0];
          const lockedBy = String(otherLock.monitored_by || 'another user').trim();
          const portfolioName = portfolios.find(p => 
            (p.portfolio_id || p.id) === portfolioId
          )?.name || 'this portfolio';
          
          alert(`❌ ERROR: Cannot edit issue. This portfolio "${portfolioName}" (Hour ${issueHour}) is currently locked by "${lockedBy}".\n\nOnly the person who has the portfolio locked can edit issues in it.`);
          return; // Block editing
        }
      }
    }
    
    setEditingIssue(issue);
    setShowEditModal(true);
  };

  const handleUpdateIssue = async (updatedIssue) => {
    try {
      // Extract only the database columns (remove portfolio_name, site_name, etc.)
      const {
        portfolio_name,
        site_name,
        ...issueData
      } = updatedIssue;

      // Prepare update data, converting empty strings to null for UUID fields
      const updateData = {
        portfolio_id: issueData.portfolio_id || null,
        site_id: issueData.site_id || null,
        issue_hour: issueData.issue_hour,
        issue_present: issueData.issue_present,
        issue_details: issueData.issue_details,
        case_number: issueData.case_number,
        monitored_by: issueData.monitored_by,
        issues_missed_by: issueData.issues_missed_by,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('issues')
        .update(updateData)
        .eq('issue_id', issueData.issue_id);

      if (error) throw error;

      alert('Issue updated successfully!');
      setShowEditModal(false);
      setEditingIssue(null);
      fetchData();
    } catch (error) {
      console.error('Error updating issue:', error);
      alert('Error updating issue: ' + error.message);
    }
  };

  const handleDeleteIssue = async (issue) => {
    // Only admins can delete issues
    if (!isAdmin) {
      alert('❌ ERROR: Only administrators can delete issues.');
      return;
    }

    const portfolioName = portfolios.find(p => 
      (p.portfolio_id || p.id) === issue.portfolio_id
    )?.name || 'Unknown Portfolio';

    const confirmMessage = `Are you sure you want to delete this issue?\n\n` +
      `Portfolio: ${portfolioName}\n` +
      `Hour: ${issue.issue_hour}\n` +
      `Monitored By: ${issue.monitored_by || 'N/A'}\n` +
      `Issue: ${issue.issue_details || 'No issue'}\n\n` +
      `This action cannot be undone!`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('issues')
        .delete()
        .eq('issue_id', issue.issue_id);

      if (error) throw error;

      alert('✅ Issue deleted successfully!');
      fetchData();
    } catch (error) {
      console.error('Error deleting issue:', error);
      alert('❌ Error deleting issue: ' + error.message);
    }
  };

  const scrollToForm = () => {
    const formElement = document.getElementById('issue-log-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdminPanelClose = () => {
    setShowAdminPanel(false);
    loadMonitoredPersonnel();
    fetchData();
  };

  const handleAdminButtonClick = () => {
    setShowAdminPanel(true);
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-full mx-auto px-6 py-4 flex flex-wrap md:flex-nowrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="American Green Solutions"
              className="h-12 w-auto object-contain"
            />
            <div className="flex flex-col leading-tight">
              <span className="text-2xl font-extrabold text-gray-900">Standard Solar</span>
              <span className="text-sm font-medium text-gray-600">Portfolio Issue Tracker</span>
            </div>
            {/* Auto-refresh indicator - subtle and non-disruptive */}
            {isAutoRefreshing && (
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                <span className="text-xs text-blue-700 font-medium">Refreshing...</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            {/* User Info */}
            <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isAdmin ? 'bg-green-700' : 'bg-green-600'}`}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="text-xs text-gray-500">{isAdmin ? 'Admin' : 'User'}</div>
                  <div className="text-sm font-semibold text-gray-900">
                    {sessionStorage.getItem('fullName') || sessionStorage.getItem('username') || 'User'}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Admin Panel Button - Only visible to admins */}
            {isAdmin && (
              <button 
                onClick={handleAdminButtonClick}
                className="px-4 py-2 bg-green-700 text-white rounded hover:bg-green-800 text-sm font-medium transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Admin Panel
              </button>
            )}
            
            {/* Logout Button */}
            <button 
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
            
            <div className="text-center px-4 py-2 rounded" style={{ backgroundColor: '#E8F5E0' }}>
              <div className="text-xs text-gray-600">Current Hour</div>
              <div className="text-2xl font-bold" style={{ color: '#76AB3F' }}>{currentHour}</div>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-[#76AB3F]">
        <div className="max-w-full mx-auto px-6">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-3 px-1 font-medium text-sm text-white hover:bg-[#689E36] ${
                activeTab === 'dashboard' ? 'border-b-2 border-white' : ''
              }`}
            >
              Dashboard & Log Issues
            </button>
            <button
              onClick={() => setActiveTab('issueDetails')}
              className={`py-3 px-1 font-medium text-sm text-white hover:bg-[#689E36] ${
                activeTab === 'issueDetails' ? 'border-b-2 border-white' : ''
              }`}
            >
              Issue Details
            </button>
            <button
              onClick={() => setActiveTab('performance')}
              className={`py-3 px-1 font-medium text-sm text-white hover:bg-[#689E36] ${
                activeTab === 'performance' ? 'border-b-2 border-white' : ''
              }`}
            >
              Performance Analytics
            </button>
            <button
              onClick={() => setActiveTab('issuesByUser')}
              className={`py-3 px-1 font-medium text-sm text-white hover:bg-[#689E36] ${
                activeTab === 'issuesByUser' ? 'border-b-2 border-white' : ''
              }`}
            >
              Issues by User
            </button>
            <button
              onClick={() => setActiveTab('portfolioMatrix')}
              className={`py-3 px-1 font-medium text-sm text-white hover:bg-[#689E36] ${
                activeTab === 'portfolioMatrix' ? 'border-b-2 border-white' : ''
              }`}
            >
              Coverage Matrix
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-full mx-auto px-6 py-6">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Quick Portfolio Reference Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Quick Portfolio Reference</h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Last updated: {lastRefresh.toLocaleTimeString()} (Auto-refreshes every 3s for real-time sync)
                    {isAutoRefreshing && <span className="ml-2 text-blue-600">🔄 Refreshing...</span>}
                  </p>
                  <div className="flex gap-6 mt-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
                      <span className="text-gray-600">No Activity (4h+)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-orange-200 border border-orange-400 rounded"></div>
                      <span className="text-gray-600">3h</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-200 border border-yellow-400 rounded"></div>
                      <span className="text-gray-600">2h</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
                      <span className="text-gray-600">1h</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
                      <span className="text-gray-600">Updated (&lt;1h)</span>
                    </div>
                  </div>
                  {/* Border Legend */}
                  <div className="flex gap-6 mt-3 text-xs border-t pt-2"></div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Small Search Bar */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search..."
                      value={portfolioSearchTerm}
                      onChange={(e) => setPortfolioSearchTerm(e.target.value)}
                      className="w-40 px-2 py-1.5 pl-7 pr-6 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <svg
                      className="absolute left-2 top-1.5 h-3.5 w-3.5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    {portfolioSearchTerm && (
                      <button
                        onClick={() => setPortfolioSearchTerm('')}
                        className="absolute right-1.5 top-1.5 text-gray-400 hover:text-gray-600"
                      >
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <button
                    onClick={scrollToForm}
                    className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
                  >
                    <span>+</span> Log New Issue
                  </button>
                </div>
              </div>

              {/* Portfolio Cards Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-1.5">
                {portfolioCards
                  .filter(portfolio => 
                    portfolio.name.toLowerCase().includes(portfolioSearchTerm.toLowerCase())
                  )
                  .map((portfolio) => {
                  const status = getPortfolioStatus(portfolio.name);
                  const reservation = getPortfolioReservation(portfolio.name);
                  
                  // Get latest issue for this portfolio to show who logged it (used in tooltip)
                  const latestIssue = getLatestIssueForPortfolio(portfolio.name);
                  const loggedBy = latestIssue?.monitored_by || 'No data';
                  
                  // Determine card styling based on reservation
                  // Only show purple border when locked, no other borders
                  let cardColor = status.color;
                  let cardBorder = ''; // No border by default
                  let cardTextColor = status.textColor;
                  
                  // Check if portfolio is green (all sites checked + updated)
                  const sitesConfirmed = isPortfolioSitesChecked(portfolio.name);
                  const isGreenStatus = sitesConfirmed && status.color.includes('green');
                  
                  // PRIORITY 1: If locked, ALWAYS show PURPLE BORDER (thick) - regardless of green status
                  // CRITICAL: Lock status takes priority - purple border should always show when locked
                  if (reservation) {
                    cardBorder = 'border-[6px] border-purple-600 !border-purple-600';
                    console.log(`🔒 Showing purple border for locked portfolio: ${portfolio.name}`, {
                      reservation,
                      isGreenStatus,
                      sitesConfirmed
                    });
                  }
                  
                  // Get last activity hour
                  const lastActivityHour = getLastActivityHour(portfolio.name);
                  
                  // Get sites for this portfolio
                  const portfolioSites = getPortfolioSites(portfolio);
                  
                  // Debug: Log for Mid Atlantic 1 specifically
                  if (portfolio.name === 'Mid Atlantic 1') {
                    console.log('🔍 Mid Atlantic 1 in render:', {
                      name: portfolio.name,
                      site_range: portfolio.site_range,
                      portfolioSites: portfolioSites,
                      portfolioObject: portfolio
                    });
                  }
                  
                  return (
                    <div
                      key={portfolio.name}
                      onClick={() => handlePortfolioClick(portfolio.name)}
                      className={`px-1.5 py-2.5 rounded ${cardColor} ${cardBorder} transition-all hover:shadow-md cursor-pointer relative group`}
                    >
                      {/* Last Activity Hour - Top Right Corner - Always Visible */}
                      {lastActivityHour !== null ? (
                        <div className={`absolute top-0.5 right-0.5 px-1 py-0.5 rounded text-[9px] font-semibold z-10 ${
                          lastActivityHour.isYesterday 
                            ? 'bg-blue-700 text-white' 
                            : 'bg-gray-800 text-white'
                        }`}>
                          {lastActivityHour.isYesterday ? `Y ${lastActivityHour.hour}` : `H ${lastActivityHour.hour}`}
                        </div>
                      ) : (
                        <div className="absolute top-0.5 right-0.5 bg-gray-800 text-white px-1 py-0.5 rounded text-[9px] font-semibold z-10">
                          H -
                        </div>
                      )}
                      
                      <div className="font-semibold text-[11px] sm:text-xs text-gray-900 leading-tight">
                        {portfolio.name}
                      </div>
                      <div className="text-[10px] text-gray-600 mt-1">
                        {portfolio.subtitle}
                      </div>
                      
                      {/* Click indicator - shows on hover */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                        <div className={`${reservation ? 'bg-purple-600' : 'bg-blue-500'} text-white px-2 py-1 rounded text-xs font-medium`}>
                          Click for options
                        </div>
                      </div>
                      
                      {/* Hover Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 max-w-xs space-y-2">
                        {/* Logged By Box */}
                        <div className="bg-gray-900 text-white text-xs rounded shadow-lg px-3 py-1.5">
                          {reservation ? (
                            <>
                              🔒 Locked by: <span className="font-bold">{reservation.monitored_by}</span>
                              <br />
                              For Hour: <span className="font-bold">{reservation.issue_hour}</span>
                            </>
                          ) : (
                            <>
                              Logged by: {loggedBy}
                              {lastActivityHour !== null && (
                                <>
                                  <br />
                                  Last Activity: {lastActivityHour.isYesterday ? 'Yesterday' : 'Today'} Hour {lastActivityHour.hour}
                                </>
                              )}
                            </>
                          )}
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                        </div>
                        
                        {/* Site Range Box - Only show if site_range exists and is not empty */}
                        {portfolio.site_range && portfolio.site_range.trim() !== '' && (
                          <div className="bg-blue-900 text-white text-xs rounded shadow-lg px-3 py-1.5">
                            <span className="font-semibold">Site Range:</span> {portfolio.site_range}
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-blue-900"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Hourly Coverage Analysis */}
            <HourlyCoverageChart issues={issues} portfolios={portfolios} />

            {/* Ticket Logging Table */}
            <div id="issue-log-form">
              <TicketLoggingTable
                issues={issues}
                portfolios={portfolios}
                sites={sites}
                monitoredPersonnel={monitoredPersonnel}
                currentHour={currentHour}
                onRefresh={async () => {
                  // CRITICAL: Refresh both data and reservations after logging issue
                  await fetchData();
                  await fetchActiveReservations();
                  await fetchDataBackground();
                }}
                onEditIssue={handleEditIssue}
                onDeleteIssue={handleDeleteIssue}
                isAdmin={isAdmin}
              />
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <PerformanceAnalytics issues={issues} portfolios={portfolios} />
        )}

        {activeTab === 'issuesByUser' && (
          <IssuesByUser 
            issues={issues} 
            portfolios={portfolios}
            monitoredPersonnel={monitoredPersonnel}
            onEditIssue={handleEditIssue}
            onDeleteIssue={handleDeleteIssue}
            isAdmin={isAdmin}
          />
        )}

        {activeTab === 'portfolioMatrix' && (
          <PortfolioMonitoringMatrix
            issues={issues}
            portfolios={portfolios}
            monitoredPersonnel={monitoredPersonnel}
          />
        )}

        {activeTab === 'issueDetails' && (
          <IssueDetailsView
            issues={issues}
            portfolios={portfolios}
            onEditIssue={handleEditIssue}
            onDeleteIssue={handleDeleteIssue}
            isAdmin={isAdmin}
            initialPortfolioId={issueDetailsInitialPortfolioId}
            initialHour={currentHour}
          />
        )}
      </main>

      {/* Edit Issue Modal */}
      {showEditModal && editingIssue && (
        <EditIssueModal
          issue={editingIssue}
          portfolios={portfolios}
          sites={sites}
          monitoredPersonnel={monitoredPersonnel}
          onClose={() => {
            setShowEditModal(false);
            setEditingIssue(null);
          }}
          onSave={handleUpdateIssue}
        />
      )}

      {/* Admin Panel */}
      {showAdminPanel && isAdmin && (
        <AdminPanel onClose={handleAdminPanelClose} />
      )}

      {/* Portfolio Action Modal */}
      {showActionModal && selectedPortfolioForAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  {selectedPortfolioForAction}
                </h3>
                <button
                  onClick={() => {
                    setShowActionModal(false);
                    setSelectedPortfolioForAction(null);
                    setSitesCheckError(null);
                    setSitesCheckedText('');
                    setShowSitesCheckedInput(false);
                    setIsPortfolioLockedByOther(false);
                    setPortfolioLockedBy(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-6 space-y-4">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">All sites checked?</h4>
                      <p className="text-xs text-gray-600 mt-1">
                        Confirm after you verify every site belonging to this portfolio.
                      </p>
                    </div>
                    <span
                      className={`text-sm font-semibold ${
                        selectedPortfolioSitesChecked ? 'text-green-600' : 'text-yellow-600'
                      }`}
                    >
                      {selectedPortfolioSitesChecked ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => {
                        setShowSitesCheckedInput(false);
                        updatePortfolioSitesChecked(selectedPortfolioForAction, true);
                      }}
                      disabled={updatingSitesCheckPortfolio === selectedPortfolioForAction || isPortfolioLockedByOther}
                      title={isPortfolioLockedByOther ? `Only ${portfolioLockedBy} can mark this portfolio as complete. They must lock it first, log issues, then mark "All Sites Checked" = Yes.` : 'Mark all sites as checked'}
                      className={`flex-1 px-4 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                        selectedPortfolioSitesChecked
                          ? 'bg-green-600 text-white border-green-600'
                          : 'border-gray-300 text-gray-700 hover:border-green-500 hover:text-green-600'
                      } ${(updatingSitesCheckPortfolio === selectedPortfolioForAction || isPortfolioLockedByOther) ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => {
                        setShowSitesCheckedInput(true);
                        updatePortfolioSitesChecked(selectedPortfolioForAction, false);
                      }}
                      disabled={updatingSitesCheckPortfolio === selectedPortfolioForAction}
                      className={`flex-1 px-4 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                        selectedPortfolioSitesChecked === false
                          ? 'bg-yellow-500 text-white border-yellow-500'
                          : 'border-gray-300 text-gray-700 hover:border-yellow-500 hover:text-yellow-600'
                      } ${updatingSitesCheckPortfolio === selectedPortfolioForAction ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      No
                    </button>
                  </div>
                  
                  {/* Text input for sites checked when "No" is selected */}
                  {(selectedPortfolioSitesChecked === false || showSitesCheckedInput) && (
                    <div className="mt-4">
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        Which sites have you checked? (e.g., "Site 1 to Site 5", "Sites 1-10")
                      </label>
                      <input
                        type="text"
                        value={sitesCheckedText}
                        onChange={(e) => setSitesCheckedText(e.target.value)}
                        placeholder="Enter sites checked (e.g., Site 1 to Site 5)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        onBlur={() => {
                          // Auto-save when user leaves the input field (only if "No" is selected)
                          // Save new text if entered, otherwise preserve existing text
                          if ((selectedPortfolioSitesChecked === false || showSitesCheckedInput)) {
                            updatePortfolioSitesChecked(selectedPortfolioForAction, false);
                          }
                        }}
                      />
                    </div>
                  )}
                  
                  {/* Display saved sites checked details - show below input if text exists */}
                  {selectedPortfolioRecord?.sites_checked_details && 
                   (selectedPortfolioSitesChecked === false || showSitesCheckedInput) && 
                   !sitesCheckedText.trim() && (
                    <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-gray-700">
                      <span className="font-semibold">Sites checked: </span>
                      {selectedPortfolioRecord.sites_checked_details}
                    </div>
                  )}
                  
                  {sitesCheckError && (
                    <div className="mt-3 text-xs text-red-600">
                      {sitesCheckError}
                    </div>
                  )}
                </div>
                <p className="text-gray-600">What would you like to do?</p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleViewIssues}
                  className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 hover:border-blue-300 rounded-lg transition-all"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-gray-900">View Issues</div>
                      <div className="text-sm text-gray-600">See all logged issues for this portfolio</div>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                <button
                  onClick={(e) => {
                    if (isPortfolioLockedByOther) {
                      e.preventDefault();
                      e.stopPropagation();
                      alert(`❌ ERROR: This portfolio "${selectedPortfolioForAction}" (Hour ${currentHour}) is locked by "${portfolioLockedBy}".\n\nOnly the person who locked it can log issues.`);
                      return false;
                    }
                    handleLogIssue();
                  }}
                  disabled={isPortfolioLockedByOther}
                  className={`w-full flex items-center justify-between p-4 border-2 rounded-lg transition-all ${
                    isPortfolioLockedByOther
                      ? 'bg-gray-50 border-gray-300 cursor-not-allowed opacity-60'
                      : 'bg-green-50 hover:bg-green-100 border-green-200 hover:border-green-300'
                  }`}
                  title={isPortfolioLockedByOther ? `This portfolio is locked by ${portfolioLockedBy}. Only they can log issues.` : ''}
                  style={{ 
                    pointerEvents: isPortfolioLockedByOther ? 'none' : 'auto',
                    cursor: isPortfolioLockedByOther ? 'not-allowed' : 'pointer'
                  }}
                >
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
                      isPortfolioLockedByOther ? 'bg-gray-400' : 'bg-green-500'
                    }`}>
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {isPortfolioLockedByOther ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        )}
                      </svg>
                    </div>
                    <div className="text-left">
                      <div className={`font-semibold ${isPortfolioLockedByOther ? 'text-gray-500' : 'text-gray-900'}`}>
                        Log New Issue
                      </div>
                      <div className={`text-sm ${isPortfolioLockedByOther ? 'text-gray-400' : 'text-gray-600'}`}>
                        {isPortfolioLockedByOther 
                          ? (portfolioLockedBy === 'No lock - must lock first'
                              ? 'You must lock this portfolio first before logging issues'
                              : `Locked by ${portfolioLockedBy} - Only they can log issues`)
                          : 'Report a new issue for this portfolio'
                        }
                      </div>
                    </div>
                  </div>
                  {!isPortfolioLockedByOther && (
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Portfolio-Hour Session Sheet Drawer */}
      {sessionPortfolioName && sessionHour !== null && (
        <PortfolioHourSessionDrawer
          isOpen={true}
          portfolioName={sessionPortfolioName}
          hour={sessionHour}
          portfolios={portfolios}
          issues={issues}
          monitoredPersonnel={monitoredPersonnel}
          onClose={async () => {
            setSessionPortfolioName(null);
            setSessionHour(null);
            // CRITICAL FIX: Refresh data when closing drawer to ensure all users see updates
            await fetchData();
            await fetchActiveReservations();
          }}
          onRefresh={async () => {
            // CRITICAL FIX: Force full refresh when issues are added
            await fetchData();
            await fetchActiveReservations();
            // Also trigger background refresh to sync with other users
            await fetchDataBackground();
          }}
        />
      )}

      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 w-12 h-12 flex items-center justify-center rounded-full shadow-xl hover:shadow-2xl border-2 border-white hover:border-white transition-all duration-300 hover:scale-110 group"
          style={{ backgroundColor: '#76AB3F' }}
          title="Back to top"
          aria-label="Scroll to top"
        >
          <svg 
            className="w-5 h-5 text-white group-hover:text-white transition-colors duration-300" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2.5} 
              d="M5 10l7-7m0 0l7 7m-7-7v18" 
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default SinglePageComplete;
