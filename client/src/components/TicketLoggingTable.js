import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

const TicketLoggingTable = ({ issues, portfolios, sites, monitoredPersonnel, currentHour, onRefresh, onEditIssue }) => {
  const [filters, setFilters] = useState({
    searchText: '',
    dateFilter: '',
    hourFilter: '',
    showAllIssues: true
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

  const hours = Array.from({ length: 24 }, (_, i) => i);

  useEffect(() => {
    setFormData(prev => ({ ...prev, issue_hour: currentHour }));
  }, [currentHour]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    console.log(`Form change: ${name} = "${value}"`);
    
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'issue_present') {
      if (value === 'no') {
        setFormData(prev => ({ ...prev, issue_details: 'No issue present' }));
      } else if (value === 'yes') {
        setFormData(prev => ({ ...prev, issue_details: '' }));
      }
    }
  };

  const handleClearFilters = () => {
    setFilters({
      searchText: '',
      dateFilter: '',
      hourFilter: '',
      showAllIssues: true
    });
  };

  const handleSubmit = async () => {
    console.log('==========================================');
    console.log('TICKET SUBMIT BUTTON CLICKED');
    console.log('Current formData:', JSON.stringify(formData, null, 2));
    console.log('==========================================');
    
    // VALIDATION STEP 1: Portfolio
    if (!formData.portfolio_id || formData.portfolio_id === '') {
      console.error('VALIDATION FAILED: No portfolio selected');
      alert('❌ ERROR: Please select a Portfolio');
      return;
    }
    console.log('✓ Portfolio validation passed:', formData.portfolio_id);

    // VALIDATION STEP 2: Issue Present (CRITICAL!)
    const issuePresent = String(formData.issue_present).trim();
    console.log('Checking issue_present value:', `"${issuePresent}"`);
    
    if (!issuePresent || issuePresent === '') {
      console.error('VALIDATION FAILED: issue_present is empty');
      alert('❌ ERROR: Please select "Yes" or "No" for Issue Present');
      return;
    }
    
    if (issuePresent !== 'yes' && issuePresent !== 'no') {
      console.error('VALIDATION FAILED: issue_present has invalid value:', issuePresent);
      alert(`❌ ERROR: Invalid Issue Present value. Must be "yes" or "no"`);
      return;
    }
    console.log('✓ Issue Present validation passed:', issuePresent);

    // VALIDATION STEP 3: Issue Details (when yes)
    if (issuePresent === 'yes' && (!formData.issue_details || formData.issue_details.trim() === '')) {
      console.error('VALIDATION FAILED: No issue details when issue present is yes');
      alert('❌ ERROR: Please provide issue details when issue is present');
      return;
    }
    console.log('✓ Issue Details validation passed');

    try {
      // BUILD DATA OBJECT - ENSURE CLEAN STRING VALUES
      const dataToInsert = {
        portfolio_id: formData.portfolio_id,
        site_id: formData.site_id && formData.site_id !== '' ? formData.site_id : null,
        issue_hour: parseInt(formData.issue_hour, 10),
        issue_present: issuePresent, // GUARANTEED to be 'Yes' or 'No'
        issue_details: formData.issue_details && formData.issue_details.trim() !== '' 
          ? formData.issue_details.trim() 
          : (issuePresent === 'no' ? 'No issue present' : null),
        case_number: formData.case_number && formData.case_number.trim() !== '' ? formData.case_number.trim() : null,
        monitored_by: formData.monitored_by && formData.monitored_by !== '' ? formData.monitored_by : null,
        issues_missed_by: formData.issues_missed_by && formData.issues_missed_by !== '' ? formData.issues_missed_by : null,
        entered_by: formData.entered_by || 'System'
      };

      console.log('==========================================');
      console.log('DATA BEING SENT TO DATABASE:');
      console.log(JSON.stringify(dataToInsert, null, 2));
      console.log('CRITICAL: issue_present =', `"${dataToInsert.issue_present}"`);
      console.log('==========================================');

      console.log('Sending to Supabase...');
      const { data, error } = await supabase
        .from('issues')
        .insert([dataToInsert])
        .select();

      if (error) {
        console.error('!!!!! DATABASE ERROR !!!!!');
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Error details:', error.details);
        console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!');
        throw error;
      }

      console.log('==========================================');
      console.log('✅ SUCCESS! Ticket logged successfully!');
      console.log('Inserted data:', data);
      console.log('==========================================');
      
      alert('✅ Issue logged successfully!');
      
      // Reset form
      setFormData({
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
      
      onRefresh();
    } catch (error) {
      console.error('CATCH BLOCK - Error logging issue:', error);
      alert('❌ Error logging issue: ' + error.message);
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
      {/* SEARCH BAR - NEW FEATURE */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <div className="flex items-center gap-2 mb-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="text-sm font-semibold text-gray-700">Search Issues</h3>
        </div>
        <input
          type="text"
          value={filters.searchText}
          onChange={(e) => handleFilterChange('searchText', e.target.value)}
          placeholder="Search by portfolio, issue details, case number, or monitored by..."
          className="w-full px-4 py-2 border-2 border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
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
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hour Filter</label>
            <select
              value={filters.hourFilter}
              onChange={(e) => handleFilterChange('hourFilter', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
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
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
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
            {/* Log New Issue Row */}
            <tr className="bg-blue-50">
              <td className="px-4 py-3">
                <select
                  name="portfolio_id"
                  value={formData.portfolio_id}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Portfolio</option>
                  {portfolios.map(p => (
                    <option key={p.portfolio_id} value={p.portfolio_id}>{p.name}</option>
                  ))}
                </select>
              </td>
              <td className="px-4 py-3">
                <input
                  type="number"
                  name="issue_hour"
                  value={formData.issue_hour}
                  onChange={handleFormChange}
                  min="0"
                  max="23"
                  className="w-20 px-3 py-2 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </td>
              <td className="px-4 py-3">
                <select
                  name="issue_present"
                  value={formData.issue_present}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </td>
              <td className="px-4 py-3">
                <select
                  name="monitored_by"
                  value={formData.monitored_by}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Monitored By</option>
                  {monitoredPersonnel.map(person => (
                    <option key={person} value={person}>{person}</option>
                  ))}
                </select>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select</option>
                  {monitoredPersonnel.map(person => (
                    <option key={person} value={person}>{person}</option>
                  ))}
                </select>
              </td>
              <td className="px-4 py-3">
                <button
                  onClick={handleSubmit}
                  type="button"
                  className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 font-medium whitespace-nowrap"
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
                      issue.issue_present === 'yes' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {issue.issue_present === 'yes' ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">
                    {issue.issue_details || 'No issue present'}
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
                    <button
                      onClick={() => onEditIssue(issue)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
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
    </div>
  );
};

export default TicketLoggingTable;
