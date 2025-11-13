import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../services/supabaseClient';
import HourlyCoverageChart from './HourlyCoverageChart';
import PerformanceAnalytics from './PerformanceAnalytics';
import IssuesByUser from './IssuesByUser';
import PortfolioMonitoringMatrix from './PortfolioMonitoringMatrix';
import EditIssueModal from './EditIssueModal';
import TicketLoggingTable from './TicketLoggingTable';
import AdminPanel from './AdminPanel';
import AdminLogin from './AdminLogin';

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
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [monitoredPersonnel, setMonitoredPersonnel] = useState([]);
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedPortfolioForAction, setSelectedPortfolioForAction] = useState(null);
  const [activeReservations, setActiveReservations] = useState([]);
  const [interactedPortfolios, setInteractedPortfolios] = useState(new Set());
  const [updatingSitesCheckPortfolio, setUpdatingSitesCheckPortfolio] = useState(null);
  const [sitesCheckError, setSitesCheckError] = useState(null);

  // Load interacted portfolios from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('interactedPortfolios');
    if (stored) {
      setInteractedPortfolios(new Set(JSON.parse(stored)));
    }
  }, []);

  useEffect(() => {
    const checkAdminSession = () => {
      const isAuthenticated = sessionStorage.getItem('adminAuthenticated') === 'true';
      const expiresAtRaw = sessionStorage.getItem('adminAuthExpiresAt');
      const expiresAt = expiresAtRaw ? parseInt(expiresAtRaw, 10) : null;
      if (isAuthenticated && expiresAt && Date.now() > expiresAt) {
        sessionStorage.removeItem('adminAuthenticated');
        sessionStorage.removeItem('adminUsername');
        sessionStorage.removeItem('adminAuthExpiresAt');
        setShowAdminPanel(false);
        setShowAdminLogin(false);
        alert('Admin session expired. Please log in again.');
      }
    };

    const interval = setInterval(checkAdminSession, 60000);
    checkAdminSession();

    return () => clearInterval(interval);
  }, []);

  // Save interacted portfolios to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('interactedPortfolios', JSON.stringify(Array.from(interactedPortfolios)));
  }, [interactedPortfolios]);

  // Default portfolio cards structure (can be overridden by database data)
  const defaultPortfolioCards = [
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

  // Dynamically generate portfolio cards from database
  const portfolioCards = useMemo(() => {
    if (portfolios.length === 0) {
      return defaultPortfolioCards;
    }
    // Create cards from actual database portfolios
    return portfolios.map(p => {
      // Check if portfolio exists in default cards to preserve subtitle
      const defaultCard = defaultPortfolioCards.find(dc => dc.name === p.name);
      return {
        name: p.name,
        subtitle: defaultCard?.subtitle || 'Portfolio'
      };
    });
  }, [portfolios]);

  // Unique color mapping for each portfolio's lock border
  const getPortfolioLockColor = (portfolioName) => {
    const colorMap = {
      'Aurora': 'border-purple-500',
      'BESS & Trimark': 'border-pink-500',
      'Chint': 'border-blue-500',
      'eG/GByte/PD/GPM': 'border-indigo-500',
      'Guarantee Sites': 'border-cyan-500',
      'Intermountain West': 'border-teal-500',
      'KK': 'border-emerald-500',
      'Locus': 'border-lime-500',
      'Main Portfolio': 'border-yellow-500',
      'Mid Atlantic 1': 'border-amber-500',
      'Mid Atlantic 2': 'border-orange-500',
      'Midwest 1': 'border-red-500',
      'Midwest 2': 'border-rose-500',
      'New England 1': 'border-fuchsia-500',
      'New England 2': 'border-violet-500',
      'New England 3': 'border-purple-600',
      'Nor Cal 1': 'border-blue-600',
      'Nor Cal 2': 'border-indigo-600',
      'PLF': 'border-cyan-600',
      'Power Factor': 'border-teal-600',
      'Secondary Portfolio': 'border-emerald-600',
      'So Cal 1': 'border-lime-600',
      'So Cal 2': 'border-yellow-600',
      'So Cal 3': 'border-orange-600',
      'SolarEdge': 'border-red-600',
      'SolrenView': 'border-pink-600'
    };
    return colorMap[portfolioName] || 'border-purple-500'; // Default purple if not found
  };

  useEffect(() => {
    fetchData();
    loadMonitoredPersonnel();
    fetchActiveReservations();
    
    const interval = setInterval(() => {
      setCurrentHour(new Date().getHours());
    }, 60000);
    
    // Poll for active reservations every 3 seconds
    const reservationInterval = setInterval(() => {
      fetchActiveReservations();
    }, 3000);
    
    return () => {
      clearInterval(interval);
      clearInterval(reservationInterval);
    };
  }, []);

  const loadMonitoredPersonnel = async () => {
    try {
      const { data, error } = await supabase
        .from('monitored_personnel')
        .select('name')
        .order('name', { ascending: true });

      if (error) {
        console.warn('Error fetching monitored_personnel from Supabase:', error.message);
        throw error;
      }

      if (data && data.length > 0) {
        setMonitoredPersonnel(data.map(person => person.name));
        return;
      }
    } catch (err) {
      console.warn('Falling back to local monitored personnel list:', err.message);
    }

    const storedUsers = localStorage.getItem('monitoredPersonnel');
    if (storedUsers) {
      setMonitoredPersonnel(JSON.parse(storedUsers));
      return;
    }

    const defaultUsers = [
      'Anjana', 'Anita P', 'Arun V', 'Bharat Gu', 'Deepa L', 
      'jenny', 'Kumar S', 'Lakshmi B', 'Manoj D', 'Rajesh K',
      'Ravi T', 'Vikram N'
    ];
    setMonitoredPersonnel(defaultUsers);
    localStorage.setItem('monitoredPersonnel', JSON.stringify(defaultUsers));
  };

  const findPortfolioRecord = (portfolioName) =>
    portfolios.find(p => p.name === portfolioName);

  const isPortfolioSitesChecked = (portfolioName) => {
    const record = findPortfolioRecord(portfolioName);
    return record?.all_sites_checked === true;
  };

  const updatePortfolioSitesChecked = async (portfolioName, value) => {
    const record = findPortfolioRecord(portfolioName);
    if (!record) return;

    const portfolioId = record.portfolio_id || record.id;
    if (!portfolioId) {
      console.warn('Unable to determine portfolio id for', portfolioName);
      return;
    }

    setSitesCheckError(null);
    setUpdatingSitesCheckPortfolio(portfolioName);

    try {
      const { error } = await supabase
        .from('portfolios')
        .update({
          all_sites_checked: value
        })
        .eq('portfolio_id', portfolioId);

      if (error) {
        throw error;
      }

      setPortfolios(prev =>
        prev.map(p =>
          (p.portfolio_id || p.id) === portfolioId
            ? { ...p, all_sites_checked: value }
            : p
        )
      );
    } catch (err) {
      console.error('Error updating sites checked status in Supabase:', err);
      setSitesCheckError('Failed to update sites status. Please try again.');
    } finally {
      setUpdatingSitesCheckPortfolio(null);
    }
  };

  const selectedPortfolioRecord = selectedPortfolioForAction
    ? findPortfolioRecord(selectedPortfolioForAction)
    : null;
  const selectedPortfolioSitesChecked = selectedPortfolioRecord?.all_sites_checked === true;

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
          created_at: new Date().toISOString(),
          all_sites_checked: false
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

  const fetchActiveReservations = async () => {
    try {
      const { data, error } = await supabase
        .from('hour_reservations')
        .select(`
          *,
          portfolios (
            portfolio_id,
            name
          )
        `)
        .gt('expires_at', new Date().toISOString());
      
      if (error) {
        console.error('Error fetching reservations:', error);
        return;
      }
      
      // Transform data to include portfolio_name at root level
      const transformedData = (data || []).map(r => ({
        ...r,
        portfolio_name: r.portfolios?.name || 'Unknown'
      }));
      
      setActiveReservations(transformedData);
    } catch (error) {
      console.error('Error fetching active reservations:', error);
    }
  };

  const getLatestIssueForPortfolio = (portfolioName) => {
    const portfolioIssues = issues
      .filter(issue => issue.portfolio_name === portfolioName)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return portfolioIssues.length > 0 ? portfolioIssues[0] : null;
  };

  // Get portfolio status for dashboard cards
  const getPortfolioStatus = (portfolioName) => {
    // Check if user is logged in (authenticated)
    const isAuthenticated = sessionStorage.getItem('adminAuthenticated') === 'true';
    
    // If authenticated, show all cards as green
    if (isAuthenticated) {
      return { 
        status: 'Ready to Log', 
        color: 'bg-green-100 border-green-300', 
        textColor: 'text-green-800' 
      };
    }
    
    // Otherwise, show normal status based on activity
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const portfolioIssues = issues.filter(issue => {
      const issueDate = new Date(issue.created_at);
      issueDate.setHours(0, 0, 0, 0);
      return issue.portfolio_name === portfolioName && 
             issueDate.getTime() === today.getTime();
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const sitesConfirmed = isPortfolioSitesChecked(portfolioName);

    if (portfolioIssues.length === 0) {
      return { 
        status: 'No Activity (4h+)', 
        color: 'bg-red-100 border-red-300', 
        textColor: 'text-red-800' 
      };
    }

    // Find the most recent issue
    const latestIssue = portfolioIssues[0];
    const hoursDiff = currentHour - latestIssue.issue_hour;

    if (!sitesConfirmed) {
      return { 
        status: 'Awaiting sites confirmation', 
        color: 'bg-yellow-100 border-yellow-300', 
        textColor: 'text-yellow-800' 
      };
    }

    if (hoursDiff < 1) {
      return { 
        status: 'Updated (<1h)', 
        color: 'bg-green-100 border-green-300', 
        textColor: 'text-green-800' 
      };
    } else if (hoursDiff === 1) {
      return { 
        status: '1h Inactive', 
        color: 'bg-blue-100 border-blue-300', 
        textColor: 'text-blue-800' 
      };
    } else if (hoursDiff === 2) {
      return { 
        status: '2h Inactive', 
        color: 'bg-yellow-200 border-yellow-400', 
        textColor: 'text-yellow-900' 
      };
    } else if (hoursDiff === 3) {
      return { 
        status: '3h Inactive', 
        color: 'bg-orange-200 border-orange-400', 
        textColor: 'text-orange-900' 
      };
    } else {
      return { 
        status: 'No Activity (4h+)', 
        color: 'bg-red-100 border-red-300', 
        textColor: 'text-red-800' 
      };
    }
  };

  // Check if portfolio is currently reserved (locked by someone)
  const getPortfolioReservation = (portfolioName) => {
    const portfolio = portfolios.find(p => p.name === portfolioName);
    if (!portfolio) return null;
    
    // Find reservation for this portfolio and current hour
    return activeReservations.find(r => 
      r.portfolio_name === portfolioName && 
      r.issue_hour === currentHour
    );
  };

  const handlePortfolioClick = (portfolioName) => {
    // Track that this portfolio has been interacted with
    setInteractedPortfolios(prev => new Set([...prev, portfolioName]));
    
    setSelectedPortfolioForAction(portfolioName);
    setShowActionModal(true);
  };

  const handleViewIssues = () => {
    setSelectedPortfolio(selectedPortfolioForAction);
    setShowActionModal(false);
    // Scroll to the selected portfolio issues section
    setTimeout(() => {
      const selectedSection = document.getElementById('selected-portfolio-section');
      if (selectedSection) {
        selectedSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleLogIssue = () => {
    setShowActionModal(false);
    // Scroll to form
    setTimeout(() => {
      const formElement = document.getElementById('issue-log-form');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      // Pre-select the portfolio in the form
      const portfolioToSelect = portfolios.find(p => p.name === selectedPortfolioForAction);
      if (portfolioToSelect) {
        // Trigger a custom event to set the portfolio
        window.dispatchEvent(new CustomEvent('preSelectPortfolio', { 
          detail: { portfolio_id: portfolioToSelect.portfolio_id } 
        }));
      }
    }, 100);
  };

  const handleEditIssue = (issue) => {
    setEditingIssue(issue);
    setShowEditModal(true);
  };

  const handleUpdateIssue = async (updatedIssue) => {
    try {
      // Extract only the database columns (remove portfolio_name, site_name, etc.)
      const {
        portfolio_name,
        site_name,
        ...issueData
      } = updatedIssue;

      // Prepare update data, converting empty strings to null for UUID fields
      const updateData = {
        portfolio_id: issueData.portfolio_id || null,
        site_id: issueData.site_id || null,
        issue_hour: issueData.issue_hour,
        issue_present: issueData.issue_present,
        issue_details: issueData.issue_details,
        case_number: issueData.case_number,
        monitored_by: issueData.monitored_by,
        issues_missed_by: issueData.issues_missed_by,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('issues')
        .update(updateData)
        .eq('issue_id', issueData.issue_id);

      if (error) throw error;

      alert('Issue updated successfully!');
      setShowEditModal(false);
      setEditingIssue(null);
      fetchData();
    } catch (error) {
      console.error('Error updating issue:', error);
      alert('Error updating issue: ' + error.message);
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
    loadMonitoredPersonnel();
    fetchData();
  };

  const handleAdminButtonClick = () => {
    // Always check authentication status from sessionStorage
    const isAuthenticated = sessionStorage.getItem('adminAuthenticated') === 'true';
    const expiresAtRaw = sessionStorage.getItem('adminAuthExpiresAt');
    const expiresAt = expiresAtRaw ? parseInt(expiresAtRaw, 10) : null;
    const isExpired = !expiresAt || Date.now() > expiresAt;

    if (isAuthenticated && !isExpired) {
      setShowAdminPanel(true);
    } else {
      if (isExpired) {
        sessionStorage.removeItem('adminAuthenticated');
        sessionStorage.removeItem('adminUsername');
        sessionStorage.removeItem('adminAuthExpiresAt');
      }
      // Force login if not authenticated
      setShowAdminLogin(true);
    }
  };

  const handleLoginSuccess = () => {
    const expiry = Date.now() + 2 * 60 * 60 * 1000; // 2 hours
    sessionStorage.setItem('adminAuthExpiresAt', String(expiry));
    setShowAdminLogin(false);
    setShowAdminPanel(true);
  };

  const handleLogout = () => {
    // Clear authentication
    sessionStorage.removeItem('adminAuthenticated');
    sessionStorage.removeItem('adminUsername');
    sessionStorage.removeItem('adminAuthExpiresAt');
    setShowAdminPanel(false);
    alert('Logged out successfully');
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
              onClick={handleAdminButtonClick}
              className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 text-sm font-medium transition-colors"
            >
              Admin Panel
            </button>
            <div className="text-center px-4 py-2 rounded" style={{ backgroundColor: '#E8F5E0' }}>
              <div className="text-xs text-gray-600">Current Hour</div>
              <div className="text-2xl font-bold" style={{ color: '#76AB3F' }}>{currentHour}</div>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-[#76AB3F]">
        <div className="max-w-full mx-auto px-6">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-3 px-1 font-medium text-sm text-white hover:bg-[#689E36] ${
                activeTab === 'dashboard' ? 'border-b-2 border-white' : ''
              }`}
            >
              Dashboard & Log Issues
            </button>
            <button
              onClick={() => setActiveTab('performance')}
              className={`py-3 px-1 font-medium text-sm text-white hover:bg-[#689E36] ${
                activeTab === 'performance' ? 'border-b-2 border-white' : ''
              }`}
            >
              Performance Analytics
            </button>
            <button
              onClick={() => setActiveTab('issuesByUser')}
              className={`py-3 px-1 font-medium text-sm text-white hover:bg-[#689E36] ${
                activeTab === 'issuesByUser' ? 'border-b-2 border-white' : ''
              }`}
            >
              Issues by User
            </button>
            <button
              onClick={() => setActiveTab('portfolioMatrix')}
              className={`py-3 px-1 font-medium text-sm text-white hover:bg-[#689E36] ${
                activeTab === 'portfolioMatrix' ? 'border-b-2 border-white' : ''
              }`}
            >
              Coverage Matrix
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
                      <div className="w-3 h-3 bg-orange-200 border border-orange-400 rounded"></div>
                      <span className="text-gray-600">3h</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-200 border border-yellow-400 rounded"></div>
                      <span className="text-gray-600">2h</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
                      <span className="text-gray-600">1h</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
                      <span className="text-gray-600">Updated (&lt;1h)</span>
                    </div>
                  </div>
                  {/* Border Legend */}
                  <div className="flex gap-6 mt-3 text-xs border-t pt-2"></div>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={scrollToForm}
                    className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
                  >
                    <span>+</span> Log New Issue
                  </button>
                  {interactedPortfolios.size > 0 && (
                    <button
                      onClick={() => {
                        setInteractedPortfolios(new Set());
                        localStorage.removeItem('interactedPortfolios');
                      }}
                      className="px-4 py-2 bg-gray-500 text-white rounded text-sm font-medium hover:bg-gray-600 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Reset Borders ({interactedPortfolios.size})
                    </button>
                  )}
                </div>
              </div>

              {/* Portfolio Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {portfolioCards.map((portfolio) => {
                  const status = getPortfolioStatus(portfolio.name);
                  const reservation = getPortfolioReservation(portfolio.name);
                  
                  // Get latest issue for this portfolio to show who logged it
                  const latestIssue = getLatestIssueForPortfolio(portfolio.name);
                  const loggedBy = latestIssue?.monitored_by || 'No data';
                  
                  // Get unique color for this portfolio
                  const uniqueLockColor = getPortfolioLockColor(portfolio.name);
                  
                  // Check if this portfolio has been interacted with
                  const hasBeenInteracted = interactedPortfolios.has(portfolio.name);
                  const sitesConfirmed = isPortfolioSitesChecked(portfolio.name);
                  
                  // Determine card styling based on reservation and interaction
                  let cardColor = status.color;
                  let cardBorder = 'border';
                  let cardTextColor = status.textColor;
                  let displayStatus = status.status;
                  
                  if (reservation) {
                    // Portfolio is LOCKED - show PURPLE BORDER (thick)
                    cardBorder = 'border-[6px] border-purple-600 !border-purple-600';
                    displayStatus = `🔒 Locked by ${reservation.monitored_by}`;
                  } else if (hasBeenInteracted) {
                    // Portfolio has been interacted with but not currently locked - show thinner colored border
                    cardBorder = `border-2 ${uniqueLockColor}`;
                  }
                  
                  return (
                    <div
                      key={portfolio.name}
                      onClick={() => handlePortfolioClick(portfolio.name)}
                      className={`p-3 rounded ${cardColor} ${cardBorder} transition-all hover:shadow-md cursor-pointer relative group`}
                    >
                      <div className="font-semibold text-sm text-gray-900">{portfolio.name}</div>
                      <div className="text-xs text-gray-600 mt-1">{portfolio.subtitle}</div>
                      <div className={`text-xs mt-2 font-medium ${cardTextColor}`}>
                        {displayStatus}
                      </div>
                      <div className="mt-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            sitesConfirmed
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {sitesConfirmed ? 'All sites checked' : 'Sites check pending'}
                        </span>
                      </div>
                      
                      {/* Click indicator - shows on hover */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className={`${reservation ? 'bg-purple-600' : 'bg-blue-500'} text-white px-2 py-1 rounded text-xs font-medium`}>
                          Click for options
                        </div>
                      </div>
                      
                      {/* Hover Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                        {reservation ? (
                          <>
                            🔒 Locked by: <span className="font-bold">{reservation.monitored_by}</span>
                            <br />
                            For Hour: <span className="font-bold">{reservation.issue_hour}</span>
                          </>
                        ) : (
                          <>
                            Logged by: {loggedBy}
                          </>
                        )}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Portfolio Issues */}
            {selectedPortfolio && (
              <div id="selected-portfolio-section" className="bg-white rounded-lg shadow p-6">
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
                                (issue.issue_present || '').toLowerCase() === 'yes' 
                                  ? 'bg-red-100 text-red-800' 
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {(issue.issue_present || '').toLowerCase() === 'yes' ? 'Issue' : 'No Issue'}
                              </span>
                            </div>
                            <div className="text-sm text-gray-900 mb-2">
                              {issue.issue_details || 'No issue'}
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
                          <div className="ml-4 flex gap-2">
                            <button
                              onClick={() => {
                                alert(`📋 Issue Details:\n\nPortfolio: ${issue.portfolio_name}\nHour: ${issue.issue_hour}\nIssue Present: ${(issue.issue_present || '').toLowerCase() === 'yes' ? 'Yes' : 'No'}\nDetails: ${issue.issue_details || 'None'}\nCase #: ${issue.case_number || 'N/A'}\nMonitored By: ${issue.monitored_by || 'N/A'}\nMissed By: ${issue.issues_missed_by || 'N/A'}\nLogged: ${new Date(issue.created_at).toLocaleString()}`);
                              }}
                              className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 flex items-center gap-1"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              View
                            </button>
                            <button
                              onClick={() => handleEditIssue(issue)}
                              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center gap-1"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit
                            </button>
                          </div>
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

        {activeTab === 'portfolioMatrix' && (
          <PortfolioMonitoringMatrix
            issues={issues}
            portfolios={portfolios}
            monitoredPersonnel={monitoredPersonnel}
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

      {/* Admin Login */}
      {showAdminLogin && (
        <AdminLogin onLoginSuccess={handleLoginSuccess} />
      )}

      {/* Portfolio Action Modal */}
      {showActionModal && selectedPortfolioForAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  {selectedPortfolioForAction}
                </h3>
                <button
                  onClick={() => {
                    setShowActionModal(false);
                    setSelectedPortfolioForAction(null);
                    setSitesCheckError(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-6 space-y-4">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">All sites checked?</h4>
                      <p className="text-xs text-gray-600 mt-1">
                        Confirm after you verify every site belonging to this portfolio.
                      </p>
                    </div>
                    <span
                      className={`text-sm font-semibold ${
                        selectedPortfolioSitesChecked ? 'text-green-600' : 'text-yellow-600'
                      }`}
                    >
                      {selectedPortfolioSitesChecked ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => updatePortfolioSitesChecked(selectedPortfolioForAction, true)}
                      disabled={updatingSitesCheckPortfolio === selectedPortfolioForAction}
                      className={`flex-1 px-4 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                        selectedPortfolioSitesChecked
                          ? 'bg-green-600 text-white border-green-600'
                          : 'border-gray-300 text-gray-700 hover:border-green-500 hover:text-green-600'
                      } ${updatingSitesCheckPortfolio === selectedPortfolioForAction ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => updatePortfolioSitesChecked(selectedPortfolioForAction, false)}
                      disabled={updatingSitesCheckPortfolio === selectedPortfolioForAction}
                      className={`flex-1 px-4 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                        selectedPortfolioSitesChecked === false
                          ? 'bg-yellow-500 text-white border-yellow-500'
                          : 'border-gray-300 text-gray-700 hover:border-yellow-500 hover:text-yellow-600'
                      } ${updatingSitesCheckPortfolio === selectedPortfolioForAction ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      No
                    </button>
                  </div>
                  {sitesCheckError && (
                    <div className="mt-3 text-xs text-red-600">
                      {sitesCheckError}
                    </div>
                  )}
                </div>
                <p className="text-gray-600">What would you like to do?</p>
              </div>

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
                      <div className="text-sm text-gray-600">See all logged issues for this portfolio</div>
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
                      <div className="text-sm text-gray-600">Report a new issue for this portfolio</div>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SinglePageComplete;
