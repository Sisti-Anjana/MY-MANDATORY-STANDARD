import React, { useState, useEffect } from 'react';

const EditIssueModal = ({ issue, portfolios, sites, monitoredPersonnel, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    portfolio_id: issue.portfolio_id || '',
    site_id: issue.site_id || '',
    issue_hour: issue.issue_hour || 0,
    issue_present: issue.issue_present || 'No',
    issue_details: issue.issue_details || '',
    case_number: issue.case_number || '',
    monitored_by: issue.monitored_by || '',
    issues_missed_by: issue.issues_missed_by || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'issue_present' && value === 'No') {
      setFormData(prev => ({ ...prev, issue_details: 'No issue present' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...issue, ...formData });
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Issue Details</label>
              <textarea
                name="issue_details"
                value={formData.issue_details}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
              />
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Monitored By (Optional)</label>
                <select
                  name="monitored_by"
                  value={formData.monitored_by}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Monitored By (Optional)</option>
                  {monitoredPersonnel.map(person => (
                    <option key={person} value={person}>{person}</option>
                  ))}
                </select>
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
