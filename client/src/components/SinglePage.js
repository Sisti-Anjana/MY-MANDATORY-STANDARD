import React, { useState, useEffect } from 'react';
import { portfoliosAPI, issuesAPI } from '../services/api';

const SinglePage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [portfolios, setPortfolios] = useState([]);
  const [issues, setIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentHour, setCurrentHour] = useState(new Date().getHours());
  
  // Form state
  const [formData, setFormData] = useState({
    portfolio_id: '',
    issue_hour: '',
    issue_present: '',
    issue_details: '',
    case_number: '',
    monitored_by: '',
    issues_missed_by: ''
  });

  // Filter state for table view
  const [filters, setFilters] = useState({
    portfolio: '',
    hour: '',    issuePresent: '',
    dateFilter: ''
  });

  useEffect(() => {
    fetchData();
    // Update current hour every minute
    const interval = setInterval(() => {
      setCurrentHour(new Date().getHours());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, issues]);

  const fetchData = async () => {
    try {
      const [portfoliosRes, issuesRes] = await Promise.all([
        portfoliosAPI.getAll(),
        issuesAPI.getAll()
      ]);
      setPortfolios(portfoliosRes.data);
      setIssues(issuesRes.data);
      setFilteredIssues(issuesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...issues];

    if (filters.portfolio) {
      filtered = filtered.filter(i => i.portfolio_name === filters.portfolio);
    }
    if (filters.hour) {
      filtered = filtered.filter(i => i.issue_hour.toString() === filters.hour);
    }
    if (filters.issuePresent) {
      filtered = filtered.filter(i => i.issue_present === filters.issuePresent);
    }
    
    setFilteredIssues(filtered);
  };

  // Get portfolio status for dashboard
  const getPortfolioStatus = (portfolioName) => {
    const today = new Date().toDateString();
    const portfolioIssues = issues.filter(issue => 
      issue.portfolio_name === portfolioName &&
      new Date(issue.created_at).toDateString() === today
    );

    if (portfolioIssues.length === 0) {
      return { status: 'No Activity (4h+)', color: 'bg-red-50 border-red-200', textColor: 'text-red-700' };
    }

    const latestIssue = portfolioIssues[0];
    const hoursDiff = currentHour - latestIssue.issue_hour;

    if (hoursDiff < 1) {
      return { status: 'Updated (<1h)', color: 'bg-green-50 border-green-200', textColor: 'text-green-700' };
    } else if (hoursDiff < 2) {
      return { status: '1h', color: 'bg-blue-50 border-blue-200', textColor: 'text-blue-700' };
    } else if (hoursDiff < 3) {
      return { status: '2h Inactive', color: 'bg-yellow-100 border-yellow-300', textColor: 'text-yellow-800' };
    } else if (hoursDiff < 4) {
      return { status: '3h Inactive', color: 'bg-orange-100 border-orange-300', textColor: 'text-orange-800' };
    } else {
      return { status: 'No Activity (4h+)', color: 'bg-red-50 border-red-200', textColor: 'text-red-700' };
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'issue_present' && value === 'No') {
      setFormData(prev => ({ ...prev, issue_details: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await issuesAPI.create(formData);
      alert('Issue logged successfully!');
      setFormData({
        portfolio_id: '',
        issue_hour: '',
        issue_present: '',
        issue_details: '',
        case_number: '',
        monitored_by: '',
        issues_missed_by: ''
      });
      fetchData();
    } catch (error) {
      alert('Error logging issue: ' + error.message);
    }
  };

  const scrollToForm = () => {
    const formElement = document.getElementById('issue-log-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Portfolio cards data
  const portfolioCards = [
    { name: 'Aurora', subtitle: 'Aurora', order: 1 },
    { name: 'BESS & Trimark', subtitle: 'Multi Das', order: 2 },
    { name: 'Chint', subtitle: 'Chint', order: 3 },
    { name: 'eG/GByte/PD/GPM', subtitle: 'Multiple DAS', order: 4 },
    { name: 'Guarantee Sites', subtitle: 'Powertrack', order: 5 },
    { name: 'Intermountain West', subtitle: 'Powertrack', order: 6 },
    { name: 'KK', subtitle: 'Powertrack', order: 7 },
    { name: 'Locus', subtitle: 'Locus', order: 8 },
    { name: 'Main Portfolio', subtitle: 'Powertrack', order: 9 },
    { name: 'Mid Atlantic 1', subtitle: 'Powertrack', order: 10 },
    { name: 'Mid Atlantic 2', subtitle: 'Powertrack', order: 11 },
    { name: 'Midwest 1', subtitle: 'Powertrack', order: 12 },
    { name: 'Midwest 2', subtitle: 'Powertrack', order: 13 },
    { name: 'New England 1', subtitle: 'Powertrack', order: 14 },
    { name: 'New England 2', subtitle: 'Powertrack', order: 15 },
    { name: 'New England 3', subtitle: 'Powertrack', order: 16 },
    { name: 'Nor Cal 1', subtitle: 'Powertrack', order: 17 },
    { name: 'Nor Cal 2', subtitle: 'Powertrack', order: 18 },
    { name: 'PLF', subtitle: 'Powertrack', order: 19 },
    { name: 'Power Factor', subtitle: 'Power Factor', order: 20 },
    { name: 'Secondary Portfolio', subtitle: 'Powertrack', order: 21 },
    { name: 'So Cal 1', subtitle: 'Powertrack', order: 22 },
    { name: 'So Cal 2', subtitle: 'Powertrack', order: 23 },
    { name: 'So Cal 3', subtitle: 'Powertrack', order: 24 },
    { name: 'SolarEdge', subtitle: 'SolarEdge', order: 25 },
    { name: 'SolrenView', subtitle: 'Solrenview', order: 26 }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-full mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Portfolio Issue Tracker</h1>
            <p className="text-sm text-gray-600 mt-1">Complete issue tracking and analysis system</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 text-sm">
              Admin Panel
            </button>
            <div className="text-center">
              <div className="text-xs text-gray-600">Current Hour</div>
              <div className="text-2xl font-bold text-blue-600">{currentHour}</div>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-full mx-auto px-6">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'dashboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
              }`}
            >
              Dashboard & Log Issues
            </button>
            <button
              onClick={() => setActiveTab('performance')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'performance'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
              }`}
            >
              Performance Analytics
            </button>
            <button
              onClick={() => setActiveTab('issues')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'issues'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
              }`}
            >
              Issues by User
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-full mx-auto px-6 py-6">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Quick Portfolio Reference Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Quick Portfolio Reference</h2>
                  <div className="flex gap-6 mt-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
                      <span className="text-gray-600">No Activity (4h+)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-orange-100 border border-orange-300 rounded"></div>
                      <span className="text-gray-600">3h</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded"></div>
                      <span className="text-gray-600">2h</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-50 border border-blue-300 rounded"></div>
                      <span className="text-gray-600">1h</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
                      <span className="text-gray-600">Updated (&lt;1h)</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={scrollToForm}
                  className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
                >
                  <span>+</span> Log New Issue
                </button>
              </div>

              {/* Portfolio Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {portfolioCards.map((portfolio) => {
                  const status = getPortfolioStatus(portfolio.name);
                  return (
                    <div
                      key={portfolio.name}
                      className={`p-3 rounded border ${status.color} transition-all hover:shadow-md cursor-pointer`}
                    >
                      <div className="font-semibold text-sm text-gray-900">{portfolio.name}</div>
                      <div className="text-xs text-gray-600 mt-1">{portfolio.subtitle}</div>
                      <div className={`text-xs mt-2 font-medium ${status.textColor}`}>
                        {status.status}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Issue Log Form */}
            <div id="issue-log-form" className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Log New Issue</h2>
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio</label>
                    <select
                      name="portfolio_id"
                      value={formData.portfolio_id}
                      onChange={handleFormChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Portfolio</option>
                      {portfolios.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hour</label>
                    <select
                      name="issue_hour"
                      value={formData.issue_hour}
                      onChange={handleFormChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Hour</option>
                      {hours.map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Case #</label>
                    <input
                      type="text"
                      name="case_number"
                      value={formData.case_number}
                      onChange={handleFormChange}
                      placeholder="Case #"
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Monitored By</label>
                    <select
                      name="monitored_by"
                      value={formData.monitored_by}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Monitor</option>
                      <option value="Kumar S">Kumar S</option>
                      <option value="Rajesh K">Rajesh K</option>
                      <option value="Bharat Gu">Bharat Gu</option>
                      <option value="Anita P">Anita P</option>
                      <option value="Lakshmi B">Lakshmi B</option>
                      <option value="Arun V">Arun V</option>
                      <option value="Anjana">Anjana</option>
                      <option value="jenny">jenny</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Issue Present</label>
                  <div className="flex gap-6">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="issue_present"
                        value="Yes"
                        checked={formData.issue_present === 'Yes'}
                        onChange={handleFormChange}
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
                        onChange={handleFormChange}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm font-medium text-white bg-green-400 px-3 py-1 rounded">No</span>
                    </label>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Issue Description</label>
                  <input
                    type="text"
                    name="issue_details"
                    value={formData.issue_details}
                    onChange={handleFormChange}
                    disabled={formData.issue_present !== 'Yes'}
                    placeholder={formData.issue_present === 'Yes' ? 'Describe the issue' : 'Select issue present first'}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  />
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date/Time</label>
                    <input
                      type="text"
                      value={new Date().toLocaleString()}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm bg-gray-100 text-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Issues Missed By</label>
                    <select
                      name="issues_missed_by"
                      value={formData.issues_missed_by}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select</option>
                      <option value="Lakshmi B">Lakshmi B</option>
                      <option value="Kumar S">Kumar S</option>
                      <option value="Rajesh K">Rajesh K</option>
                      <option value="Bharat Gu">Bharat Gu</option>
                      <option value="Anita P">Anita P</option>
                      <option value="Arun V">Arun V</option>
                      <option value="Anjana">Anjana</option>
                    </select>
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-gray-700 text-white rounded text-sm hover:bg-gray-800"
                  >
                    Log Ticket
                  </button>
                </div>
              </form>
            </div>

            {/* Hourly Coverage Analysis */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Hourly Coverage Analysis</h2>
              <p className="text-sm text-gray-600 mb-4">Portfolio risk distribution analysis based on temporal coverage theory</p>
              {/* Add chart component here if needed */}
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Analytics</h2>
            <p className="text-gray-600">Performance metrics and analytics coming soon...</p>
          </div>
        )}

        {activeTab === 'issues' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Portfolio</label>
                  <select
                    value={filters.portfolio}
                    onChange={(e) => setFilters({...filters, portfolio: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Portfolios</option>
                    {portfolios.map(p => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hour</label>
                  <select
                    value={filters.hour}
                    onChange={(e) => setFilters({...filters, hour: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Hours</option>
                    {hours.map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Issue Present</label>
                  <input
                    type="text"
                    placeholder="Select issue present first"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Case #</label>
                  <input
                    type="text"
                    placeholder="Case #"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Monitor</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Monitors</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 mt-4">
                <input
                  type="text"
                  placeholder="06/11/2025, 13:3"
                  className="px-3 py-2 border border-gray-300 rounded text-sm"
                />
                <select className="px-3 py-2 border border-gray-300 rounded text-sm">
                  <option>Select</option>
                </select>
                <button
                  onClick={() => setFilters({ portfolio: '', hour: '', issuePresent: '', dateFilter: '' })}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
                >
                  Log Ticket
                </button>
              </div>
            </div>

            {/* Issues Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Portfolio</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Hour</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Issue Present</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Issue Description</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Case #</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Monitored By</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Date/Time</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Issues Missed By</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredIssues.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                          No issues found
                        </td>
                      </tr>
                    ) : (
                      filteredIssues.map((issue) => (
                        <tr key={issue.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">{issue.portfolio_name}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{issue.issue_hour}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${
                              (issue.issue_present || '').toLowerCase() === 'yes' 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {(issue.issue_present || '').toLowerCase() === 'yes' ? 'Yes' : 'No'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">
                            {issue.issue_details || 'No issue'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">{issue.case_number || '-'}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{issue.monitored_by || '-'}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {new Date(issue.created_at).toLocaleString('en-US', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">{issue.issues_missed_by || '-'}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded">
                              ✓ Logged
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SinglePage;
