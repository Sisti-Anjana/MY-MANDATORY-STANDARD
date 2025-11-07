import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import HourlyCoverageChart from './HourlyCoverageChart';
import PerformanceAnalytics from './PerformanceAnalytics';
import IssuesByUser from './IssuesByUser';
import EditIssueModal from './EditIssueModal';
import TicketLoggingTable from './TicketLoggingTable';
import AdminPanel from './AdminPanel';

const SinglePageComplete = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [portfolios, setPortfolios] = useState([]);
  const [issues, setIssues] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentHour, setCurrentHour] = useState(new Date().getHours());
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingIssue, setEditingIssue] = useState(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [monitoredPersonnel, setMonitoredPersonnel] = useState([]);

  // Portfolio cards data
  const portfolioCards = [
    { name: 'Aurora', subtitle: 'Aurora' },
    { name: 'BESS & Trimark', subtitle: 'Multi Das' },
    { name: 'Chint', subtitle: 'Chint' },
    { name: 'eG/GByte/PD/GPM', subtitle: 'Multiple DAS' },
    { name: 'Guarantee Sites', subtitle: 'Powertrack' },
    { name: 'Intermountain West', subtitle: 'Powertrack' },
    { name: 'KK', subtitle: 'Powertrack' },
    { name: 'Locus', subtitle: 'Locus' },
    { name: 'Main Portfolio', subtitle: 'Powertrack' },
    { name: 'Mid Atlantic 1', subtitle: 'Powertrack' },
    { name: 'Mid Atlantic 2', subtitle: 'Powertrack' },
    { name: 'Midwest 1', subtitle: 'Powertrack' },
    { name: 'Midwest 2', subtitle: 'Powertrack' },
    { name: 'New England 1', subtitle: 'Powertrack' },
    { name: 'New England 2', subtitle: 'Powertrack' },
    { name: 'New England 3', subtitle: 'Powertrack' },
    { name: 'Nor Cal 1', subtitle: 'Powertrack' },
    { name: 'Nor Cal 2', subtitle: 'Powertrack' },
    { name: 'PLF', subtitle: 'Powertrack' },
    { name: 'Power Factor', subtitle: 'Power Factor' },
    { name: 'Secondary Portfolio', subtitle: 'Powertrack' },
    { name: 'So Cal 1', subtitle: 'Powertrack' },
    { name: 'So Cal 2', subtitle: 'Powertrack' },
    { name: 'So Cal 3', subtitle: 'Powertrack' },
    { name: 'SolarEdge', subtitle: 'SolarEdge' },
    { name: 'SolrenView', subtitle: 'Solrenview' }
  ];

  useEffect(() => {
    fetchData();
    loadMonitoredPersonnel();
    const interval = setInterval(() => {
      setCurrentHour(new Date().getHours());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadMonitoredPersonnel = () => {
    const storedUsers = localStorage.getItem('monitoredPersonnel');
    if (storedUsers) {
      setMonitoredPersonnel(JSON.parse(storedUsers));
    } else {
      const defaultUsers = [
        'Anjana', 'Anita P', 'Arun V', 'Bharat Gu', 'Deepa L', 
        'jenny', 'Kumar S', 'Lakshmi B', 'Manoj D', 'Rajesh K',
        'Ravi T', 'Vikram N'
      ];
      setMonitoredPersonnel(defaultUsers);
      localStorage.setItem('monitoredPersonnel', JSON.stringify(defaultUsers));
    }
  };

  const autoInsertPortfolios = async () => {
    console.log('🔧 Auto-inserting portfolios to database...');
    try {
      const portfoliosToInsert = portfolioCards.map(p => ({ name: p.name }));
      const { data, error } = await supabase
        .from('portfolios')
        .insert(portfoliosToInsert)
        .select();
      
      if (error) {
        console.error('❌ Error auto-inserting portfolios:', error);
      } else {
        console.log('✅ Successfully inserted', data.length, 'portfolios');
        // Refresh data
        fetchData();
      }
    } catch (error) {
      console.error('❌ Unexpected error auto-inserting portfolios:', error);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch portfolios
      const { data: portfoliosData, error: portfoliosError } = await supabase
        .from('portfolios')
        .select('*')
        .order('name');
      
      if (portfoliosError) {
        console.error('❌ Error fetching portfolios:', portfoliosError);
        // Use hardcoded portfolios as fallback
        const hardcodedPortfolios = portfolioCards.map((p, index) => ({
          portfolio_id: `temp-${index}`,
          name: p.name,
          created_at: new Date().toISOString()
        }));
        setPortfolios(hardcodedPortfolios);
        console.log('✅ Using hardcoded portfolios as fallback:', hardcodedPortfolios.length);
      } else {
        console.log('✅ Fetched portfolios from database:', portfoliosData?.length || 0);
        if (!portfoliosData || portfoliosData.length === 0) {
          console.warn('⚠️ Database portfolios table is empty. Auto-inserting...');
          // Automatically insert portfolios
          await autoInsertPortfolios();
        } else {
          setPortfolios(portfoliosData);
        }
      }

      // Fetch sites
      const { data: sitesData, error: sitesError } = await supabase
        .from('sites')
        .select('*');
        // .order('site_name');  // Temporarily disabled - column may not exist
      
      if (sitesError) throw sitesError;
      setSites(sitesData || []);

      // Fetch issues with portfolio names
      const { data: issuesData, error: issuesError } = await supabase
        .from('issues')
        .select(`
          *,
          portfolios (
            portfolio_id,
            name
          )
        `)
        .order('created_at', { ascending: false });
      
      if (issuesError) throw issuesError;
      
      // Transform the data to include portfolio_name at root level
      const transformedIssues = (issuesData || []).map(issue => ({
        ...issue,
        portfolio_name: issue.portfolios?.name || 'Unknown'
      }));
      
      setIssues(transformedIssues);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get portfolio status for dashboard cards
  const getPortfolioStatus = (portfolioName) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const portfolioIssues = issues.filter(issue => {
      const issueDate = new Date(issue.created_at);
      issueDate.setHours(0, 0, 0, 0);
      return issue.portfolio_name === portfolioName && 
             issueDate.getTime() === today.getTime();
    });

    if (portfolioIssues.length === 0) {
      return { 
        status: 'No Activity (4h+)', 
        color: 'bg-red-50 border-red-200', 
        textColor: 'text-red-700' 
      };
    }

    // Find the most recent issue
    const latestIssue = portfolioIssues[0];
    const hoursDiff = currentHour - latestIssue.issue_hour;

    if (hoursDiff < 1) {
      return { 
        status: 'Updated (<1h)', 
        color: 'bg-green-50 border-green-200', 
        textColor: 'text-green-700' 
      };
    } else if (hoursDiff === 1) {
      return { 
        status: '1h Inactive', 
        color: 'bg-blue-50 border-blue-200', 
        textColor: 'text-blue-700' 
      };
    } else if (hoursDiff === 2) {
      return { 
        status: '2h Inactive', 
        color: 'bg-yellow-100 border-yellow-300', 
        textColor: 'text-yellow-800' 
      };
    } else if (hoursDiff === 3) {
      return { 
        status: '3h Inactive', 
        color: 'bg-orange-100 border-orange-300', 
        textColor: 'text-orange-800' 
      };
    } else {
      return { 
        status: 'No Activity (4h+)', 
        color: 'bg-red-50 border-red-200', 
        textColor: 'text-red-700' 
      };
    }
  };

  const handlePortfolioClick = (portfolioName) => {
    setSelectedPortfolio(portfolioName);
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const handleEditIssue = (issue) => {
    setEditingIssue(issue);
    setShowEditModal(true);
  };

  const handleUpdateIssue = async (updatedIssue) => {
    try {
      const { error } = await supabase
        .from('issues')
        .update({
          ...updatedIssue,
          updated_at: new Date().toISOString()
        })
        .eq('issue_id', updatedIssue.issue_id);

      if (error) throw error;

      alert('✅ Issue updated successfully!');
      setShowEditModal(false);
      setEditingIssue(null);
      fetchData();
    } catch (error) {
      console.error('Error updating issue:', error);
      alert('❌ Error updating issue: ' + error.message);
    }
  };

  const scrollToForm = () => {
    const formElement = document.getElementById('issue-log-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleAdminPanelClose = () => {
    setShowAdminPanel(false);
    loadMonitoredPersonnel();  // Reload personnel after admin panel closes
    fetchData();  // Reload all data
  };

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
            <button 
              onClick={() => setShowAdminPanel(true)}
              className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 text-sm font-medium"
            >
              ⚙️ Admin Panel
            </button>
            <div className="text-center bg-blue-50 px-4 py-2 rounded">
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
              onClick={() => setActiveTab('issuesByUser')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'issuesByUser'
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
                      onClick={() => handlePortfolioClick(portfolio.name)}
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

            {/* Selected Portfolio Issues */}
            {selectedPortfolio && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Issues for: {selectedPortfolio}
                  </h2>
                  <button
                    onClick={() => setSelectedPortfolio(null)}
                    className="text-blue-600 text-sm hover:text-blue-800"
                  >
                    Clear Selection ✕
                  </button>
                </div>
                <div className="text-sm text-gray-600 mb-4">
                  Found {issues.filter(i => i.portfolio_name === selectedPortfolio).length} issues
                </div>
                <div className="space-y-4">
                  {issues
                    .filter(i => i.portfolio_name === selectedPortfolio)
                    .map((issue) => (
                      <div key={issue.issue_id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-2">
                              <span className="bg-gray-100 px-2 py-1 rounded text-sm font-medium">
                                Hour {issue.issue_hour}
                              </span>
                              <span className={`px-2 py-1 rounded text-sm font-semibold ${
                                issue.issue_present === 'Yes' 
                                  ? 'bg-red-100 text-red-800' 
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {issue.issue_present === 'Yes' ? 'Issue' : 'No Issue'}
                              </span>
                            </div>
                            <div className="text-sm text-gray-900 mb-2">
                              {issue.issue_details || 'No issue present'}
                            </div>
                            <div className="flex gap-4 text-xs text-gray-600">
                              {issue.case_number && (
                                <span>📋 Case: {issue.case_number}</span>
                              )}
                              {issue.monitored_by && (
                                <span>👤 Monitored: {issue.monitored_by}</span>
                              )}
                              {issue.issues_missed_by && (
                                <span className="text-orange-600">⚠ Missed: {issue.issues_missed_by}</span>
                              )}
                              <span>🕒 {new Date(issue.created_at).toLocaleString()}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleEditIssue(issue)}
                            className="ml-4 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                          >
                            ✎ Edit
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Ticket Logging Table */}
            <div id="issue-log-form">
              <TicketLoggingTable
                issues={issues}
                portfolios={portfolios}
                sites={sites}
                monitoredPersonnel={monitoredPersonnel}
                currentHour={currentHour}
                onRefresh={fetchData}
                onEditIssue={handleEditIssue}
              />
            </div>

            {/* Hourly Coverage Analysis */}
            <HourlyCoverageChart issues={issues} />
          </div>
        )}

        {activeTab === 'performance' && (
          <PerformanceAnalytics issues={issues} portfolios={portfolios} />
        )}

        {activeTab === 'issuesByUser' && (
          <IssuesByUser 
            issues={issues} 
            portfolios={portfolios}
            monitoredPersonnel={monitoredPersonnel}
            onEditIssue={handleEditIssue}
          />
        )}
      </main>

      {/* Edit Issue Modal */}
      {showEditModal && editingIssue && (
        <EditIssueModal
          issue={editingIssue}
          portfolios={portfolios}
          sites={sites}
          monitoredPersonnel={monitoredPersonnel}
          onClose={() => {
            setShowEditModal(false);
            setEditingIssue(null);
          }}
          onSave={handleUpdateIssue}
        />
      )}

      {/* Admin Panel */}
      {showAdminPanel && (
        <AdminPanel onClose={handleAdminPanelClose} />
      )}
    </div>
  );
};

export default SinglePageComplete;
