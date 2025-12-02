import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../services/supabaseClient';

const getTodayString = () => new Date().toISOString().split('T')[0];

const TicketLoggingTable = ({ issues, portfolios, sites, monitoredPersonnel, currentHour, onRefresh, onEditIssue, onDeleteIssue, isAdmin = false }) => {
  const [filters, setFilters] = useState({
    searchText: '',
    dateFilter: getTodayString(),
    hourFilter: '',
    showAllIssues: true
  });

  // Separate export date range filters for CSV downloads
  const [exportFilters, setExportFilters] = useState({
    fromDate: getTodayString(),
    toDate: getTodayString()
  });

  const [formData, setFormData] = useState({
    portfolio_id: '',
    site_id: '',
    issue_hour: currentHour,
    issue_present: '',
    issue_details: '',
    case_number: '',
    monitored_by: '',
    issues_missed_by: '',
    entered_by: 'System'
  });

  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [reservationError, setReservationError] = useState(null);
  const [reservationMessage, setReservationMessage] = useState(null);
  const [myReservation, setMyReservation] = useState(null);

  const hours = Array.from({ length: 24 }, (_, i) => i);

  const loggedInUser = useMemo(() => {
    return (
      sessionStorage.getItem('username') ||
      sessionStorage.getItem('fullName') ||
      'LibsysAdmin'
    );
  }, []);

  const {
    portfolio_id: selectedPortfolioId,
    issue_hour: selectedIssueHour,
    monitored_by: selectedMonitor
  } = formData;

  useEffect(() => {
    setFormData(prev => ({ ...prev, issue_hour: currentHour }));
  }, [currentHour]);

  const ensureSessionId = () => {
    let sessionId = localStorage.getItem('session_id');
    if (!sessionId) {
      sessionId = `session-${Date.now()}`;
      localStorage.setItem('session_id', sessionId);
    }
    return sessionId;
  };

  const getPortfolioNameById = (portfolioId) => {
    if (!portfolioId) return 'Portfolio';
    const record = portfolios.find(
      (portfolio) => (portfolio.portfolio_id || portfolio.id) === portfolioId
    );
    return record?.name || 'Portfolio';
  };

  // AUTO-POPULATE MONITORED_BY WITH LOGGED-IN USER
  useEffect(() => {
    
    setFormData(prev => ({
      ...prev,
      monitored_by: loggedInUser
    }));
  }, [loggedInUser]); // Run once on component mount

  // Listen for pre-selection event from portfolio card
  useEffect(() => {
    const handlePreSelect = (event) => {
      const { portfolio_id } = event.detail;
      // CRITICAL FIX: Ensure portfolio_id is set correctly (handle both UUID and integer types)
      if (portfolio_id) {
        setFormData(prev => ({ ...prev, portfolio_id: String(portfolio_id) }));
      }
      
      // Highlight the form briefly
      const formElement = document.getElementById('issue-log-form');
      if (formElement) {
        formElement.classList.add('ring-4', 'ring-green-400');
        setTimeout(() => {
          formElement.classList.remove('ring-4', 'ring-green-400');
        }, 2000);
      }
    };

    window.addEventListener('preSelectPortfolio', handlePreSelect);
    return () => window.removeEventListener('preSelectPortfolio', handlePreSelect);
  }, []);

  useEffect(() => {
    const checkExistingReservation = async () => {
      const sessionId = ensureSessionId();
      try {
        const { data, error } = await supabase
          .from('hour_reservations')
          .select('*')
          .eq('session_id', sessionId)
          .eq('issue_hour', currentHour) // CRITICAL: Only check current hour locks
          .gt('expires_at', new Date().toISOString())
          .order('reserved_at', { ascending: false });

        if (error) {
          console.warn('Unable to fetch existing reservation:', error);
          return;
        }

        setMyReservation(data && data.length > 0 ? data[0] : null);
      } catch (err) {
        console.warn('Unexpected error loading reservation:', err);
      }
    };

    checkExistingReservation();
  }, []);

  // Create or validate reservation when portfolio + hour + monitored_by are all selected
  useEffect(() => {
    const manageReservation = async () => {
      // DEBUG: Always log when this function runs
      console.log('🚀 manageReservation called', {
        selectedPortfolioId,
        selectedIssueHour,
        selectedMonitor
      });
      
      // Check if all required fields are selected
      if (!selectedPortfolioId || selectedIssueHour === '' || !selectedMonitor) {
        console.log('⏸️ Early return - missing fields');
        return;
      }

      const parsedHour = parseInt(selectedIssueHour, 10);
      if (Number.isNaN(parsedHour)) {
        console.log('⏸️ Early return - invalid hour');
        return;
      }

      const sessionId = ensureSessionId();
      const nowIso = new Date().toISOString();

      try {
        setReservationError(null);

        // CRITICAL: Only get reservations that EXACTLY match current user's session_id
        // This ensures we only check the current user's own locks, not other users' locks
        const currentSessionIdStr = String(sessionId || '').trim();
        
        // DEBUG: Log what we're searching for - ALWAYS SHOW THIS
        console.log('========================================');
        console.log('🔍 LOCK CHECK STARTED');
        console.log('My Session ID:', currentSessionIdStr);
        console.log('Trying to lock Portfolio:', selectedPortfolioId);
        console.log('Trying to lock Hour:', parsedHour);
        console.log('========================================');
        
        const { data: sessionReservations, error: sessionError } = await supabase
          .from('hour_reservations')
          .select('*')
          .eq('session_id', currentSessionIdStr)  // Only get MY reservations - exact match
          .eq('issue_hour', currentHour)           // CRITICAL: Only check current hour locks
          .gt('expires_at', nowIso)                // Only get active (not expired) reservations
          .order('reserved_at', { ascending: false });

        if (sessionError) {
          console.error('Error fetching session reservations:', sessionError);
          throw sessionError;
        }

        // DEBUG: Log what the query returned
        console.log('📋 Query returned reservations:', sessionReservations?.length || 0, 'reservations');
        if (sessionReservations && sessionReservations.length > 0) {
          sessionReservations.forEach((r, idx) => {
            console.log(`  Reservation ${idx + 1}:`, {
              session_id: r.session_id,
              portfolio_id: r.portfolio_id,
              hour: r.issue_hour,
              user: r.user
            });
          });
        }

        // TRIPLE-CHECK: Filter to ensure session_id AND monitored_by match exactly
        // This is a safety check in case the query somehow returns wrong data
        // CRITICAL: Also check monitored_by to ensure it's truly YOUR reservation
        const myReservations = (sessionReservations || []).filter(
          r => {
            const rSessionId = String(r.session_id || '').trim();
            const rMonitoredBy = String(r.monitored_by || '').trim();
            const sessionMatches = rSessionId === currentSessionIdStr;
            const userMatches = rMonitoredBy === loggedInUser;
            
            // BOTH must match for it to be truly YOUR reservation
            const matches = sessionMatches && userMatches;
            
            if (!matches && r) {
              // Log if we found a reservation that doesn't match
              console.error('❌ CRITICAL: Found reservation that is NOT mine!', {
                reservationSessionId: rSessionId,
                mySessionId: currentSessionIdStr,
                sessionMatches,
                reservationMonitoredBy: rMonitoredBy,
                myUser: loggedInUser,
                userMatches,
                reservation: r,
                portfolio: getPortfolioNameById(r.portfolio_id),
                hour: r.issue_hour
              });
            }
            return matches;
          }
        );

        console.log('✅ After filtering, MY reservations:', myReservations.length);

        const existingSessionReservation = myReservations.length > 0
          ? myReservations[0]
          : null;

        const matchesExisting =
          existingSessionReservation &&
          existingSessionReservation.portfolio_id === selectedPortfolioId &&
          existingSessionReservation.issue_hour === parsedHour;

        // CRITICAL: Only set myReservation if it truly belongs to current user
        // This prevents showing someone else's lock as "my lock"
        // DOUBLE-CHECK: Verify both session_id AND monitored_by match
        if (existingSessionReservation) {
          const reservationSessionId = String(existingSessionReservation.session_id || '').trim();
          const reservationMonitoredBy = String(existingSessionReservation.monitored_by || '').trim();
          const sessionMatches = reservationSessionId === currentSessionIdStr;
          const userMatches = reservationMonitoredBy === loggedInUser;
          const finalCheck = sessionMatches && userMatches;
          
          console.log('🔐 Final check before setting myReservation:', {
            reservationSessionId,
            currentSessionIdStr,
            sessionMatches,
            reservationMonitoredBy,
            myUser: loggedInUser,
            userMatches,
            finalCheck,
            portfolio: getPortfolioNameById(existingSessionReservation.portfolio_id),
            hour: existingSessionReservation.issue_hour
          });
          
          if (finalCheck) {
            console.log('✅ Setting myReservation - it belongs to me (both session_id and user match)');
            setMyReservation(existingSessionReservation);
          } else {
            // This shouldn't happen (we already filtered), but if it does, ignore it
            console.error('❌ REJECTED: Reservation does not belong to current user!', {
              reservationSessionId,
              currentSessionIdStr,
              sessionMatches,
              reservationMonitoredBy,
              myUser: loggedInUser,
              userMatches
            });
            setMyReservation(null);
          }
        } else {
          console.log('ℹ️ No existing reservation found for my session and user');
          setMyReservation(null);
        }
        
        // CRITICAL FIX: If we have a reservation, lock the hour to that reservation's hour
        if (existingSessionReservation && matchesExisting) {
          // Ensure form hour matches reservation hour
          if (formData.issue_hour !== existingSessionReservation.issue_hour.toString()) {
            setFormData(prev => ({
              ...prev,
              issue_hour: existingSessionReservation.issue_hour.toString()
            }));
          }
        }

        // RESTRICTION: One person (including admin) can only lock ONE portfolio at a time
        // They must complete it (log issues + mark "All Sites Checked" = Yes) before locking another
        // CRITICAL: Check if the existing portfolio is COMPLETED (all_sites_checked = Yes)
        // If completed, allow them to lock a new portfolio
        if (existingSessionReservation && !matchesExisting) {
          // QUADRUPLE-CHECK: Make absolutely sure this reservation belongs to current user's session
          const reservationSessionId = String(existingSessionReservation.session_id || '').trim();
          const currentSessionId = String(sessionId || '').trim();
          const reservationExpiresAt = new Date(existingSessionReservation.expires_at);
          const isExpired = reservationExpiresAt <= new Date();
          
          // STRICT CHECK: Only block if session_id EXACTLY matches (case-sensitive, trimmed)
          const sessionMatches = reservationSessionId === currentSessionId;
          
          // DEBUG: Log the check
          console.log('🔍 Lock Check:', {
            'Reservation Session ID': reservationSessionId,
            'My Session ID': currentSessionId,
            'Session Matches': sessionMatches,
            'Is Expired': isExpired,
            'Reservation Portfolio': existingSessionReservation.portfolio_id,
            'Trying to Lock': selectedPortfolioId,
            'Reservation Hour': existingSessionReservation.issue_hour,
            'Trying Hour': parsedHour
          });
          
          if (sessionMatches && !isExpired) {
            // Check if the existing portfolio is COMPLETED (all_sites_checked = Yes)
            const existingPortfolio = portfolios.find(p => 
              (p.portfolio_id || p.id) === existingSessionReservation.portfolio_id
            );
            const isCompleted = existingPortfolio?.all_sites_checked === true;
            
            console.log('📋 Checking if existing portfolio is completed:', {
              portfolioName: existingPortfolio?.name,
              all_sites_checked: existingPortfolio?.all_sites_checked,
              isCompleted
            });
            
            if (isCompleted) {
              // Portfolio is completed - allow locking a new portfolio
              // Automatically release the old lock since it's completed
              console.log('✅ Existing portfolio is completed - releasing old lock and allowing new lock');
              try {
                const { error: deleteError } = await supabase
                  .from('hour_reservations')
                  .delete()
                  .eq('id', existingSessionReservation.id);
                
                if (deleteError) {
                  console.warn('Error releasing completed portfolio lock:', deleteError);
                } else {
                  console.log('✅ Released lock for completed portfolio');
                  setMyReservation(null);
                  // Continue to create new reservation below
                }
              } catch (err) {
                console.error('Error releasing lock:', err);
                // Continue anyway - allow new lock
                setMyReservation(null);
              }
            } else {
              // Portfolio is NOT completed - block them from locking a new portfolio
              const lockedPortfolioName = getPortfolioNameById(existingSessionReservation.portfolio_id);
              setReservationMessage(null);
              setReservationError(
                `You already have a lock on "${lockedPortfolioName}" (Hour ${existingSessionReservation.issue_hour}). Please complete that portfolio (log issues and mark "All Sites Checked" = Yes) before locking a new one.`
              );
              // Reset form to prevent locking
              setFormData(prev => ({
                ...prev,
                portfolio_id: existingSessionReservation.portfolio_id
              }));
              return; // Don't allow locking a new portfolio - existing lock remains
            }
          } else {
            // This reservation doesn't belong to current user OR is expired - IGNORE IT
            // Allow user to proceed with locking new portfolio
            console.log('✅ Allowing lock - reservation belongs to different user or is expired');
            setMyReservation(null);
            // Continue to create new reservation below - DON'T BLOCK
          }
        }

        // CRITICAL: Check if someone else already has this portfolio/hour locked
        // Check BOTH session_id AND monitored_by to ensure we don't overwrite someone else's lock
        const { data: conflicts, error: conflictError } = await supabase
          .from('hour_reservations')
          .select('*')
          .eq('portfolio_id', selectedPortfolioId)
          .eq('issue_hour', parsedHour)
          .gt('expires_at', nowIso);

        if (conflictError) {
          throw conflictError;
        }

        // Check if there's a conflict - someone else has it locked
        // A conflict exists if:
        // 1. session_id is different OR
        // 2. monitored_by is different (even if session_id matches, which shouldn't happen but check anyway)
        const conflictingReservation = (conflicts || []).find(
          (reservation) => {
            const rSessionId = String(reservation.session_id || '').trim();
            const rMonitoredBy = String(reservation.monitored_by || '').trim();
            const mySessionId = String(sessionId || '').trim();
            const myUser = String(loggedInUser || '').trim();
            
            // It's a conflict if session_id OR monitored_by doesn't match
            const sessionDiffers = rSessionId !== mySessionId;
            const userDiffers = rMonitoredBy.toLowerCase() !== myUser.toLowerCase();
            
            return sessionDiffers || userDiffers;
          }
        );

        if (conflictingReservation) {
          // Check if this is actually MY lock (both session_id AND monitored_by match)
          const conflictingSessionId = String(conflictingReservation.session_id || '').trim();
          const conflictingMonitoredBy = String(conflictingReservation.monitored_by || '').trim();
          const currentSessionId = String(sessionId || '').trim();
          const currentUser = String(loggedInUser || '').trim();
          
          const sessionMatches = conflictingSessionId === currentSessionId;
          const userMatches = conflictingMonitoredBy.toLowerCase() === currentUser.toLowerCase();
          
          // If BOTH session_id AND monitored_by match, it's our own lock - allow update
          if (sessionMatches && userMatches) {
            // This is our own lock - update it instead of blocking
            const { error: updateError } = await supabase
              .from('hour_reservations')
              .update({ monitored_by: selectedMonitor })
              .eq('id', conflictingReservation.id);
            
            if (updateError) {
              throw updateError;
            }
            
            setMyReservation({
              ...conflictingReservation,
              monitored_by: selectedMonitor
            });
            setReservationMessage('Portfolio locked for you. Complete the checklist to move on.');
            return;
          }
          
          // Someone else has it locked - BLOCK creating a new lock
          const portfolioName = getPortfolioNameById(selectedPortfolioId);
          const lockedBy = String(conflictingReservation.monitored_by || 'another user').trim();
          
          console.error('❌ BLOCKED: Cannot create lock - portfolio is locked by someone else', {
            lockedBy,
            myUser: currentUser,
            portfolioName,
            hour: parsedHour,
            conflictingSessionId,
            mySessionId: currentSessionId,
            sessionMatches,
            conflictingMonitoredBy,
            userMatches
          });
          
          // ADMIN OVERRIDE: Admins can override existing locks
          if (isAdmin) {
            // Delete the conflicting reservation to allow admin to lock
            const { error: deleteError } = await supabase
              .from('hour_reservations')
              .delete()
              .eq('id', conflictingReservation.id);
            
            if (deleteError) {
              console.error('Error deleting conflicting reservation:', deleteError);
              setReservationError('Unable to override existing lock. Please try again.');
              return;
            }
            
            console.log('✅ Admin override: Deleted conflicting lock');
            // Continue to create new reservation below
          } else {
            // Regular users cannot override locks
            setReservationMessage(null);
            setReservationError(
              `Portfolio "${portfolioName}" is already locked by "${lockedBy}" for hour ${parsedHour}. Only the person who locked it can work on it. Please select a different portfolio or hour.`
            );
            // Reset portfolio selection to prevent lock creation
            setFormData(prev => ({
              ...prev,
              portfolio_id: ''
            }));
            return;
          }
        }

        if (matchesExisting) {
          if (existingSessionReservation.monitored_by !== selectedMonitor) {
            const { error: updateError } = await supabase
            .from('hour_reservations')
              .update({ monitored_by: selectedMonitor })
              .eq('id', existingSessionReservation.id);
          
            if (updateError) {
              throw updateError;
            }

            setMyReservation({
              ...existingSessionReservation,
              monitored_by: selectedMonitor
            });
            setReservationMessage('Updated lock with selected monitor.');
          } else {
            setReservationMessage('Portfolio locked for you. Complete the checklist to move on.');
          }
          return;
        }

        const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
          
        const { data: insertedRows, error: insertError } = await supabase
            .from('hour_reservations')
            .insert([{
            portfolio_id: selectedPortfolioId,
            issue_hour: parsedHour,
            monitored_by: selectedMonitor,
            session_id: sessionId,
            expires_at: expiresAt
          }])
          .select();

        if (insertError) {
          throw insertError;
        }

        const insertedReservation = insertedRows && insertedRows.length > 0
          ? insertedRows[0]
          : {
              portfolio_id: selectedPortfolioId,
              issue_hour: parsedHour,
              monitored_by: selectedMonitor,
              session_id: sessionId,
              expires_at: expiresAt
            };

        setMyReservation(insertedReservation);
        setReservationMessage('Portfolio locked for the current hour. Log the issue and mark all sites checked to release.');
        } catch (error) {
          console.error('Reservation error:', error.message);
          setReservationError(error.message || 'Unable to lock portfolio right now.');
      }
    };

    manageReservation();
  }, [selectedPortfolioId, selectedIssueHour, selectedMonitor]);

  useEffect(() => {
    if (!reservationMessage) return;
    const timeout = setTimeout(() => setReservationMessage(null), 5000);
    return () => clearTimeout(timeout);
  }, [reservationMessage]);

  useEffect(() => {
    if (!reservationError) return;
    const timeout = setTimeout(() => setReservationError(null), 7000);
    return () => clearTimeout(timeout);
  }, [reservationError]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleExportFilterChange = (key, value) => {
    setExportFilters(prev => ({ ...prev, [key]: value }));
  };

  const setQuickExportRange = (range) => {
    const today = new Date();
    const todayStr = getTodayString();

    if (range === 'today') {
      setExportFilters({
        fromDate: todayStr,
        toDate: todayStr
      });
      return;
    }

    if (range === 'week') {
      // Week starting Monday
      const day = today.getDay(); // 0 (Sun) - 6 (Sat)
      const diffToMonday = (day === 0 ? -6 : 1) - day;
      const monday = new Date(today);
      monday.setDate(today.getDate() + diffToMonday);

      const fromDate = monday.toISOString().split('T')[0];
      const toDate = todayStr;

      setExportFilters({
        fromDate,
        toDate
      });
      return;
    }

    if (range === 'month') {
      const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const fromDate = firstOfMonth.toISOString().split('T')[0];
      const toDate = todayStr;

      setExportFilters({
        fromDate,
        toDate
      });
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    // CRITICAL FIX: Prevent hour change if portfolio is locked
    if (name === 'issue_hour' && myReservation) {
      // Don't allow hour change when locked - keep it at reservation hour
      return;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'issue_present') {
      if (value === 'No') {
        setFormData(prev => ({ ...prev, issue_details: 'No issue', issues_missed_by: '' }));
      } else if (value === 'Yes') {
        setFormData(prev => ({ ...prev, issue_details: '' }));
      }
    }
  };

  const handleClearFilters = () => {
    setFilters({
      searchText: '',
      dateFilter: getTodayString(),
      hourFilter: '',
      showAllIssues: true
    });
  };

  const exportToCSV = (issuesToExport, filename) => {
    const headers = [
      'Date & Time',
      'Portfolio',
      'Hour',
      'Issue Present',
      'Issue Description',
      'Case Number',
      'Monitored By',
      'Issues Missed By'
    ];

    const rows = issuesToExport.map(issue => {
      // Get portfolio name from issue or lookup from portfolios array
      let portfolioName = issue.portfolio_name || '';
      if (!portfolioName && issue.portfolio_id) {
        const portfolio = portfolios.find(p => 
          (p.portfolio_id || p.id) === issue.portfolio_id
        );
        portfolioName = portfolio?.name || '';
      }

      return [
        new Date(issue.created_at).toLocaleString('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }),
        portfolioName,
        issue.issue_hour || '',
        issue.issue_present || '',
        (issue.issue_details || '').replace(/,/g, ';').replace(/"/g, '""'),
        issue.case_number || '',
        issue.monitored_by || '',
        issue.issues_missed_by || ''
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportAllIssues = () => {
    const filteredByRange = issues.filter(issue => {
      const issueDate = new Date(issue.created_at).toISOString().split('T')[0];
      if (exportFilters.fromDate && issueDate < exportFilters.fromDate) return false;
      if (exportFilters.toDate && issueDate > exportFilters.toDate) return false;
      return true;
    });

    const suffix =
      exportFilters.fromDate && exportFilters.toDate
        ? `${exportFilters.fromDate}_to_${exportFilters.toDate}`
        : new Date().toISOString().split('T')[0];

    exportToCSV(filteredByRange, `all_issues_${suffix}.csv`);
  };

  const handleExportIssuesWithYes = () => {
    const issuesWithYes = issues.filter(issue => 
      (issue.issue_present || '').toString().toLowerCase() === 'yes'
    ).filter(issue => {
      const issueDate = new Date(issue.created_at).toISOString().split('T')[0];
      if (exportFilters.fromDate && issueDate < exportFilters.fromDate) return false;
      if (exportFilters.toDate && issueDate > exportFilters.toDate) return false;
      return true;
    });

    const suffix =
      exportFilters.fromDate && exportFilters.toDate
        ? `${exportFilters.fromDate}_to_${exportFilters.toDate}`
        : new Date().toISOString().split('T')[0];

    exportToCSV(issuesWithYes, `issues_with_yes_${suffix}.csv`);
  };

  const handleSubmit = async () => {
    setSubmitError(null);
    setSubmitSuccess(null);
    
    // VALIDATION STEP 1: Portfolio
    if (!formData.portfolio_id || formData.portfolio_id === '') {
      alert('ERROR: Please select a Portfolio');
      return;
    }

    // VALIDATION STEP 1.5: Check if user has active lock on this portfolio/hour
    // CRITICAL: Only the person who locked the portfolio can add issues
    // Must check BOTH session_id AND monitored_by to ensure it's truly YOUR lock
    const sessionId = ensureSessionId();
    const nowIso = new Date().toISOString();
    const parsedHour = parseInt(formData.issue_hour, 10);
    const currentUser = loggedInUser;
    
    // Check if myReservation exists and matches the current portfolio/hour
    const hasValidLock = myReservation && 
      myReservation.portfolio_id === formData.portfolio_id && 
      myReservation.issue_hour === parsedHour &&
      String(myReservation.session_id || '').trim() === String(sessionId || '').trim() &&
      String(myReservation.monitored_by || '').trim() === String(currentUser || '').trim();
    
    if (!hasValidLock) {
      // Check if there's an active reservation for this portfolio/hour by THIS user
      // CRITICAL: Must match BOTH session_id AND monitored_by
      const { data: activeReservations, error: reservationCheckError } = await supabase
        .from('hour_reservations')
        .select('*')
        .eq('portfolio_id', formData.portfolio_id)
        .eq('issue_hour', parsedHour)
        .eq('session_id', sessionId)
        .gt('expires_at', nowIso);
      
      if (reservationCheckError) {
          alert('❌ ERROR: Unable to verify portfolio lock. Please try again.');
          return;
      }
      
      // Filter to ensure BOTH session_id AND monitored_by match
      // CRITICAL: Use case-insensitive comparison for monitored_by
      const myActiveReservations = (activeReservations || []).filter(r => {
        const rSessionId = String(r.session_id || '').trim();
        const rMonitoredBy = String(r.monitored_by || '').trim();
        const mySessionIdStr = String(sessionId || '').trim();
        const myUserStr = String(currentUser || '').trim();
        const sessionMatches = rSessionId === mySessionIdStr;
        const userMatches = rMonitoredBy.toLowerCase() === myUserStr.toLowerCase();
        return sessionMatches && userMatches;
      });
      
      const activeReservation = myActiveReservations.length > 0 
        ? myActiveReservations[0] 
        : null;
      
      if (!activeReservation) {
        // Check if someone else has it locked
        const { data: otherReservations } = await supabase
          .from('hour_reservations')
          .select('*')
          .eq('portfolio_id', formData.portfolio_id)
          .eq('issue_hour', parsedHour)
          .gt('expires_at', nowIso);
        
        if (otherReservations && otherReservations.length > 0) {
          const otherLock = otherReservations[0];
          const portfolioName = getPortfolioNameById(formData.portfolio_id);
          const lockedBy = String(otherLock.monitored_by || 'another user').trim();
          const errorMsg = `❌ ERROR: This portfolio "${portfolioName}" (Hour ${parsedHour}) is locked by "${lockedBy}".\n\nOnly the person who locked it can add issues.`;
          console.error('❌ BLOCKED: Portfolio is locked by someone else', {
            lockedBy,
            myUser: currentUser,
            portfolioName,
            hour: parsedHour
          });
          alert(errorMsg);
          setSubmitError(errorMsg);
        } else {
          // No lock found - try to create one automatically if all fields are filled
          if (formData.portfolio_id && formData.issue_hour && formData.monitored_by) {
            console.log('⚠️ No lock found, but all fields are filled. Attempting to create lock automatically...');
            
            // Try to create the lock automatically
            try {
              const expiresAt = new Date();
              expiresAt.setHours(expiresAt.getHours() + 1); // Expires in 1 hour
              
              const { data: newReservation, error: createError } = await supabase
                .from('hour_reservations')
                .insert([{
                  portfolio_id: formData.portfolio_id,
                  issue_hour: parsedHour,
                  monitored_by: formData.monitored_by,
                  session_id: sessionId,
                  expires_at: expiresAt.toISOString()
                }])
                .select()
                .single();
              
              if (createError) {
                console.error('Error creating lock automatically:', createError);
                const errorMsg = '❌ ERROR: Unable to create lock automatically. Please ensure portfolio, hour, and monitored by are selected, then try again.';
                alert(errorMsg);
                setSubmitError(errorMsg);
                return;
              }
              
              console.log('✅ Lock created automatically:', newReservation);
              setMyReservation(newReservation);
              // Continue with issue submission below
            } catch (createErr) {
              console.error('Error creating lock:', createErr);
              const errorMsg = '❌ ERROR: Unable to create lock. Please try again.';
              alert(errorMsg);
              setSubmitError(errorMsg);
              return;
            }
          } else {
            const errorMsg = '❌ ERROR: You must lock this portfolio first before logging issues.\n\nPlease select the portfolio, hour, and monitored by person to create a lock, then you can log issues.';
            console.warn('⚠️ No lock found - requiring lock first', {
              hasPortfolio: !!formData.portfolio_id,
              hasHour: !!formData.issue_hour,
              hasMonitoredBy: !!formData.monitored_by
            });
            alert(errorMsg);
            setSubmitError(errorMsg);
            return; // CRITICAL: Stop execution here
          }
        }
      }
      
      // Update myReservation to match the active reservation
      setMyReservation(activeReservation);
    }

    // VALIDATION STEP 2: Issue Present (CRITICAL!)
    const issuePresent = String(formData.issue_present).trim();
    if (!issuePresent || issuePresent === '') {
      alert('❌ ERROR: Please select "Yes" or "No" for Issue Present');
      return;
    }
    
    if (issuePresent !== 'Yes' && issuePresent !== 'No') {
      alert(`❌ ERROR: Invalid Issue Present value. Must be "Yes" or "No"`);
      return;
    }
    // VALIDATION STEP 3: Monitored By (MANDATORY!)
    if (!formData.monitored_by || formData.monitored_by.trim() === '') {
      alert('❌ ERROR: Monitored By is REQUIRED. Please select who monitored this hour.');
      return;
    }

    // VALIDATION STEP 4: Issue Details (when yes)
    if (issuePresent === 'Yes' && (!formData.issue_details || formData.issue_details.trim() === '')) {
      alert('❌ ERROR: Please provide issue details when issue is present');
      return;
    }

    try {
      // BUILD DATA OBJECT - ENSURE CLEAN STRING VALUES
      const dataToInsert = {
        portfolio_id: formData.portfolio_id,
        site_id: formData.site_id && formData.site_id !== '' ? formData.site_id : null,
        issue_hour: parseInt(formData.issue_hour, 10),
        issue_present: issuePresent, // GUARANTEED to be 'Yes' or 'No'
        issue_details: formData.issue_details && formData.issue_details.trim() !== '' 
          ? formData.issue_details.trim() 
          : (issuePresent === 'No' ? 'No issue' : null),
        case_number: formData.case_number && formData.case_number.trim() !== '' ? formData.case_number.trim() : null,
        monitored_by: formData.monitored_by && formData.monitored_by !== '' ? formData.monitored_by : null,
        issues_missed_by: formData.issues_missed_by && formData.issues_missed_by !== '' ? formData.issues_missed_by : null,
        entered_by: formData.entered_by || 'System'
      };

      const { data, error } = await supabase
        .from('issues')
        .insert([dataToInsert])
        .select();

      if (error) {
        console.error('Database error:', error.message);
        throw error;
      }

      
      // IMPORTANT: Do NOT release lock after logging issue
      // User should be able to log multiple issues with a single lock
      // Lock will only be released when:
      // 1. User marks "All Sites Checked" = Yes
      // 2. Hour changes (automatic)
      // 3. Admin manually removes lock
      
      setSubmitSuccess('Issue logged successfully!');
      
      // Get logged-in user to preserve after reset
      // Reset form but preserve monitored_by
      setFormData({
        portfolio_id: '',
        site_id: '',
        issue_hour: currentHour,
        issue_present: '',
        issue_details: '',
        case_number: '',
        monitored_by: loggedInUser, // Keep logged-in user selected
        issues_missed_by: '',
        entered_by: 'System'
      });
      
      // Refresh data to ensure all users see the new issue
      onRefresh();
    } catch (error) {
      console.error('Error logging issue:', error.message);
      setSubmitError(error.message || 'Unable to log issue. Please try again.');
    }
  };

  const filteredIssues = issues.filter(issue => {
    let match = true;

    // Search filter - searches in portfolio name, issue details, and case number
    if (filters.searchText && filters.searchText.trim() !== '') {
      const searchLower = filters.searchText.toLowerCase();
      const matchesPortfolio = issue.portfolio_name?.toLowerCase().includes(searchLower);
      const matchesDetails = issue.issue_details?.toLowerCase().includes(searchLower);
      const matchesCase = issue.case_number?.toLowerCase().includes(searchLower);
      const matchesMonitored = issue.monitored_by?.toLowerCase().includes(searchLower);
      match = match && (matchesPortfolio || matchesDetails || matchesCase || matchesMonitored);
    }

    if (filters.dateFilter) {
      const issueDate = new Date(issue.created_at).toISOString().split('T')[0];
      match = match && issueDate === filters.dateFilter;
    }

    if (filters.hourFilter) {
      match = match && issue.issue_hour === parseInt(filters.hourFilter);
    }

    return match;
  });

  const displayIssues = filters.showAllIssues ? filteredIssues : [];

  return (
    <div className="bg-white rounded-lg shadow">
      {(reservationError || reservationMessage || myReservation) && (
        <div className="p-4 border-b space-y-2 bg-purple-50 border-purple-200">
          {reservationError && (
            <div className="px-3 py-2 rounded border border-red-200 bg-red-50 text-sm text-red-700 font-medium">
              {reservationError}
            </div>
          )}
          {reservationMessage && !reservationError && (
            <div className="px-3 py-2 rounded border border-green-200 bg-green-50 text-sm text-green-700 font-medium">
              {reservationMessage}
            </div>
          )}
          {myReservation && (
            <div className="px-3 py-2 rounded border border-purple-200 bg-white text-sm text-purple-800">
              Currently locked: <strong>{getPortfolioNameById(myReservation.portfolio_id)}</strong> (Hour {myReservation.issue_hour}). Finish logging and confirm All Sites Checked to release.
              {/* DEBUG INFO - Shows session_id and user to verify it's YOUR lock */}
              <div className="mt-1 text-xs text-gray-500">
                Debug: Session ID: {String(myReservation.session_id || '').substring(0, 30)}... | User: {myReservation.user || myReservation.monitored_by || 'N/A'}
              </div>
            </div>
          )}
        </div>
      )}
      {/* SEARCH BAR - NEW FEATURE */}
      <div className="p-4 bg-gradient-to-r from-green-50 to-lime-50 border-b">
        <div className="flex items-center gap-2 mb-2">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="text-sm font-semibold text-gray-700">Search Issues</h3>
        </div>
        <input
          type="text"
          value={filters.searchText}
          onChange={(e) => handleFilterChange('searchText', e.target.value)}
          placeholder="Search by portfolio, issue details, case number, or monitored by..."
          className="w-full px-4 py-2 border-2 border-green-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
        />
        {filters.searchText && (
          <div className="mt-2 text-xs text-gray-600">
            Found {filteredIssues.length} matching issue(s)
          </div>
        )}
      </div>

      {/* Filters Section */}
      <div className="p-4 border-b bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Filter</label>
            <input
              type="date"
              value={filters.dateFilter}
              onChange={(e) => handleFilterChange('dateFilter', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hour Filter</label>
            <select
              value={filters.hourFilter}
              onChange={(e) => handleFilterChange('hourFilter', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-green-500 focus:border-green-500"
            >
              <option value="">All Hours</option>
              {hours.map(h => (
                <option key={h} value={h}>{h}:00</option>
              ))}
            </select>
          </div>

          <div className="flex items-center pt-6">
            <input
              type="checkbox"
              id="showAllIssues"
              checked={filters.showAllIssues}
              onChange={(e) => handleFilterChange('showAllIssues', e.target.checked)}
              className="w-4 h-4 border-gray-300 rounded focus:ring-green-500"
              style={{ accentColor: '#76AB3F' }}
            />
            <label htmlFor="showAllIssues" className="ml-2 text-sm font-medium text-gray-700">
              Show All Issues
            </label>
          </div>

          <div className="pt-6">
            <button
              onClick={handleClearFilters}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 font-medium"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Export Buttons Section */}
      <div className="p-4 border-b bg-blue-50">
        <div className="flex items-center gap-3 mb-3">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-sm font-semibold text-gray-700">Export Issues</h3>
        </div>

        {/* Export Date Range & Quick Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              value={exportFilters.fromDate}
              onChange={(e) => handleExportFilterChange('fromDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              value={exportFilters.toDate}
              onChange={(e) => handleExportFilterChange('toDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex flex-col justify-between">
            <span className="block text-xs font-medium text-gray-700 mb-1">Quick Range</span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setQuickExportRange('today')}
                className="px-3 py-1 text-xs bg-white border border-blue-300 text-blue-700 rounded hover:bg-blue-50"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setQuickExportRange('week')}
                className="px-3 py-1 text-xs bg-white border border-blue-300 text-blue-700 rounded hover:bg-blue-50"
              >
                This Week
              </button>
              <button
                type="button"
                onClick={() => setQuickExportRange('month')}
                className="px-3 py-1 text-xs bg-white border border-blue-300 text-blue-700 rounded hover:bg-blue-50"
              >
                This Month
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportAllIssues}
            className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
            title="Export all issues in the selected date range to CSV"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export All Issues
          </button>
          <button
            onClick={handleExportIssuesWithYes}
            className="px-4 py-2 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
            title="Export only issues with Issue Present = Yes in the selected date range"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export Issues (Yes Only)
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">PORTFOLIO</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">HOUR</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">ISSUE PRESENT</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">ISSUE DESCRIPTION</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">CASE #</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">MONITORED BY</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">DATE/TIME</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">ISSUES MISSED BY</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {(submitError || submitSuccess) && (
              <tr>
                <td colSpan="9" className="px-4 py-2">
                  {submitError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded">
                      {submitError}
                    </div>
                  )}
                  {submitSuccess && (
                    <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-3 py-2 rounded">
                      {submitSuccess}
                    </div>
                  )}
                </td>
              </tr>
            )}
            {/* Log New Issue Row */}
            <tr className="bg-green-50">
              <td className="px-4 py-3">
                <select
                  name="portfolio_id"
                  value={formData.portfolio_id}
                  onChange={handleFormChange}
                  className={`w-full px-3 py-2 border rounded text-sm focus:ring-green-500 focus:border-green-500 ${
                    formData.portfolio_id ? 'border-green-500 bg-green-50' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Portfolio</option>
                  {portfolios.map(p => (
                    <option key={p.portfolio_id} value={p.portfolio_id}>{p.name}</option>
                  ))}
                </select>
                {formData.portfolio_id && (
                  <div className="text-xs text-green-600 mt-1">✓ Portfolio selected</div>
                )}
              </td>
              <td className="px-4 py-3">
                <input
                  type="number"
                  name="issue_hour"
                  value={formData.issue_hour}
                  onChange={handleFormChange}
                  min="0"
                  max="23"
                  disabled={!!myReservation}
                  title={myReservation ? `Hour locked to ${myReservation.issue_hour} for this portfolio. Complete logging to unlock.` : ''}
                  className={`w-20 px-3 py-2 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500 ${
                    myReservation ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''
                  }`}
                />
              </td>
              <td className="px-4 py-3">
                <select
                  name="issue_present"
                  value={formData.issue_present}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </td>
              <td className="px-4 py-3">
                <input
                  type="text"
                  name="issue_details"
                  value={formData.issue_details}
                  onChange={handleFormChange}
                  placeholder="Select issue present first"
                  disabled={!formData.issue_present}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                />
              </td>
              <td className="px-4 py-3">
                <input
                  type="text"
                  name="case_number"
                  value={formData.case_number}
                  onChange={handleFormChange}
                  placeholder="Case #"
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-green-500 focus:border-green-500"
                />
              </td>
              <td className="px-4 py-3">
                <div className="w-full px-4 py-2 border-2 border-green-500 rounded text-sm bg-green-50 text-green-800 font-semibold flex items-center justify-between">
                  <span>{loggedInUser}</span>
                  <span className="text-xs text-green-600 uppercase tracking-wide">Locked</span>
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-gray-500">
                {new Date().toLocaleString('en-US', {
                  month: '2-digit',
                  day: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false
                })}
              </td>
              <td className="px-4 py-3">
                <select
                  name="issues_missed_by"
                  value={formData.issues_missed_by}
                  onChange={handleFormChange}
                  disabled={(formData.issue_present || '').toLowerCase() === 'no'}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Select</option>
                  {monitoredPersonnel.map(person => (
                    <option key={person} value={person}>{person}</option>
                  ))}
                </select>
                {(formData.issue_present || '').toLowerCase() === 'no' && (
                  <div className="text-xs text-gray-500 mt-1">
                    Disabled when Issue Present is set to No.
                  </div>
                )}
              </td>
              <td className="px-4 py-3">
                <button
                  onClick={handleSubmit}
                  type="button"
                  className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 font-medium whitespace-nowrap"
                >
                  Log Ticket
                </button>
              </td>
            </tr>

            {/* Existing Issues */}
            {displayIssues.length === 0 ? (
              <tr>
                <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                  {filters.showAllIssues ? 'No issues found' : 'Check "Show All Issues" to view issues'}
                </td>
              </tr>
            ) : (
              displayIssues.map((issue) => (
                <tr key={issue.issue_id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {issue.portfolio_name || 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {issue.issue_hour}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${
                      (issue.issue_present || '').toLowerCase() === 'yes' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {(issue.issue_present || '').toLowerCase() === 'yes' ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 min-w-[300px] max-w-md">
                    <div className="whitespace-normal break-words">
                      {issue.issue_details || 'No issue'}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {issue.case_number || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {issue.monitored_by || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                    {new Date(issue.created_at).toLocaleString('en-US', {
                      month: '2-digit',
                      day: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false
                    })}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {issue.issues_missed_by ? (
                      <span className="text-orange-600 font-medium">
                        {issue.issues_missed_by}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => onEditIssue(issue)}
                        className="text-green-600 hover:text-green-800 font-medium"
                      >
                        Edit
                      </button>
                      {isAdmin && onDeleteIssue && (
                        <button
                          onClick={() => onDeleteIssue(issue)}
                          className="text-red-600 hover:text-red-800 font-medium"
                          title="Delete this issue (Admin only)"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TicketLoggingTable;
