import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { portfoliosAPI } from '../services/api';

const ActionModal = ({ isOpen, onClose, title, portfolioId, portfolioData }) => {
  const navigate = useNavigate();
  const [allSitesChecked, setAllSitesChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(true);
  const [sitesStatus, setSitesStatus] = useState({
    completed: 0,
    total: 0,
    sites: []
  });
  const [showReasonInput, setShowReasonInput] = useState(false);
  const [reason, setReason] = useState('');

  // Fetch current status and sites data when modal opens
  useEffect(() => {
    if (isOpen && portfolioId) {
      fetchPortfolioStatus();
      fetchSitesStatus();
    }
  }, [isOpen, portfolioId]);
  
  // Fetch sites status for the portfolio
  const fetchSitesStatus = async () => {
    try {
      const response = await portfoliosAPI.getSites(portfolioId);
      setSitesStatus({
        completed: response.data.completed || 0,
        total: response.data.total || 0,
        sites: response.data.sites || []
      });
    } catch (error) {
      console.error('Error fetching sites status:', error);
      // If we have portfolioData, use that as fallback
      if (portfolioData) {
        setSitesStatus(prev => ({
          ...prev,
          total: portfolioData.total_sites || 0,
          completed: portfolioData.completed_sites || 0
        }));
      }
    }
  };

  const fetchPortfolioStatus = async () => {
    try {
      setStatusLoading(true);
      const response = await portfoliosAPI.getById(portfolioId);
      setAllSitesChecked(response.data.all_sites_checked || false);
    } catch (error) {
      console.error('Error fetching portfolio status:', error);
      setAllSitesChecked(false);
    } finally {
      setStatusLoading(false);
    }
  };

  const handleStatusChange = async (status) => {
    try {
      setLoading(true);
      
      // Use Supabase to update portfolio status
      const { supabase } = await import('../services/supabaseClient');
      const { error } = await supabase
        .from('portfolios')
        .update({ 
          all_sites_checked: status,
          ...(!status && { sites_checked_details: reason || 'No reason provided' })
        })
        .eq('portfolio_id', portfolioId);
      
      if (error) throw error;
      
      setAllSitesChecked(status);
      setShowReasonInput(false);
      setReason(''); // Clear reason after saving
    } catch (error) {
      console.error('Error updating portfolio status:', error);
      alert('Failed to update status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewIssues = () => {
    // Close modal - parent component will handle navigation
    onClose();
    // Trigger custom event for parent to handle
    window.dispatchEvent(new CustomEvent('viewIssues', { detail: { portfolioId } }));
  };

  const handleLogIssue = () => {
    // Close modal - parent component will handle navigation
    onClose();
    // Trigger custom event for parent to handle
    window.dispatchEvent(new CustomEvent('logIssue', { detail: { portfolioId } }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* All Sites Checked Section - At the TOP */}
          <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <div className="font-semibold text-gray-900">All Sites Checked?</div>
                  {sitesStatus.total > 0 && (
                    <div className="text-xs text-gray-600 mt-1">
                      {sitesStatus.completed} of {sitesStatus.total} sites completed
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center">
                {sitesStatus.total > 0 && (
                  <div className="h-2 bg-gray-200 rounded-full w-20 mr-3 overflow-hidden">
                    <div 
                      className="h-full bg-green-500 transition-all duration-300" 
                      style={{ width: `${(sitesStatus.completed / sitesStatus.total) * 100}%` }}
                    ></div>
                  </div>
                )}
                {statusLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                ) : (
                  <div className="text-sm font-medium">
                    {allSitesChecked ? 'Yes' : 'No'}
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex gap-3">
                <button
                  onClick={() => handleStatusChange(true)}
                  className="flex-1 py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md font-medium transition-colors"
                >
                  Yes
                </button>
                <button
                  onClick={() => {
                    setShowReasonInput(true);
                  }}
                  className="flex-1 py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded-md font-medium transition-colors"
                >
                  No
                </button>
              </div>

              {/* Show reason input when "No" is clicked */}
              {showReasonInput && (
                <div className="mt-2 space-y-2 p-4 bg-gray-50 rounded-md border border-gray-200">
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter reason for not completing all sites"
                    autoFocus
                  />
                  <div className="flex justify-between gap-2">
                    <button
                      onClick={() => {
                        setShowReasonInput(false);
                        setReason('');
                      }}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleStatusChange(false)}
                      disabled={loading || statusLoading || !reason.trim()}
                      className="flex-1 px-4 py-2 bg-red-500 text-white rounded-md text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Saving...' : 'Save Reason'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-3 text-xs text-gray-600">
            <p className="flex items-start gap-1">
              <svg className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>The card will only turn <strong className="text-green-600">green</strong> when you select <strong>Yes</strong>, even if issues are logged.</span>
            </p>
          </div>
        </div>

        <p className="text-gray-600 mb-4">What would you like to do?</p>

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
                <div className="text-sm text-gray-600">Browse all reported issues</div>
              </div>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <button
            onClick={handleLogIssue}
            className="w-full flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 border-2 border-green-200 hover:border-green-300 rounded-lg transition-all"
          >
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-900">Log New Issue</div>
                <div className="text-sm text-gray-600">Report a new issue</div>
              </div>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActionModal;
