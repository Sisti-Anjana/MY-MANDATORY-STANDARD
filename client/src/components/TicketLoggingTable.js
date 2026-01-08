import React, { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '../services/supabaseClient';
import { getCurrentESTDateString, convertToEST, getNewYorkDate } from '../utils/dateUtils';

const getTodayString = () => getCurrentESTDateString();

const TicketLoggingTable = ({ issues, portfolios, sites, monitoredPersonnel, currentHour, activeReservations = [], onRefresh, onEditIssue, onDeleteIssue, isAdmin = false }) => {
  const [filters, setFilters] = useState({
    searchText: '',
    dateFilter: getTodayString(),
    hourFilter: '',
    issueFilter: 'yes' // 'yes' = Active Issues (default), 'all' = All Issues
  });

  // Separate export date range filters for CSV downloads
  const [exportFilters, setExportFilters] = useState({
    fromDate: getTodayString(),
    toDate: getTodayString()
  });

  // Date helpers: display mmddyyyy, store ISO
  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return '';
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${mm}${dd}${yyyy}`;
  };
  const inputToISO = (val) => {
    if (!val) return '';
    const m = val.replace(/\D/g, '').match(/^(\d{2})(\d{2})(\d{4})$/);
    if (!m) return '';
    const [, mm, dd, yyyy] = m;
    return `${yyyy}-${mm}-${dd}`;
  };

  // CRITICAL: LocalStorage Key for Form Draft
  const FORM_DRAFT_KEY = 'ticket_logging_form_draft';

  const [formData, setFormData] = useState(() => {
    // Try to load draft from localStorage
    try {
      const saved = localStorage.getItem(FORM_DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure strictly required fields are present and valid
        return {
          ...parsed,
          // Always reset entered_by to 'System' or current user context if needed
          entered_by: 'System',
          // Ensure we don't accidentally carry over a lock-related blocking state if logic changes
          issue_hour: parsed.issue_hour || currentHour
        };
      }
    } catch (e) {
      console.warn('Failed to load form draft:', e);
    }
    // Default Fallback
    return {
      portfolio_id: '',
      site_id: '',
      issue_hour: currentHour,
      issue_present: '',
      issue_details: '',
      case_number: '',
      monitored_by: '',
      issues_missed_by: '',
      entered_by: 'System'
    };
  });

  // Persist form data to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(FORM_DRAFT_KEY, JSON.stringify(formData));
    } catch (e) {
      console.error('Failed to save form draft:', e);
    }
  }, [formData]);

  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [reservationError, setReservationError] = useState(null);
  const [reservationMessage, setReservationMessage] = useState(null);
  const [myReservation, setMyReservation] = useState(null);
  const lastAutoLockedValues = useRef({ portfolioId: '', hour: '', monitor: '' });
  const isInternalUpdate = useRef(false);

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

  // REMOVED: Automatic hour reset effect that causes form clearing issues
  // The hour is now initialized once on mount and updated only on successful submit
  // or explicit manual change by the user.

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
    const handlePreSelect = (e) => {
      const { portfolio_id } = e.detail;
      console.log('📬 preSelectPortfolio event received:', portfolio_id);

      // CRITICAL: Force auto-lock to re-trigger for this specific selection
      lastAutoLockedValues.current = { portfolioId: '', hour: '', monitor: '' };

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

  // Sync internal myReservation state with global activeReservations prop
  useEffect(() => {
    if (!selectedPortfolioId || selectedIssueHour === '') {
      setMyReservation(null);
      return;
    }

    const sessionId = ensureSessionId();
    const parsedHour = parseInt(selectedIssueHour, 10);

    // Find if I have a reservation for this selection in the global list
    const myGlobalRes = activeReservations.find(r =>
      (r.portfolio_id || r.id) === selectedPortfolioId &&
      r.issue_hour === parsedHour &&
      r.session_id === sessionId &&
      r.monitored_by === loggedInUser
    );

    if (myGlobalRes) {
      if (!myReservation || myReservation.id !== myGlobalRes.id) {
        console.log('🔄 Syncing myReservation from global state:', myGlobalRes);
        setMyReservation(myGlobalRes);
      }
    } else if (myReservation) {
      console.log('🔄 Clearing myReservation - no longer exists in global state');
      setMyReservation(null);
    }
  }, [activeReservations, selectedPortfolioId, selectedIssueHour, loggedInUser, myReservation]);

  // Initial check (fallback)
  useEffect(() => {
    const checkExistingReservation = async () => {
      const sessionId = ensureSessionId();
      try {
        const { data, error } = await supabase
          .from('hour_reservations')
          .select('*')
          .eq('session_id', sessionId)
          .eq('issue_hour', currentHour) // CRITICAL: Only check current hour locks
          .gt('expires_at', getNewYorkDate().toISOString())
          .order('reserved_at', { ascending: false });

        if (error) {
          console.warn('Unable to fetch existing reservation:', error);
          return;
        }

        if (data && data.length > 0) {
          setMyReservation(data[0]);
        }
      } catch (err) {
        console.warn('Unexpected error loading reservation:', err);
      }
    };

    checkExistingReservation();
  }, []);

  // Create or validate reservation when portfolio + hour + monitored_by are all selected
  useEffect(() => {
    const manageReservation = async () => {
      // Check if all required fields are selected
      if (!selectedPortfolioId || selectedIssueHour === '' || !selectedMonitor) {
        return;
      }

      const parsedHour = parseInt(selectedIssueHour, 10);
      if (Number.isNaN(parsedHour)) return;

      const sessionId = ensureSessionId();
      const nowIso = getNewYorkDate().toISOString();

      // OPTIMIZATION: Only auto-lock if selection actually CHANGED
      const currentValues = { portfolioId: selectedPortfolioId, hour: selectedIssueHour, monitor: selectedMonitor };
      const hasChanged =
        currentValues.portfolioId !== lastAutoLockedValues.current.portfolioId ||
        currentValues.hour !== lastAutoLockedValues.current.hour ||
        currentValues.monitor !== lastAutoLockedValues.current.monitor;

      if (!hasChanged && myReservation) {
        // Selection hasn't changed and we already have a lock - nothing to do
        return;
      }

      // CRITICAL FIX: If selection hasn't changed and we DON'T have a lock, it means we recently UNLOCKED 
      // or someone else has it. Don't grab it back automatically. This prevents re-locking loops.
      if (!hasChanged && !myReservation) {
        console.log('ℹ️ Selection unchanged and no lock. Skipping auto-lock to prevent loop.');
        return;
      }

      // CRITICAL: Skip auto-locking if the portfolio is already marked "Yes" (Complete)
      // This prevents the automatic re-locking loop that resets status back to "No"
      const currentPortfolio = portfolios.find(p => (p.portfolio_id || p.id) === selectedPortfolioId);
      const isCompletedThisHour =
        currentPortfolio?.all_sites_checked &&
        parseInt(currentPortfolio?.all_sites_checked_hour) === parsedHour;

      if (isCompletedThisHour && !myReservation) {
        console.log(`ℹ️ Portfolio "${currentPortfolio.name}" is already complete for hour ${parsedHour}. Skipping auto-lock.`);
        return;
      }

      try {
        setReservationError(null);

        // Check if I already have a lock for this specific selection in the global list first
        // This avoids unnecessary DB queries if we already have the info
        const existingMine = activeReservations.find(r => {
          const resName = (r.portfolio_name || r.portfolios?.name || '').trim().toLowerCase();
          const matchName = String(currentPortfolio?.name || '').trim().toLowerCase();
          const resId = String(r.portfolio_id || r.id || '').trim().toLowerCase();
          const matchId = String(selectedPortfolioId || '').trim().toLowerCase();

          return (
            (resName === matchName || (resId && resId === matchId)) &&
            r.issue_hour === parsedHour &&
            r.session_id === sessionId
          );
        });

        if (existingMine) {
          console.log('✅ Already have lock in global state. Syncing.');
          setMyReservation(existingMine);
          lastAutoLockedValues.current = currentValues;
          return;
        }

        // Check if I have an active lock on ANOTHER portfolio/hour - if so, block new lock
        const myOtherLock = activeReservations.find(r => {
          const resName = (r.portfolio_name || r.portfolios?.name || '').trim().toLowerCase();
          const matchName = String(currentPortfolio?.name || '').trim().toLowerCase();
          const resId = String(r.portfolio_id || r.id || '').trim().toLowerCase();
          const matchId = String(selectedPortfolioId || '').trim().toLowerCase();

          return (
            r.session_id === sessionId &&
            r.monitored_by === loggedInUser &&
            !((resName === matchName || (resId && resId === matchId)) && r.issue_hour === parsedHour)
          );
        });

        if (myOtherLock) {
          const lockedPortfolio = portfolios.find(p => (p.portfolio_id || p.id || p.portfolio_name) === (myOtherLock.portfolio_id || myOtherLock.portfolio_name));
          const isCompleted = lockedPortfolio?.all_sites_checked === true;

          if (!isCompleted) {
            setReservationError(`You already have a lock on "${lockedPortfolio?.name || 'another portfolio'}" (Hour ${myOtherLock.issue_hour}). Please complete that first.`);
            // Reset portfolio selection to the locked one to prevent invalid state
            setFormData(prev => ({ ...prev, portfolio_id: myOtherLock.portfolio_id || myOtherLock.portfolio_name }));
            return;
          } else {
            // Portfolio is completed - we should release it before allowing a new one
            console.log('ℹ️ User has lock on completed portfolio. Transitioning.');
          }
        }

        // Check for conflicts (someone else has it)
        const conflict = activeReservations.find(r => {
          const resName = (r.portfolio_name || r.portfolios?.name || '').trim().toLowerCase();
          const matchName = String(currentPortfolio?.name || '').trim().toLowerCase();
          const resId = String(r.portfolio_id || r.id || '').trim().toLowerCase();
          const matchId = String(selectedPortfolioId || '').trim().toLowerCase();

          return (
            (resName === matchName || (resId && resId === matchId)) &&
            r.issue_hour === parsedHour &&
            r.session_id !== sessionId
          );
        });

        if (conflict) {
          if (!isAdmin) {
            setReservationError(`Portfolio is already locked by "${conflict.monitored_by}" for hour ${parsedHour}.`);
            setFormData(prev => ({ ...prev, portfolio_id: '' }));
            return;
          }
          // Admin can proceed (they will delete the conflict in the insert logic usually, 
          // but for now we'll just continue and let the insert attempt handle it or manual delete)
        }

        // CREATE NEW LOCK
        console.log('🔒 Attempting auto-lock for:', selectedPortfolioId, 'Hour:', parsedHour);
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

        if (insertError) throw insertError;

        // CRITICAL FIX: Ensure portfolio status is reset to "No" (checked = false) when locked
        // This ensures a clean state for the new hour/user session
        try {
          await supabase
            .from('portfolios')
            .update({
              all_sites_checked: false,
              all_sites_checked_hour: null,
              all_sites_checked_date: null,
              all_sites_checked_by: null
            })
            .eq('portfolio_id', selectedPortfolioId);
          console.log('✅ Portfolio status reset to "No" upon lock acquisition');
        } catch (updateStatusError) {
          console.error('Error resetting portfolio status on lock:', updateStatusError);
          // Don't throw here, the lock is already acquired and that's the primary goal
        }

        const insertedReservation = insertedRows[0];
        setMyReservation(insertedReservation);
        setReservationMessage('Portfolio locked. Complete the checklist to release.');

        lastAutoLockedValues.current = currentValues;

        // Notify parent to refresh global state
        if (onRefresh) onRefresh();

      } catch (error) {
        console.error('Reservation error:', error);
        setReservationError('Unable to lock portfolio right now.');
      }
    };

    manageReservation();
  }, [selectedPortfolioId, selectedIssueHour, selectedMonitor, portfolios, activeReservations, isAdmin, loggedInUser, onRefresh]);

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
    const today = getNewYorkDate();
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
      issueFilter: 'yes' // Reset to default: Active Issues
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
      const issueDate = convertToEST(issue.created_at).toISOString().split('T')[0];
      if (exportFilters.fromDate && issueDate < exportFilters.fromDate) return false;
      if (exportFilters.toDate && issueDate > exportFilters.toDate) return false;
      return true;
    });

    const suffix =
      exportFilters.fromDate && exportFilters.toDate
        ? `${exportFilters.fromDate}_to_${exportFilters.toDate}`
        : getCurrentESTDateString();

    exportToCSV(filteredByRange, `all_issues_${suffix}.csv`);
  };

  const handleExportIssuesWithYes = () => {
    const issuesWithYes = issues.filter(issue =>
      (issue.issue_present || '').toString().toLowerCase() === 'yes'
    ).filter(issue => {
      const issueDate = convertToEST(issue.created_at).toISOString().split('T')[0];
      if (exportFilters.fromDate && issueDate < exportFilters.fromDate) return false;
      if (exportFilters.toDate && issueDate > exportFilters.toDate) return false;
      return true;
    });

    const suffix =
      exportFilters.fromDate && exportFilters.toDate
        ? `${exportFilters.fromDate}_to_${exportFilters.toDate}`
        : getCurrentESTDateString();

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

    // CRITICAL: Lock validation - MUST have a lock to log an issue
    if (!myReservation) {
      alert('❌ ERROR: You must lock this portfolio before logging an issue. Please select a portfolio, hour, and yourself as the monitor to acquire a lock.');
      return;
    }

    // Verify the lock matches the current selection (safeguard)
    const currentSessionId = ensureSessionId();
    if (String(myReservation.session_id) !== String(currentSessionId) ||
      String(myReservation.portfolio_id) !== String(formData.portfolio_id) ||
      parseInt(myReservation.issue_hour, 10) !== parseInt(formData.issue_hour, 10)) {
      alert('❌ ERROR: Lock mismatch. Please refresh and try again.');
      return;
    }

    const parsedHour = parseInt(formData.issue_hour, 10);

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

      // CRITICAL: Clear the saved draft from localStorage on success
      localStorage.removeItem(FORM_DRAFT_KEY);

      setFormData(prev => ({
        ...prev,
        // PRESERVE LOCK STATE: Keep portfolio and hour selected so user can log multiple issues
        portfolio_id: prev.portfolio_id,
        issue_hour: prev.issue_hour,
        monitored_by: prev.monitored_by,

        // RESET ISSUE DETAILS: Clear specific issue fields for the next entry
        site_id: '',
        issue_present: '',
        issue_details: '',
        case_number: '',
        issues_missed_by: '',
        entered_by: 'System'
      }));

      // Refresh data to ensure all users see the new issue
      onRefresh();
    } catch (error) {
      console.error('Error logging issue:', error.message);
      setSubmitError(error.message || 'Unable to log issue. Please try again.');
    }
  };

  const filteredIssues = issues.filter(issue => {
    let match = true;

    // Issue Present filter - default to "Active Issues" only
    if (filters.issueFilter === 'yes') {
      match = match && (issue.issue_present || '').toString().toLowerCase() === 'yes';
    }
    // If 'all', show all issues (no filter applied)

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

  const displayIssues = filteredIssues;

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
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="text-sm font-semibold text-gray-700">Search Issues</h3>
        </div>
        <div className="max-w-[500px]">
          <input
            type="text"
            value={filters.searchText}
            onChange={(e) => handleFilterChange('searchText', e.target.value)}
            placeholder="Search by portfolio, issue details, case number, or monitored by..."
            className="w-full px-3 py-2 border-2 border-green-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
          />
          {filters.searchText && (
            <div className="mt-2 text-xs text-gray-600">
              Found {filteredIssues.length} matching issue(s)
            </div>
          )}
        </div>
      </div>

      {/* Filters Section */}
      <div className="p-4 border-b bg-gray-50">
        <div className="grid grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 tracking-wide">Date Filter</label>
            <input
              type="date"
              value={filters.dateFilter}
              onChange={(e) => handleFilterChange('dateFilter', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 tracking-wide">Hour Filter</label>
            <select
              value={filters.hourFilter}
              onChange={(e) => handleFilterChange('hourFilter', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">All Hours</option>
              {hours.map(h => (
                <option key={h} value={h}>{h}:00</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 tracking-wide">Issue Filter</label>
            <select
              value={filters.issueFilter}
              onChange={(e) => handleFilterChange('issueFilter', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="yes">Active Issues (Default)</option>
              <option value="all">All Issues</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide opacity-0">Action</label>
            <button
              onClick={handleClearFilters}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300 font-medium transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Export Buttons Section */}
      <div className="p-4 border-b bg-blue-50">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-sm font-semibold text-gray-700">Export Issues</h3>
        </div>

        {/* Export Date Range & Quick Filters */}
        <div className="grid grid-cols-4 gap-4 items-end mb-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">From Date</label>
            <input
              type="date"
              value={exportFilters.fromDate}
              onChange={(e) => handleExportFilterChange('fromDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">To Date</label>
            <input
              type="date"
              value={exportFilters.toDate}
              onChange={(e) => handleExportFilterChange('toDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Quick Range</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setQuickExportRange('today')}
                className="px-3 py-1.5 text-xs bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors font-medium"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setQuickExportRange('week')}
                className="px-3 py-1.5 text-xs bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors font-medium"
              >
                This Week
              </button>
              <button
                type="button"
                onClick={() => setQuickExportRange('month')}
                className="px-3 py-1.5 text-xs bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors font-medium"
              >
                This Month
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportAllIssues}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
            title="Export all issues in the selected date range to CSV"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export All Issues
          </button>
          <button
            onClick={handleExportIssuesWithYes}
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center gap-2 shadow-sm"
            title="Export only Active Issues (issues with Issue Present = Yes) in the selected date range"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export Active Issues
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
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">MISSED ALERTS BY</th>
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
                  className={`w-full px-3 py-2 border rounded text-sm focus:ring-green-500 focus:border-green-500 ${formData.portfolio_id ? 'border-green-500 bg-green-50' : 'border-gray-300'
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
                  className={`w-20 px-3 py-2 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500 ${myReservation ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''
                    }`}
                />
              </td>
              <td className="px-4 py-3">
                {(() => {
                  const today = getNewYorkDate().toISOString().split('T')[0];
                  const currentPortfolio = portfolios.find(p => (p.portfolio_id || p.id) === formData.portfolio_id);
                  const isComplete =
                    currentPortfolio?.all_sites_checked &&
                    parseInt(currentPortfolio?.all_sites_checked_hour, 10) === parseInt(formData.issue_hour, 10) &&
                    currentPortfolio?.all_sites_checked_date === today;

                  if (isComplete) {
                    return (
                      <div className="mb-2 p-2 bg-green-50 border border-green-200 rounded text-[10px] text-green-800">
                        ✅ Portfolio complete for this hour.
                        <button
                          onClick={async () => {
                            if (!window.confirm('Are you sure you want to re-open this portfolio for more issues?')) return;
                            try {
                              await supabase
                                .from('portfolios')
                                .update({
                                  all_sites_checked: false,
                                  all_sites_checked_hour: null,
                                  all_sites_checked_date: null,
                                  all_sites_checked_by: null
                                })
                                .eq('portfolio_id', formData.portfolio_id);

                              if (onRefresh) await onRefresh();
                            } catch (err) {
                              console.error('Error re-opening portfolio:', err);
                              alert('Failed to re-open portfolio.');
                            }
                          }}
                          className="ml-1 text-blue-600 hover:underline font-bold"
                        >
                          Re-open for work
                        </button>
                      </div>
                    );
                  }

                  if (!myReservation && formData.portfolio_id) {
                    return (
                      <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-[10px] text-yellow-800 animate-pulse">
                        ⚠️ Lock required to log issues.
                      </div>
                    );
                  }
                  return null;
                })()}
                <select
                  name="issue_present"
                  value={formData.issue_present}
                  onChange={handleFormChange}
                  disabled={!myReservation}
                  className={`w-full px-3 py-2 border rounded text-sm focus:ring-green-500 focus:border-green-500 ${!myReservation ? 'bg-gray-100 cursor-not-allowed' : 'border-gray-300'
                    }`}
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
                  placeholder={!myReservation ? "Lock required" : "Select issue present first"}
                  disabled={!myReservation || !formData.issue_present}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </td>
              <td className="px-4 py-3">
                <input
                  type="text"
                  name="case_number"
                  value={formData.case_number}
                  onChange={handleFormChange}
                  placeholder="Case #"
                  disabled={!myReservation}
                  className={`w-full px-3 py-2 border rounded text-sm focus:ring-green-500 focus:border-green-500 ${!myReservation ? 'bg-gray-100 cursor-not-allowed' : 'border-gray-300'
                    }`}
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
                  disabled={!myReservation}
                  title={!myReservation ? "You must lock this portfolio to log issues" : "Log this issue"}
                  className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 font-medium whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Log Ticket
                </button>
              </td>
            </tr>

            {/* Existing Issues */}
            {displayIssues.length === 0 ? (
              <tr>
                <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                  {filters.issueFilter === 'yes'
                    ? 'No issues with "Issue Present = Yes" found. Select "All Issues" to see all issues.'
                    : 'No issues found matching the filters'}
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
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${(issue.issue_present || '').toLowerCase() === 'yes'
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
