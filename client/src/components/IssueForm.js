import React, { useState, useEffect } from 'react';
import { portfoliosAPI, issuesAPI } from '../services/api';

const IssueForm = () => {
  const [formData, setFormData] = useState({
    portfolio_id: '',
    issue_hour: '',
    issue_present: '',
    issue_details: '',
    case_number: '',
    monitored_by: '',
    issues_missed_by: ''
  });
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchPortfolios = async () => {
      try {
        const response = await portfoliosAPI.getAll();
        setPortfolios(response.data);
      } catch (error) {
        console.error('Error fetching portfolios:', error);
      }
    };

    fetchPortfolios();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear issue details when issue_present changes to "No"
    if (name === 'issue_present' && value === 'No') {
      setFormData(prev => ({
        ...prev,
        issue_details: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await issuesAPI.create(formData);
      console.log('Issue created successfully:', response);
      setSubmitted(true);
      setFormData({
        portfolio_id: '',
        issue_hour: '',
        issue_present: '',
        issue_details: '',
        case_number: '',
        monitored_by: '',
        issues_missed_by: ''
      });
    } catch (error) {
      console.error('Error creating issue:', error);
      const errorMessage = error.message || 'Unknown error occurred';
      alert(`Error creating issue: ${errorMessage}. Please check your connection and try again.`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setFormData({
      portfolio_id: '',
      issue_hour: '',
      issue_present: '',
      issue_details: '',
      case_number: '',
      monitored_by: '',
      issues_missed_by: ''
    });
  };

  // Generate hours array (0-23)
  const hours = Array.from({ length: 24 }, (_, i) => i);

  if (submitted) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Issue Successfully Logged!
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>Your issue has been recorded with a timestamp. Thank you for reporting it.</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={resetForm}
                  className="bg-green-100 text-green-800 px-3 py-2 rounded-md text-sm font-medium hover:bg-green-200"
                >
                  Log Another Issue
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Log New Issue</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Portfolio Dropdown */}
            <div>
              <label htmlFor="portfolio_id" className="block text-sm font-medium text-gray-700 mb-1">
                Portfolio
              </label>
              <select
                id="portfolio_id"
                name="portfolio_id"
                value={formData.portfolio_id}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">Select Portfolio</option>
                {portfolios.map(portfolio => (
                  <option key={portfolio.id} value={portfolio.id}>
                    {portfolio.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Hour Dropdown */}
            <div>
              <label htmlFor="issue_hour" className="block text-sm font-medium text-gray-700 mb-1">
                Hour
              </label>
              <select
                id="issue_hour"
                name="issue_hour"
                value={formData.issue_hour}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">All Hours</option>
                {hours.map(hour => (
                  <option key={hour} value={hour}>
                    {hour}
                  </option>
                ))}
              </select>
            </div>

            {/* Case Number */}
            <div>
              <label htmlFor="case_number" className="block text-sm font-medium text-gray-700 mb-1">
                Case #
              </label>
              <input
                type="text"
                id="case_number"
                name="case_number"
                value={formData.case_number}
                onChange={handleChange}
                placeholder="Case #"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>

            {/* Monitored By */}
            <div>
              <label htmlFor="monitored_by" className="block text-sm font-medium text-gray-700 mb-1">
                Monitored By
              </label>
              <select
                id="monitored_by"
                name="monitored_by"
                value={formData.monitored_by}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">Select Monitor</option>
                <option value="Kumar S">Kumar S</option>
                <option value="Rajesh K">Rajesh K</option>
                <option value="Bharat Gu">Bharat Gu</option>
                <option value="Anita P">Anita P</option>
                <option value="Deepa L">Deepa L</option>
                <option value="Manoj D">Manoj D</option>
                <option value="Vikram N">Vikram N</option>
                <option value="Ravi T">Ravi T</option>
                <option value="Lakshmi B">Lakshmi B</option>
              </select>
            </div>
          </div>

          {/* Issue Present Radio Buttons */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Issue Present
            </label>
            <div className="flex gap-6">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="issue_present"
                  value="Yes"
                  checked={formData.issue_present === 'Yes'}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm font-medium text-white bg-red-400 px-3 py-1 rounded">Yes</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="issue_present"
                  value="No"
                  checked={formData.issue_present === 'No'}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">No</span>
              </label>
            </div>
          </div>

          {/* Issue Description - Enabled only when Yes is selected */}
          <div className="mt-6">
            <label htmlFor="issue_details" className="block text-sm font-medium text-gray-700 mb-1">
              Issue Description
            </label>
            <input
              type="text"
              id="issue_details"
              name="issue_details"
              value={formData.issue_details}
              onChange={handleChange}
              disabled={formData.issue_present !== 'Yes'}
              placeholder={formData.issue_present === 'Yes' ? 'Select issue present first' : 'Select issue present first'}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* Date/Time and Issues Missed By */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date/Time - Auto-filled */}
            <div>
              <label htmlFor="date_time" className="block text-sm font-medium text-gray-700 mb-1">
                Date/Time
              </label>
              <input
                type="text"
                id="date_time"
                value={new Date().toLocaleString()}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-600 text-sm"
              />
            </div>

            {/* Issues Missed By */}
            <div>
              <label htmlFor="issues_missed_by" className="block text-sm font-medium text-gray-700 mb-1">
                Issues Missed By
              </label>
              <select
                id="issues_missed_by"
                name="issues_missed_by"
                value={formData.issues_missed_by}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">Select</option>
                <option value="Lakshmi B">Lakshmi B</option>
                <option value="Deepa L">Deepa L</option>
                <option value="Manoj D">Manoj D</option>
                <option value="Vikram N">Vikram N</option>
                <option value="Anita P">Anita P</option>
                <option value="Ravi T">Ravi T</option>
                <option value="Kumar S">Kumar S</option>
                <option value="Rajesh K">Rajesh K</option>
                <option value="Bharat Gu">Bharat Gu</option>
                <option value="BXJBSA">BXJBSA</option>
                <option value="utfzytf">utfzytf</option>
                <option value="76tyjtv">76tyjtv</option>
                <option value="HJVXHASV">HJVXHASV</option>
                <option value="kinny">kinny</option>
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-gray-700 text-white px-6 py-2 rounded text-sm font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging...' : 'Log Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IssueForm;
