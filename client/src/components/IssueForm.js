import React, { useState, useEffect } from 'react';
import { portfoliosAPI, issuesAPI, reservationAPI } from '../services/api';
import { convertToEST } from '../utils/dateUtils';

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
  const [reservation, setReservation] = useState(null);
  const [reservationError, setReservationError] = useState(null);
  const [allReservations, setAllReservations] = useState([]);
  const [checkingReservation, setCheckingReservation] = useState(false);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchPortfolios = async () => {
      try {
        const response = await portfoliosAPI.getAll();
        console.log('📦 Fetched portfolios:', response.data);
        if (response.data.length > 0) {
          console.log('🔑 First portfolio fields:', Object.keys(response.data[0]));
          console.log('📋 First portfolio:', response.data[0]);
        }
        setPortfolios(response.data);
      } catch (error) {
        console.error('Error fetching portfolios:', error);
      }
    };

    // Fetch users from localStorage
    const fetchUsers = () => {
      const storedUsers = localStorage.getItem('monitoredPersonnel');
      let usersList = [];

      if (storedUsers) {
        usersList = JSON.parse(storedUsers);
      } else {
        // Default users if none exist
        usersList = [
          'Anjana', 'Anita P', 'Arun V', 'Bharat Gu', 'Deepa L',
          'jenny', 'Kumar S', 'Lakshmi B', 'Manoj D', 'Rajesh K',
          'Ravi T', 'Vikram N'
        ];
      }

      // CRITICAL FIX: Add logged-in user to the list if not present
      const loggedInUser = sessionStorage.getItem('username') ||
        sessionStorage.getItem('fullName');

      if (loggedInUser && !usersList.includes(loggedInUser)) {
        console.log('✅ Adding logged-in user to monitored personnel list:', loggedInUser);
        usersList.unshift(loggedInUser); // Add to beginning of list
      }

      setUsers(usersList);
    };

    // AUTO-POPULATE MONITORED_BY WITH LOGGED-IN USER
    const autoSetMonitoredBy = () => {
      // Get logged-in user from sessionStorage
      const loggedInUser = sessionStorage.getItem('username') ||
        sessionStorage.getItem('fullName') ||
        'LibsysAdmin'; // Fallback default

      console.log('👤 Auto-setting monitored_by to:', loggedInUser);

      // Set the monitored_by field automatically
      setFormData(prev => ({
        ...prev,
        monitored_by: loggedInUser
      }));
    };

    fetchPortfolios();
    fetchUsers();
    autoSetMonitoredBy(); // Automatically set the logged-in user
  }, []);

  // FIX 1: Reset form fields when portfolio changes (but preserve monitored_by)
  const [prevPortfolioId, setPrevPortfolioId] = useState('');

  useEffect(() => {
    // Only reset if portfolio actually changed (not initial load)
    if (formData.portfolio_id && formData.portfolio_id !== prevPortfolioId && prevPortfolioId !== '') {
      console.log('Portfolio changed from', prevPortfolioId, 'to', formData.portfolio_id);

      // Get logged-in user to preserve
      const loggedInUser = sessionStorage.getItem('username') ||
        sessionStorage.getItem('fullName') ||
        'LibsysAdmin';

      setFormData(prev => ({
        ...prev,
        monitored_by: loggedInUser, // Preserve logged-in user
        issue_hour: '',
        issue_present: '',
        issue_details: '',
        case_number: '',
        issues_missed_by: ''
      }));
      setReservation(null);
      setReservationError(null);
    }
    setPrevPortfolioId(formData.portfolio_id);
  }, [formData.portfolio_id]);

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

  // Effect to handle reservation when portfolio, hour, and monitored_by are all selected
  useEffect(() => {
    const createReservation = async () => {
      const { portfolio_id, issue_hour, monitored_by } = formData;

      if (portfolio_id && issue_hour !== '' && monitored_by) {
        try {
          setReservationError(null);
          setCheckingReservation(true);

          // First check if it's reserved
          const checkResponse = await reservationAPI.check(portfolio_id, issue_hour, monitored_by);

          if (checkResponse.data.reserved && !checkResponse.data.is_yours) {
            setReservationError('This slot is currently reserved by another user');
            alert('This portfolio/hour/monitor combination is currently being used by another user. Please select a different combination.');
            return;
          }

          // Create/update reservation
          const response = await reservationAPI.reserve({
            portfolio_id,
            issue_hour: parseInt(issue_hour),
            monitored_by
          });
          setReservation(response.data);
          console.log('Reservation created:', response.data);
        } catch (error) {
          console.error('Reservation error:', error);
          setReservationError(error.message);
          // Show alert if someone else has reserved this
          if (error.message.includes('already reserved')) {
            alert('This portfolio/hour/monitor combination is currently being used by another user. Please select a different combination.');
          }
        } finally {
          setCheckingReservation(false);
        }
      }
    };

    createReservation();
  }, [formData.portfolio_id, formData.issue_hour, formData.monitored_by]);

  // Effect to check if the current combination is available
  useEffect(() => {
    const checkAvailability = async () => {
      const { portfolio_id, issue_hour, monitored_by } = formData;

      if (portfolio_id && issue_hour !== '' && monitored_by) {
        try {
          const response = await reservationAPI.check(portfolio_id, issue_hour, monitored_by);
          if (response.data.reserved && !response.data.is_yours) {
            setReservationError('Currently reserved by another user');
          }
        } catch (error) {
          console.error('Error checking reservation:', error);
        }
      }
    };

    // Check every 5 seconds
    const interval = setInterval(checkAvailability, 5000);
    return () => clearInterval(interval);
  }, [formData.portfolio_id, formData.issue_hour, formData.monitored_by]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // DEBUG: Log what we're about to submit
      console.log('🚀 Submitting issue with data:', formData);
      console.log('📋 Portfolio ID being submitted:', formData.portfolio_id);

      const response = await issuesAPI.create(formData);
      console.log('✅ Issue created successfully:', response);
      console.log('💾 Saved issue data:', response.data);

      setSubmitted(true);

      // Clear reservation state
      setReservation(null);
      setReservationError(null);

      // Get logged-in user to preserve after reset
      const loggedInUser = sessionStorage.getItem('username') ||
        sessionStorage.getItem('fullName') ||
        'LibsysAdmin';

      setFormData({
        portfolio_id: '',
        issue_hour: '',
        issue_present: '',
        issue_details: '',
        case_number: '',
        monitored_by: loggedInUser, // Keep logged-in user selected
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
    setReservation(null);
    setReservationError(null);

    // Get logged-in user to preserve after reset
    const loggedInUser = sessionStorage.getItem('username') ||
      sessionStorage.getItem('fullName') ||
      'LibsysAdmin';

    setFormData({
      portfolio_id: '',
      issue_hour: '',
      issue_present: '',
      issue_details: '',
      case_number: '',
      monitored_by: loggedInUser, // Keep logged-in user selected
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
                {portfolios.map(portfolio => {
                  // FIX: Use portfolio_id from Supabase instead of id
                  const portfolioId = portfolio.portfolio_id || portfolio.id;
                  return (
                    <option key={portfolioId} value={portfolioId}>
                      {portfolio.name}
                    </option>
                  );
                })}
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
                Monitored By <span className="text-red-500">*</span>
                {checkingReservation && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                    <svg className="animate-spin h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Checking...
                  </span>
                )}
                {reservation && !checkingReservation && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Reserved for You
                  </span>
                )}
                {reservationError && !checkingReservation && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    In Use
                  </span>
                )}
              </label>
              <select
                id="monitored_by"
                name="monitored_by"
                value={formData.monitored_by}
                onChange={handleChange}
                required
                disabled={checkingReservation}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">Select Monitor</option>
                {users.map(user => (
                  <option key={user} value={user}>
                    {user}
                  </option>
                ))}
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
                value={convertToEST(new Date()).toLocaleString('en-US', { timeZone: 'America/New_York' })}
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
                {users.map(user => (
                  <option key={user} value={user}>
                    {user}
                  </option>
                ))}
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
