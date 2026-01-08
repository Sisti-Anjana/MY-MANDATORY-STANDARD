import React, { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '../services/supabaseClient';
import { convertToEST } from '../utils/dateUtils';

const PortfolioHourSessionDrawer = ({
  isOpen,
  portfolioName,
  hour,
  portfolios,
  issues,
  activeReservations = [],
  monitoredPersonnel,
  onClose,
  onRefresh,
}) => {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [localIssues, setLocalIssues] = useState([]);
  const [sitesCheckedDetails, setSitesCheckedDetails] = useState('');
  const [showSitesCheckedInput, setShowSitesCheckedInput] = useState(false);
  const [updatingSitesChecked, setUpdatingSitesChecked] = useState(false);

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

  const [isLockedByMe, setIsLockedByMe] = useState(false);
  const lastAutoLockedValues = useRef({ portfolioId: '', hour: '' });

  // 1. SYNC LOCK STATE WITH GLOBAL PROP
  useEffect(() => {
    if (!isOpen || !portfolioId || hour === null) {
      setIsLockedByMe(false);
      return;
    }

    const sessionId = localStorage.getItem('session_id') || `session-${Date.now()}`;
    const currentUser = String(loggedInUser || '').trim();

    const myGlobalRes = activeReservations.find(r =>
      (r.portfolio_id || r.id) === portfolioId &&
      r.issue_hour === hour &&
      r.session_id === sessionId &&
      r.monitored_by === currentUser
    );

    if (myGlobalRes) {
      if (!isLockedByMe) {
        console.log('🔄 Syncing Drawer lock from global state');
        setIsLockedByMe(true);
        // Update ref to show we have THIS lock, prevents immediate auto-lock attempt
        lastAutoLockedValues.current = { portfolioId, hour };
      }
    } else {
      if (isLockedByMe) {
        console.log('🔄 Clearing Drawer lock - no longer exists in global state');
        setIsLockedByMe(false);
      }
    }
  }, [activeReservations, isOpen, portfolioId, hour, loggedInUser, isLockedByMe]);

  // 2. AUTO-LOCK AND DATA LOADING
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    // CRITICAL VALIDATION: Check lock status and AUTO-LOCK if free
    const manageLock = async () => {
      if (!portfolioId) return;

      const sessionId = localStorage.getItem('session_id') || `session-${Date.now()}`;
      const currentUser = String(loggedInUser || '').trim();

      // OPTIMIZATION: Only auto-lock if selection actually CHANGED
      const currentValues = { portfolioId, hour };
      const hasChanged =
        currentValues.portfolioId !== lastAutoLockedValues.current.portfolioId ||
        currentValues.hour !== lastAutoLockedValues.current.hour;

      if (!hasChanged && isLockedByMe) {
        // Already have a lock and nothing changed
        return;
      }

      // CRITICAL: If selection hasn't changed and we DON'T have a lock, it means we recently UNLOCKED 
      // or someone else has it. Don't grab it back automatically. 
      // But if we just got it via SYNC (above), we should let it pass.
      if (!hasChanged && !isLockedByMe) {
        // Special case: if activeReservations says we have it, we shouldn't be here (sync would set isLockedByMe)
        // If we are here, it's either free or someone else has it.
        const someoneElseHasIt = activeReservations.some(r =>
          (r.portfolio_id || r.id) === portfolioId && r.issue_hour === hour
        );

        if (!someoneElseHasIt) {
          console.log('ℹ️ Drawer selection unchanged and no lock. Skipping auto-lock to prevent loop.');
          return;
        }
      }

      try {
        setError(null);

        // 1. Check global reservations for this portfolio/hour
        const existingLock = activeReservations.find(r =>
          (r.portfolio_id || r.id) === portfolioId && r.issue_hour === hour
        );

        if (existingLock) {
          const rSessionId = String(existingLock.session_id || '').trim();
          const rMonitoredBy = String(existingLock.monitored_by || '').trim();
          const isMine = rSessionId === String(sessionId || '').trim() && rMonitoredBy === currentUser;

          if (isMine) {
            setIsLockedByMe(true);
            lastAutoLockedValues.current = currentValues;
            return;
          } else {
            // Locked by someone else - BLOCK IT
            setError(`❌ ERROR: Locked by "${rMonitoredBy}". Please close this drawer.`);
            setIsLockedByMe(false);
            return;
          }
        }

        // 2. Check if I have an active lock on ANOTHER portfolio/hour
        const myOtherLock = activeReservations.find(r =>
          r.session_id === String(sessionId || '').trim() &&
          r.monitored_by === currentUser &&
          ((r.portfolio_id || r.id) !== portfolioId || r.issue_hour !== hour)
        );

        if (myOtherLock) {
          const otherPortfolio = portfolios.find(p => (p.portfolio_id || p.id) === myOtherLock.portfolio_id);
          setError(`❌ ERROR: You already have a lock on "${otherPortfolio?.name || 'another portfolio'}" (Hour ${myOtherLock.issue_hour}). Please complete that first.`);
          setIsLockedByMe(false);
          return;
        }

        // 3. No active lock found - Attempt to AUTO-LOCK
        console.log('🔒 Portfolio is free. Auto-locking for drawer:', currentUser);
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

        const { error: insertError } = await supabase
          .from('hour_reservations')
          .insert([{
            portfolio_id: portfolioId,
            issue_hour: hour,
            monitored_by: currentUser,
            session_id: sessionId,
            expires_at: expiresAt
          }]);

        if (insertError) {
          console.error('Error creating auto-lock:', insertError);
          setError('Failed to acquire lock. Someone might have just taken it.');
        } else {
          console.log('✅ Auto-lock successful for drawer');
          setIsLockedByMe(true);
          lastAutoLockedValues.current = currentValues;
          if (onRefresh) onRefresh();
        }
      } catch (err) {
        console.error('Drawer manageLock error:', err);
      }
    };

    manageLock();

    const filtered = issues.filter(
      (issue) =>
        issue.portfolio_name === portfolioName &&
        issue.issue_hour === hour
    );
    setLocalIssues(filtered);

    // Initialize sites checked details from portfolio record
    if (portfolioRecord?.sites_checked_details) {
      setSitesCheckedDetails(portfolioRecord.sites_checked_details);
      setShowSitesCheckedInput(true);
    } else {
      setSitesCheckedDetails('');
      setShowSitesCheckedInput(portfolioRecord?.all_sites_checked === false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, issues, portfolioName, hour, portfolioId, loggedInUser, portfolioRecord]);

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

    // CRITICAL: Lock validation - MUST have a lock to add an issue
    if (!isLockedByMe) {
      setError('❌ ERROR: You must lock this portfolio before adding an issue. Please wait for the auto-lock to confirm.');
      return;
    }

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
    <div className="fixed inset-0 z-50 flex pointer-events-none">
      <div
        className="flex-1 bg-transparent pointer-events-none"
      />
      <div className="w-full max-w-xl h-full bg-white shadow-2xl border-l border-gray-200 flex flex-col pointer-events-auto overflow-y-auto">
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
            {isLockedByMe && (
              <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                🔒 Locked by You
              </div>
            )}
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
            {!isLockedByMe && (
              <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                ⚠️ You must lock this portfolio to add issues. Close and reopen this drawer to lock it.
              </div>
            )}
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
                    disabled={!isLockedByMe}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                    disabled={!isLockedByMe}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                  disabled={!isLockedByMe}
                  onKeyDown={(e) => {
                    // Allow Enter key to submit the form (but allow Shift+Enter for new line)
                    if (e.key === 'Enter' && !e.shiftKey && isLockedByMe) {
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
                  className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                  disabled={!isLockedByMe}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Select</option>
                  {monitoredPersonnel.map((person) => (
                    <option key={person} value={person}>
                      {person}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleAddIssue}
                  disabled={saving || !isLockedByMe}
                  title={!isLockedByMe ? 'You must lock this portfolio to add issues' : ''}
                  className="px-6 py-2 bg-green-600 text-white text-xs font-semibold rounded shadow-sm hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                >
                  {saving ? 'Saving...' : 'Add Issue'}
                </button>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-3 mt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-gray-900">All sites checked?</h4>
                    <p className="text-[10px] text-gray-500 mt-1">
                      Confirm after you verify every site.
                    </p>
                  </div>
                  <span className={`text-xs font-semibold ${portfolioRecord?.all_sites_checked ? 'text-green-600' : 'text-yellow-600'}`}>
                    {portfolioRecord?.all_sites_checked ? 'Yes' : 'No'}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      if (!isLockedByMe) {
                        setError('❌ ERROR: You must have the portfolio locked to mark it as complete.');
                        return;
                      }

                      // Requirement: Must have at least one issue logged for the hour
                      if (localIssues.length === 0) {
                        setError('Please log an issue for this hour before confirming all sites checked.');
                        return;
                      }

                      setUpdatingSitesChecked(true);
                      setError(null);
                      try {
                        const today = new Date().toISOString().split('T')[0];
                        const { error: updateError } = await supabase
                          .from('portfolios')
                          .update({
                            all_sites_checked: true,
                            all_sites_checked_hour: hour,
                            all_sites_checked_date: today,
                            all_sites_checked_by: loggedInUser,
                            sites_checked_details: null
                          })
                          .eq('portfolio_id', portfolioId);

                        if (updateError) throw updateError;

                        // Release lock
                        await supabase
                          .from('hour_reservations')
                          .delete()
                          .eq('portfolio_id', portfolioId);

                        setIsLockedByMe(false);
                        setSitesCheckedDetails('');
                        setShowSitesCheckedInput(false);
                        if (onRefresh) onRefresh();
                      } catch (err) {
                        console.error('Error marking as complete:', err);
                        setError('Failed to mark as complete.');
                      } finally {
                        setUpdatingSitesChecked(false);
                      }
                    }}
                    disabled={updatingSitesChecked || portfolioRecord?.all_sites_checked}
                    className={`flex-1 px-3 py-1.5 rounded border text-xs font-semibold transition-colors ${portfolioRecord?.all_sites_checked
                      ? 'bg-green-600 text-white border-green-600'
                      : 'border-gray-300 text-gray-700 hover:border-green-500 hover:text-green-600'
                      } ${updatingSitesChecked ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      setUpdatingSitesChecked(true);
                      setError(null);
                      try {
                        const { error: updateError } = await supabase
                          .from('portfolios')
                          .update({
                            all_sites_checked: false,
                            all_sites_checked_hour: null,
                            all_sites_checked_date: null,
                            all_sites_checked_by: null,
                            // Preserve details if already present, or leave as is
                          })
                          .eq('portfolio_id', portfolioId);

                        if (updateError) throw updateError;

                        setShowSitesCheckedInput(true);

                        // Re-lock if needed
                        if (!isLockedByMe) {
                          const sessionId = localStorage.getItem('session_id') || `session-${Date.now()}`;
                          const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

                          const { error: lockError } = await supabase
                            .from('hour_reservations')
                            .insert([{
                              portfolio_id: portfolioId,
                              issue_hour: hour,
                              monitored_by: loggedInUser,
                              session_id: sessionId,
                              expires_at: expiresAt
                            }]);

                          if (lockError) {
                            console.error('Error re-locking on "No":', lockError);
                          } else {
                            setIsLockedByMe(true);
                            lastAutoLockedValues.current = { portfolioId, hour };
                          }
                        }

                        if (onRefresh) onRefresh();
                      } catch (err) {
                        console.error('Error undoing completion:', err);
                        setError('Failed to undo completion.');
                      } finally {
                        setUpdatingSitesChecked(false);
                      }
                    }}
                    disabled={updatingSitesChecked || (!portfolioRecord?.all_sites_checked && showSitesCheckedInput)}
                    className={`flex-1 px-3 py-1.5 rounded border text-xs font-semibold transition-colors ${!portfolioRecord?.all_sites_checked
                      ? 'bg-yellow-500 text-white border-yellow-500'
                      : 'border-gray-300 text-gray-700 hover:border-yellow-500 hover:text-yellow-600'
                      } ${updatingSitesChecked ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    No
                  </button>
                </div>

                {showSitesCheckedInput && (
                  <div className="mt-2">
                    <label className="block text-[10px] font-medium text-gray-700 mb-1">
                      Which sites have you checked?
                    </label>
                    <input
                      type="text"
                      value={sitesCheckedDetails}
                      onChange={(e) => setSitesCheckedDetails(e.target.value)}
                      placeholder='e.g., "Site 1 to Site 5"'
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500"
                      onBlur={async () => {
                        if (sitesCheckedDetails.trim() !== (portfolioRecord?.sites_checked_details || '')) {
                          try {
                            await supabase
                              .from('portfolios')
                              .update({ sites_checked_details: sitesCheckedDetails.trim() })
                              .eq('portfolio_id', portfolioId);
                            if (onRefresh) onRefresh();
                          } catch (err) {
                            console.error('Error saving site details:', err);
                          }
                        }
                      }}
                    />
                  </div>
                )}
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
                            className={`inline-flex px-2 py-0.5 text-[11px] font-semibold rounded-full ${present
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
                            ? convertToEST(issue.created_at).toLocaleString('en-US', { timeZone: 'America/New_York' })
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


