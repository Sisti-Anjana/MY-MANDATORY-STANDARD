import React, { useState, useEffect } from 'react';

const EditIssueModal = ({ issue, portfolios, sites, monitoredPersonnel, onClose, onSave }) => {
  // Normalize issue_present to proper case
  const normalizeIssuePresent = (value) => {
    if (!value) return 'No';
    const normalized = value.toString().toLowerCase();
    return normalized === 'yes' ? 'Yes' : 'No';
  };

  const [formData, setFormData] = useState({
    portfolio_id: issue.portfolio_id || '',
    site_id: issue.site_id || '',
    issue_hour: issue.issue_hour || 0,
    issue_present: normalizeIssuePresent(issue.issue_present),
    issue_details: issue.issue_details || '',
    case_number: issue.case_number || '',
    monitored_by: issue.monitored_by || '',
    issues_missed_by: issue.issues_missed_by || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Auto-fill issue details when switching to "No"
    if (name === 'issue_present' && value === 'No') {
      setFormData(prev => ({ ...prev, issue_details: 'No issue' }));
    }
    
    // Clear the auto-fill when switching to "Yes" to allow user input
    if (name === 'issue_present' && value === 'Yes' && formData.issue_details === 'No issue') {
      setFormData(prev => ({ ...prev, issue_details: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate issue_present and issue_details
    const issuePresent = formData.issue_present.toLowerCase();
    
    if (issuePresent === 'yes' && (!formData.issue_details || formData.issue_details.trim() === '')) {
      alert('❌ ERROR: Please provide issue details when issue is present');
      return;
    }
    
    // Convert empty strings to null for UUID fields
    const cleanedData = {
      ...formData,
      site_id: formData.site_id || null,
      portfolio_id: formData.portfolio_id || null,
      issue_present: issuePresent, // Ensure lowercase for database
      issue_details: formData.issue_details.trim() || (issuePresent === 'no' ? 'No issue' : '')
    };
    onSave({ ...issue, ...cleanedData });
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Edit Issue</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio *</label>
              <select
                name="portfolio_id"
                value={formData.portfolio_id}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Portfolio</option>
                {portfolios.map(p => (
                  <option key={p.portfolio_id} value={p.portfolio_id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Site (Optional)</label>
              <select
                name="site_id"
                value={formData.site_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Site (Optional)</option>
                {sites
                  .filter(s => !formData.portfolio_id || s.portfolio_id === formData.portfolio_id)
                  .map(s => (
                    <option key={s.site_id} value={s.site_id}>{s.site_name}</option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Issue Present *</label>
              <select
                name="issue_present"
                value={formData.issue_present}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Issue Details {formData.issue_present === 'Yes' && <span className="text-red-600">*</span>}
              </label>
              <textarea
                name="issue_details"
                value={formData.issue_details}
                onChange={handleChange}
                rows="3"
                required={formData.issue_present === 'Yes'}
                placeholder={formData.issue_present === 'Yes' ? 'Required: Describe the issue...' : 'Optional: Add any notes...'}
                className={`w-full px-3 py-2 border rounded text-sm focus:ring-blue-500 focus:border-blue-500 ${
                  formData.issue_present === 'Yes' && !formData.issue_details.trim() 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300'
                }`}
              />
              {formData.issue_present === 'Yes' && !formData.issue_details.trim() && (
                <p className="mt-1 text-xs text-red-600">⚠️ Issue details are required when an issue is present</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Case Number (Optional)</label>
                <input
                  type="text"
                  name="case_number"
                  value={formData.case_number}
                  onChange={handleChange}
                  placeholder="Enter case number..."
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monitored By *</label>
                <select
                  name="monitored_by"
                  value={formData.monitored_by}
                  onChange={handleChange}
                  required
                  disabled
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded text-sm bg-gray-100 cursor-not-allowed"
                  title="Monitored By cannot be changed when editing issues"
                >
                  <option value={formData.monitored_by}>{formData.monitored_by || '⚠️ REQUIRED - Select Monitor'}</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">⚠️ Monitored By is fixed and cannot be changed when editing</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Issues Missed By (Optional)</label>
              <select
                name="issues_missed_by"
                value={formData.issues_missed_by}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Issues Missed By (Optional)</option>
                {monitoredPersonnel.map(person => (
                  <option key={person} value={person}>{person}</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                Update Issue
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditIssueModal;
