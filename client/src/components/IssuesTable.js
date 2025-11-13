import React, { useState, useEffect } from 'react';
import { issuesAPI, portfoliosAPI } from '../services/api';
import EditIssueModal from './EditIssueModal';

const IssuesTable = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({
    portfolio: '',
    hour: '',
    issuePresent: '',
    dateFrom: '',
    dateTo: ''
  });
  const [editingIssue, setEditingIssue] = useState(null);
  const [portfolios, setPortfolios] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);

  const monitoredPersonnel = [
    "Kumar S", "Rajesh K", "Bharat Gu", "Anita P", "Deepa L", 
    "Manoj D", "Vikram N", "Ravi T", "Lakshmi B",
    "BXJBSA", "utfzytf", "76tyjtv", "HJVXHASV", "kinny"
  ];

  useEffect(() => {
    fetchIssues();
    fetchPortfolios();
  }, []);

  const fetchPortfolios = async () => {
    try {
      const response = await portfoliosAPI.getAll();
      setPortfolios(response.data);
    } catch (err) {
      console.error('Error fetching portfolios:', err);
    }
  };

  const fetchIssues = async () => {
    try {
      const response = await issuesAPI.getAll();
      setIssues(response.data);
    } catch (err) {
      setError('Failed to fetch issues');
      console.error('Error fetching issues:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const handleEditIssue = (issue) => {
    setEditingIssue(issue);
    setShowEditModal(true);
  };

  const handleSaveIssue = async (updatedIssue) => {
    try {
      const response = await fetch(`http://localhost:5001/api/issues/${updatedIssue.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          portfolio_id: updatedIssue.portfolio_id,
          issue_hour: updatedIssue.issue_hour,
          issue_present: updatedIssue.issue_present,
          issue_details: updatedIssue.issue_details,
          case_number: updatedIssue.case_number,
          monitored_by: updatedIssue.monitored_by,
          issues_missed_by: updatedIssue.issues_missed_by
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update issue');
      }

      // Refresh the issues list
      await fetchIssues();
      setShowEditModal(false);
      setEditingIssue(null);
    } catch (err) {
      console.error('Error updating issue:', err);
      alert('Failed to update issue: ' + err.message);
    }
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setEditingIssue(null);
  };

  const filteredIssues = issues.filter(issue => {
    if (filter.portfolio && issue.portfolio_name !== filter.portfolio) return false;
    if (filter.hour && issue.issue_hour.toString() !== filter.hour) return false;
    if (filter.issuePresent && issue.issue_present !== filter.issuePresent) return false;
    return true;
  });

  const clearFilters = () => {
    setFilter({
      portfolio: '',
      hour: '',
      issuePresent: '',
      dateFrom: '',
      dateTo: ''
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const uniquePortfolios = [...new Set(issues.map(i => i.portfolio_name))].sort();
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="space-y-6 p-6">
      {/* Filters Section */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Filter
            </label>
            <input
              type="text"
              placeholder="dd-mm-yyyy"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hour Filter
            </label>
            <select
              value={filter.hour}
              onChange={(e) => setFilter({...filter, hour: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">All Hours</option>
              {hours.map(hour => (
                <option key={hour} value={hour}>{hour}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filter.issuePresent === 'Yes'}
                onChange={(e) => setFilter({...filter, issuePresent: e.target.checked ? 'Yes' : ''})}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Show All Issues</span>
            </label>
          </div>

          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Issues Table */}
      <div className="bg-white shadow overflow-x-auto rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Portfolio
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Hour
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Issue Present
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Issue Description
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Case #
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Monitored By
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Date/Time
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Issues Missed By
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredIssues.length === 0 ? (
              <tr>
                <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                  No issues found. <a href="/log-issue" className="text-blue-600 hover:underline">Log your first issue</a>
                </td>
              </tr>
            ) : (
              filteredIssues.map((issue) => (
                <tr key={issue.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {issue.portfolio_name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {issue.issue_hour}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${
                      issue.issue_present?.toString().toLowerCase() === 'yes' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {issue.issue_present?.toString().toLowerCase() === 'yes' ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">
                    {issue.issue_details || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {issue.case_number || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {issue.monitored_by || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {formatDate(issue.created_at)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {issue.issues_missed_by || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <button 
                      onClick={() => handleEditIssue(issue)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Summary Section */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">All Issues</h3>
        <p className="text-sm text-gray-600">
          Complete list of all reported issues across all portfolios
        </p>
      </div>

      {/* Edit Issue Modal */}
      {showEditModal && editingIssue && (
        <EditIssueModal
          issue={editingIssue}
          portfolios={portfolios.map(p => ({ portfolio_id: p.id, name: p.name }))}
          sites={[]}
          monitoredPersonnel={monitoredPersonnel}
          onClose={handleCloseModal}
          onSave={handleSaveIssue}
        />
      )}
    </div>
  );
};

export default IssuesTable;
