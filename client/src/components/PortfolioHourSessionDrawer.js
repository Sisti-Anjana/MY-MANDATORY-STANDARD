import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../services/supabaseClient';

const PortfolioHourSessionDrawer = ({
  isOpen,
  portfolioName,
  hour,
  portfolios,
  issues,
  monitoredPersonnel,
  onClose,
  onRefresh,
}) => {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [localIssues, setLocalIssues] = useState([]);

  const loggedInUser = useMemo(() => {
    return (
      sessionStorage.getItem('username') ||
      sessionStorage.getItem('fullName') ||
      'LibsysAdmin'
    );
  }, []);

  const portfolioRecord = useMemo(
    () => portfolios.find((p) => p.name === portfolioName),
    [portfolios, portfolioName]
  );

  const portfolioId = portfolioRecord?.portfolio_id || portfolioRecord?.id || null;

  useEffect(() => {
    if (!isOpen) return;
    
    // CRITICAL VALIDATION: Check if portfolio is locked by someone else when drawer opens
    const validateLock = async () => {
      if (!portfolioId) return;

      const sessionId = localStorage.getItem('session_id') || `session-${Date.now()}`;
      const nowIso = new Date().toISOString();
      const currentUser = String(loggedInUser || '').trim();

      const { data: activeReservations, error: reservationCheckError } = await supabase
        .from('hour_reservations')
        .select('*')
        .eq('portfolio_id', portfolioId)
        .eq('issue_hour', hour)
        .gt('expires_at', nowIso);

      if (reservationCheckError) {
        console.error('Error checking reservation:', reservationCheckError);
        return;
      }

      // Check if someone else has it locked
      if (activeReservations && activeReservations.length > 0) {
        // Filter to see if it's MY lock
        const myActiveReservations = activeReservations.filter(r => {
          const rSessionId = String(r.session_id || '').trim();
          const rMonitoredBy = String(r.monitored_by || '').trim();
          return rSessionId === String(sessionId || '').trim() && 
                 rMonitoredBy === currentUser;
        });

        if (myActiveReservations.length === 0) {
          // Someone else has it locked - close the drawer
          const otherLock = activeReservations[0];
          const lockedBy = String(otherLock.monitored_by || 'another user').trim();
          const errorMsg = `❌ ERROR: This portfolio "${portfolioName}" (Hour ${hour}) is locked by "${lockedBy}". Only the person who locked it can open the session sheet.`;
          setError(errorMsg);
          alert(errorMsg);
          // Close the drawer after a short delay
          setTimeout(() => {
            closeDrawer();
          }, 2000);
          return;
        }
      }
    };

    validateLock();

    const filtered = issues.filter(
      (issue) =>
        issue.portfolio_name === portfolioName &&
        issue.issue_hour === hour
    );
    setLocalIssues(filtered);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, issues, portfolioName, hour, portfolioId, loggedInUser]);

  const [newRow, setNewRow] = useState({
    site_name: '',
    case_number: '',
    issue_present: 'Yes',
    issue_details: '',
    issues_missed_by: '',
  });

  const handleNewRowChange = (e) => {
    const { name, value } = e.target;
    setNewRow((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddIssue = async () => {
    if (!portfolioId) {
      setError('Unable to determine portfolio ID for this session.');
      return;
    }

    const trimmedDetails = (newRow.issue_details || '').trim();
    if (newRow.issue_present === 'Yes' && !trimmedDetails) {
      setError('Please enter issue details.');
      return;
    }

    // CRITICAL VALIDATION: Only the person who locked the portfolio can add issues
    // Must check BOTH session_id AND monitored_by to ensure it's truly YOUR lock
    const sessionId = localStorage.getItem('session_id') || `session-${Date.now()}`;
    const nowIso = new Date().toISOString();
    const currentUser = String(loggedInUser || '').trim();

    console.log('🔒 VALIDATING LOCK BEFORE ADDING ISSUE:', {
      portfolioName,
      portfolioId,
      hour,
      mySessionId: sessionId,
      myUser: currentUser
    });

    // Check if there's an active reservation for this portfolio/hour
    const { data: activeReservations, error: reservationCheckError } = await supabase
      .from('hour_reservations')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .eq('issue_hour', hour)
      .gt('expires_at', nowIso);

    if (reservationCheckError) {
      console.error('❌ Error checking reservation:', reservationCheckError);
      setError('Unable to verify portfolio lock. Please try again.');
      return;
    }

    console.log('📋 Found active reservations:', activeReservations?.length || 0);
    if (activeReservations && activeReservations.length > 0) {
      activeReservations.forEach((r, idx) => {
        console.log(`  Reservation ${idx + 1}:`, {
          session_id: r.session_id,
          monitored_by: r.monitored_by,
          portfolio_id: r.portfolio_id,
          hour: r.issue_hour
        });
      });
    }

    // Filter to ensure BOTH session_id AND monitored_by match the current user
    // CRITICAL: Use case-insensitive comparison for monitored_by
    const myActiveReservations = (activeReservations || []).filter(r => {
      const rSessionId = String(r.session_id || '').trim();
      const rMonitoredBy = String(r.monitored_by || '').trim();
      const mySessionIdStr = String(sessionId || '').trim();
      const myUserStr = String(currentUser || '').trim();
      
      const sessionMatches = rSessionId === mySessionIdStr;
      const userMatches = rMonitoredBy.toLowerCase() === myUserStr.toLowerCase();
      const isMyLock = sessionMatches && userMatches;
      
      console.log('🔍 Checking reservation:', {
        reservationSessionId: rSessionId,
        mySessionId: mySessionIdStr,
        sessionMatches,
        reservationMonitoredBy: rMonitoredBy,
        reservationMonitoredByLower: rMonitoredBy.toLowerCase(),
        myUser: currentUser,
        myUserLower: myUserStr.toLowerCase(),
        userMatches,
        isMyLock
      });
      
      return isMyLock;
    });

    const activeReservation = myActiveReservations.length > 0 
      ? myActiveReservations[0] 
      : null;

    if (!activeReservation) {
      // Check if someone else has it locked
      if (activeReservations && activeReservations.length > 0) {
        const otherLock = activeReservations[0];
        const lockedBy = String(otherLock.monitored_by || 'another user').trim();
        console.error('❌ BLOCKED: Portfolio is locked by someone else', {
          lockedBy,
          myUser: currentUser,
          portfolioName,
          hour
        });
        const errorMsg = `❌ ERROR: This portfolio "${portfolioName}" (Hour ${hour}) is locked by "${lockedBy}". Only the person who locked it can add issues.`;
        setError(errorMsg);
        alert(errorMsg); // Also show alert to make it more visible
        return; // CRITICAL: Stop execution here
      } else {
        console.warn('⚠️ No lock found - requiring lock first');
        const errorMsg = 'You must lock this portfolio first before logging issues. Please select the portfolio, hour, and monitored by person to create a lock, then you can log issues.';
        setError(errorMsg);
        alert(errorMsg); // Also show alert to make it more visible
        return; // CRITICAL: Stop execution here
      }
    }

    console.log('✅ Lock validated - user has valid lock:', {
      sessionId: activeReservation.session_id,
      monitoredBy: activeReservation.monitored_by
    });

    setSaving(true);
    setError(null);

    try {
      const payload = {
        portfolio_id: portfolioId,
        issue_hour: hour,
        issue_present: newRow.issue_present || 'Yes',
        issue_details:
          trimmedDetails ||
          (newRow.issue_present === 'No' ? 'No issue' : null),
        case_number: newRow.case_number?.trim() || null,
        monitored_by: loggedInUser,
        issues_missed_by: newRow.issues_missed_by?.trim() || null,
        entered_by: loggedInUser || 'System',
      };

      const { data, error: insertError } = await supabase
        .from('issues')
        .insert([payload])
        .select(`
          *,
          portfolios (
            portfolio_id,
            name
          )
        `);

      if (insertError) {
        throw insertError;
      }

      const inserted = data && data[0];
      if (inserted) {
        const transformed = {
          ...inserted,
          portfolio_name: inserted.portfolios?.name || portfolioName,
        };
        setLocalIssues((prev) => [transformed, ...prev]);
      }

      // CRITICAL FIX: Release reservation immediately after adding issue
      // IMPORTANT: Do NOT release lock after adding issue
      // User should be able to log multiple issues with a single lock
      // Lock will only be released when:
      // 1. User marks "All Sites Checked" = Yes
      // 2. Hour changes (automatic)
      // 3. Admin manually removes lock

      setNewRow({
        site_name: '',
        case_number: '',
        issue_present: 'Yes',
        issue_details: '',
        issues_missed_by: '',
      });

      if (onRefresh) {
        onRefresh();
      }
    } catch (err) {
      console.error('Error adding session issue:', err);
      setError(err.message || 'Failed to add issue.');
    } finally {
      setSaving(false);
    }
  };

  const closeDrawer = () => {
    setError(null);
    onClose && onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="flex-1 bg-black bg-opacity-40"
        onClick={closeDrawer}
      />
      <div className="w-full max-w-xl h-full bg-white shadow-2xl border-l border-gray-200 flex flex-col">
        <div className="px-5 py-4 border-b flex items-center justify-between bg-gray-50">
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase">
              Session Sheet
            </div>
            <div className="text-lg font-bold text-gray-900">
              {portfolioName}{' '}
              <span className="text-sm font-medium text-gray-500">
                · Hour {hour}
              </span>
            </div>
            <div className="text-xs text-gray-600 mt-1">
              Monitored by <span className="font-semibold">{loggedInUser}</span>
            </div>
          </div>
          <button
            onClick={closeDrawer}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {error && (
            <div className="px-3 py-2 rounded border border-red-200 bg-red-50 text-xs text-red-700">
              {error}
            </div>
          )}

          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="text-xs font-semibold text-green-700 mb-2">
              Quick status
            </div>
            <div className="text-xs text-gray-700">
              Use this panel to log all issues for this portfolio and hour in
              one place. Each row below is a sub-issue that auto-saves when you
              click Add.
            </div>
          </div>

          <div className="border rounded-lg p-3 bg-gray-50">
            <div className="text-sm font-semibold text-gray-800 mb-2">
              Add issue for this hour
            </div>
            <div className="grid grid-cols-1 gap-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Issue Present
                  </label>
                  <select
                    name="issue_present"
                    value={newRow.issue_present}
                    onChange={handleNewRowChange}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Case #
                  </label>
                  <input
                    type="text"
                    name="case_number"
                    value={newRow.case_number}
                    onChange={handleNewRowChange}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Issue Description
                </label>
                <textarea
                  name="issue_details"
                  value={newRow.issue_details}
                  onChange={handleNewRowChange}
                  onKeyDown={(e) => {
                    // Allow Enter key to submit the form (but allow Shift+Enter for new line)
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAddIssue();
                    }
                  }}
                  rows={2}
                  placeholder={
                    newRow.issue_present === 'No'
                      ? 'No issue'
                      : 'Describe the problem...'
                  }
                  className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Issues Missed By (optional)
                </label>
                <select
                  name="issues_missed_by"
                  value={newRow.issues_missed_by}
                  onChange={handleNewRowChange}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Select</option>
                  {monitoredPersonnel.map((person) => (
                    <option key={person} value={person}>
                      {person}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleAddIssue}
                  disabled={saving}
                  className="px-4 py-1.5 bg-green-600 text-white text-xs font-semibold rounded hover:bg-green-700 disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Add Issue'}
                </button>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-semibold text-gray-800">
                Issues for this hour ({localIssues.length})
              </div>
            </div>
            {localIssues.length === 0 ? (
              <div className="text-xs text-gray-500 border border-dashed border-gray-300 rounded p-4 text-center bg-gray-50">
                No issues logged for this portfolio and hour yet.
              </div>
            ) : (
              <div className="space-y-2">
                {localIssues.map((issue) => {
                  const present =
                    (issue.issue_present || '').toLowerCase() === 'yes';
                  return (
                    <div
                      key={issue.issue_id || issue.id}
                      className="border rounded-lg p-3 bg-white shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex px-2 py-0.5 text-[11px] font-semibold rounded-full ${
                              present
                                ? 'bg-red-100 text-red-700'
                                : 'bg-green-100 text-green-700'
                            }`}
                          >
                            {present ? 'Issue' : 'No Issue'}
                          </span>
                          {issue.case_number && (
                            <span className="text-[11px] text-gray-600">
                              📋 {issue.case_number}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-gray-500">
                          {issue.created_at
                            ? new Date(issue.created_at).toLocaleString()
                            : ''}
                        </div>
                      </div>
                      <div className="text-xs text-gray-900 mb-1">
                        {issue.issue_details || 'No details'}
                      </div>
                      <div className="flex flex-wrap gap-3 text-[11px] text-gray-600">
                        {issue.monitored_by && (
                          <span>👤 {issue.monitored_by}</span>
                        )}
                        {issue.issues_missed_by && (
                          <span className="text-orange-600">
                            ⚠ Missed by {issue.issues_missed_by}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="px-5 py-3 border-t bg-gray-50 flex justify-end">
          <button
            onClick={closeDrawer}
            className="px-4 py-1.5 text-xs font-semibold bg-gray-700 text-white rounded hover:bg-gray-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PortfolioHourSessionDrawer;


