import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import PortfolioMonitoringMatrix from './PortfolioMonitoringMatrix';

const AdminPanel = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('portfolios');
  const [portfolios, setPortfolios] = useState([]);
  const [users, setUsers] = useState([]);
  const [loginUsers, setLoginUsers] = useState([]);
  const [editingLoginUser, setEditingLoginUser] = useState(null);
  const [editLoginUsername, setEditLoginUsername] = useState('');
  const [editLoginFullName, setEditLoginFullName] = useState('');
  const [editLoginRole, setEditLoginRole] = useState('user');
  const [editLoginActive, setEditLoginActive] = useState(true);
  const [editLoginPassword, setEditLoginPassword] = useState('');
  const [adminLogs, setAdminLogs] = useState([]);
  const [issues, setIssues] = useState([]);
  const [activeLocks, setActiveLocks] = useState([]);
  const [showExpiredLocks, setShowExpiredLocks] = useState(false);
  const [newPortfolioName, setNewPortfolioName] = useState('');
  const [newPortfolioSubtitle, setNewPortfolioSubtitle] = useState('');
  const [newPortfolioSiteRange, setNewPortfolioSiteRange] = useState('');
  const [editingPortfolio, setEditingPortfolio] = useState(null);
  const [editPortfolioName, setEditPortfolioName] = useState('');
  const [editPortfolioSubtitle, setEditPortfolioSubtitle] = useState('');
  const [editPortfolioSiteRange, setEditPortfolioSiteRange] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newLoginUsername, setNewLoginUsername] = useState('');
  const [newLoginPassword, setNewLoginPassword] = useState('');
  const [newLoginFullName, setNewLoginFullName] = useState('');
  const [newLoginRole, setNewLoginRole] = useState('user');
  const [newLogNote, setNewLogNote] = useState('');
  const [adminName, setAdminName] = useState('Admin');
  const [loading, setLoading] = useState(false);

  // Authentication check - redirect if not authenticated
  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem('adminAuthenticated') === 'true';
    if (!isAuthenticated) {
      alert('Unauthorized access! Please login first.');
      onClose();
      return;
    }
    
    const username = sessionStorage.getItem('adminUsername');
    if (username) {
      setAdminName(username);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch portfolios
      const { data: portfoliosData, error: portfoliosError } = await supabase
        .from('portfolios')
        .select('*')
        .order('name');
      
      if (portfoliosError) throw portfoliosError;
      setPortfolios(portfoliosData || []);

      // Fetch issues with portfolio names for Coverage Matrix
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
      
      if (issuesError) {
        console.error('Error fetching issues:', issuesError);
      } else {
        // Transform the data to include portfolio_name at root level
        const transformedIssues = (issuesData || []).map(issue => ({
          ...issue,
          portfolio_name: issue.portfolios?.name || 'Unknown'
        }));
        setIssues(transformedIssues);
      }

      // Fetch login users
      const { data: loginUsersData, error: loginUsersError } = await supabase
        .from('users')
        .select('*')
        .order('username');
      
      if (loginUsersError) {
        console.error('Error fetching login users:', loginUsersError);
      } else {
        setLoginUsers(loginUsersData || []);
      }

      // Fetch admin logs
      const { data: logsData, error: logsError } = await supabase
        .from('admin_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (logsError) {
        console.error('Error fetching admin logs:', logsError);
        // Don't throw error if table doesn't exist yet
      } else {
        setAdminLogs(logsData || []);
      }

      // Fetch active locks/reservations (or all if showExpiredLocks is true)
      let locksQuery = supabase
        .from('hour_reservations')
        .select(`
          *,
          portfolios (
            portfolio_id,
            name
          )
        `);
      
      // Only filter by expiration if not showing expired locks
      if (!showExpiredLocks) {
        locksQuery = locksQuery.gt('expires_at', new Date().toISOString());
      }
      
      const { data: locksData, error: locksError } = await locksQuery
        .order('reserved_at', { ascending: false })
        .limit(100); // Limit to 100 most recent
      
      if (locksError) {
        console.error('Error fetching active locks:', locksError);
      } else {
        // Transform data to include portfolio_name at root level
        const transformedLocks = (locksData || []).map(lock => ({
          ...lock,
          portfolio_name: lock.portfolios?.name || 'Unknown'
        }));
        setActiveLocks(transformedLocks);
      }

      // Load monitored personnel from Supabase with localStorage fallback
      try {
        const { data: personnelData, error: personnelError } = await supabase
          .from('monitored_personnel')
          .select('*')
          .order('name', { ascending: true });

        if (personnelError) {
          throw personnelError;
        }

        if (personnelData && personnelData.length > 0) {
          setUsers(personnelData);
          localStorage.setItem('monitoredPersonnel', JSON.stringify(personnelData.map(person => person.name)));
        } else {
          const storedUsers = localStorage.getItem('monitoredPersonnel');
          if (storedUsers) {
            const parsed = JSON.parse(storedUsers);
            setUsers(parsed.map((name, index) => ({ id: `local-${index}`, name, role: 'monitor' })));
          }
        }
      } catch (err) {
        console.warn('Error fetching monitored personnel from Supabase, using local storage fallback:', err.message);
        const storedUsers = localStorage.getItem('monitoredPersonnel');
        if (storedUsers) {
          const parsed = JSON.parse(storedUsers);
          setUsers(parsed.map((name, index) => ({ id: `local-${index}`, name, role: 'monitor' })));
        } else {
          const defaultUsers = [
            'Anjana', 'Anita P', 'Arun V', 'Bharat Gu', 'Deepa L', 
            'jenny', 'Kumar S', 'Lakshmi B', 'Manoj D', 'Rajesh K',
            'Ravi T', 'Vikram N'
          ];
          setUsers(defaultUsers.map((name, index) => ({ id: `default-${index}`, name, role: 'monitor' })));
          localStorage.setItem('monitoredPersonnel', JSON.stringify(defaultUsers));
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Error fetching data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const addAdminLog = async (actionType, description, portfolioId = null) => {
    try {
      await supabase.from('admin_logs').insert([{
        admin_name: adminName,
        action_type: actionType,
        action_description: description,
        related_portfolio_id: portfolioId
      }]);
      fetchData(); // Refresh logs
    } catch (error) {
      console.error('Error adding admin log:', error);
    }
  };

  const handleUnlockPortfolio = async (lockId, portfolioName, monitoredBy, portfolioId) => {
    if (!window.confirm(`Are you sure you want to unlock this portfolio?\n\nPortfolio: ${portfolioName}\nLocked by: ${monitoredBy}\n\nThis will allow other users to lock this portfolio and log issues.`)) {
      return;
    }

    setLoading(true);
    try {
      // CRITICAL: Delete the reservation by ID
      const { error, data } = await supabase
        .from('hour_reservations')
        .delete()
        .eq('id', lockId)
        .select(); // Select to verify deletion

      if (error) {
        throw error;
      }

      console.log('✅ Portfolio unlocked:', {
        lockId,
        portfolioName,
        deleted: data
      });

      // Log the unlock action
      await addAdminLog(
        'portfolio_unlocked',
        `Unlocked portfolio "${portfolioName}" that was locked by ${monitoredBy}. Users can now lock and log issues.`,
        portfolioId || null
      );

      // Refresh locks list immediately
      await fetchData();
      
      // Dispatch a custom event to notify other components (like SinglePageComplete) to refresh
      window.dispatchEvent(new CustomEvent('portfolioUnlocked', {
        detail: { portfolioId, portfolioName }
      }));

      alert(`✅ Portfolio "${portfolioName}" unlocked successfully!\n\nUsers can now lock this portfolio and log issues.`);
    } catch (error) {
      console.error('❌ Error unlocking portfolio:', error);
      alert('❌ Error unlocking portfolio: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddPortfolio = async () => {
    if (!newPortfolioName.trim()) {
      alert('Please enter a portfolio name');
      return;
    }

    // FIX 3: Check for duplicate portfolio names
    const duplicatePortfolio = portfolios.find(
      p => p.name.toLowerCase() === newPortfolioName.trim().toLowerCase()
    );
    
    if (duplicatePortfolio) {
      alert('❌ Portfolio name already exists! Please choose a different name.');
      return;
    }

    setLoading(true);
    try {
      const insertData = { name: newPortfolioName.trim() };
      if (newPortfolioSubtitle.trim()) {
        insertData.subtitle = newPortfolioSubtitle.trim();
      }
      if (newPortfolioSiteRange.trim()) {
        insertData.site_range = newPortfolioSiteRange.trim();
      }
      
      const { data, error } = await supabase
        .from('portfolios')
        .insert([insertData])
        .select();

      if (error) {
        // Check if error is about missing subtitle column
        if (error.message && error.message.includes("subtitle") && error.message.includes("schema cache")) {
          // Try inserting without subtitle
          const insertDataWithoutSubtitle = { name: newPortfolioName.trim() };
          const { data: retryData, error: retryError } = await supabase
            .from('portfolios')
            .insert([insertDataWithoutSubtitle])
            .select();
          
          if (retryError) throw retryError;
          
          alert('⚠️ Portfolio added, but subtitle was not saved because the "subtitle" column is missing.\n\nPlease run this SQL in Supabase SQL Editor:\n\nALTER TABLE portfolios ADD COLUMN IF NOT EXISTS subtitle VARCHAR(100);');
          await addAdminLog('portfolio_added', `Added portfolio: ${newPortfolioName.trim()}`, retryData[0].portfolio_id);
          setNewPortfolioName('');
          setNewPortfolioSubtitle('');
          fetchData();
          return;
        }
        throw error;
      }

      await addAdminLog('portfolio_added', `Added portfolio: ${newPortfolioName.trim()}`, data[0].portfolio_id);
      alert('✅ Portfolio added successfully!');
      setNewPortfolioName('');
      setNewPortfolioSubtitle('');
      setNewPortfolioSiteRange('');
      fetchData();
    } catch (error) {
      console.error('Error adding portfolio:', error);
      alert('❌ Error adding portfolio: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePortfolio = async () => {
    if (!editingPortfolio) return;
    if (!editPortfolioName.trim()) {
      alert('Please enter a portfolio name');
      return;
    }

    setLoading(true);
    try {
      const updateData = { name: editPortfolioName.trim() };
      if (editPortfolioSubtitle.trim()) {
        updateData.subtitle = editPortfolioSubtitle.trim();
      } else {
        updateData.subtitle = null;
      }
      if (editPortfolioSiteRange.trim()) {
        updateData.site_range = editPortfolioSiteRange.trim();
      } else {
        updateData.site_range = null;
      }

      const { error } = await supabase
        .from('portfolios')
        .update(updateData)
        .eq('portfolio_id', editingPortfolio.portfolio_id);

      if (error) {
        // Check if error is about missing subtitle column
        if (error.message && error.message.includes("subtitle") && error.message.includes("schema cache")) {
          alert('❌ Error: The "subtitle" column is missing in your Supabase database.\n\nPlease run the SQL migration in your Supabase SQL Editor:\n\nALTER TABLE portfolios ADD COLUMN IF NOT EXISTS subtitle VARCHAR(100);\n\nOr check the ADD_SUBTITLE_COLUMN.sql file in your project.');
          throw error;
        }
        throw error;
      }

      await addAdminLog('portfolio_updated', `Updated portfolio: ${editPortfolioName.trim()}`);
      alert('✅ Portfolio updated successfully!');
      setEditingPortfolio(null);
      setEditPortfolioName('');
      setEditPortfolioSubtitle('');
      setEditPortfolioSiteRange('');
      fetchData();
    } catch (error) {
      console.error('Error updating portfolio:', error);
      if (!error.message.includes('subtitle')) {
        alert('❌ Error updating portfolio: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePortfolio = async (portfolioId, portfolioName) => {
    if (!window.confirm(`Are you sure you want to delete portfolio "${portfolioName}"? This will also delete all associated issues.`)) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('portfolios')
        .delete()
        .eq('portfolio_id', portfolioId);

      if (error) throw error;

      await addAdminLog('portfolio_deleted', `Deleted portfolio: ${portfolioName}`, portfolioId);
      alert('✅ Portfolio deleted successfully!');
      fetchData();
    } catch (error) {
      console.error('Error deleting portfolio:', error);
      alert('❌ Error deleting portfolio: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!newUserName.trim()) {
      alert('Please enter a user name');
      return;
    }

    if (users.some(user => user.name.toLowerCase() === newUserName.trim().toLowerCase())) {
      alert('User already exists');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('monitored_personnel')
        .insert([{ name: newUserName.trim(), role: 'monitor' }])
        .select();

      if (error) throw error;

      const inserted = data && data[0] ? data[0] : null;
      if (inserted) {
        setUsers(prev => [...prev, inserted].sort((a, b) => a.name.localeCompare(b.name)));
        localStorage.setItem('monitoredPersonnel', JSON.stringify([...users.map(u => u.name), inserted.name]));
        addAdminLog('user_added', `Added user: ${inserted.name}`);
      }
      setNewUserName('');
      alert('✅ User added successfully!');
    } catch (error) {
      console.error('Error adding user:', error);
      alert('❌ Error adding user: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const ensureMonitorRecord = async (name) => {
    const normalizedName = (name || '').trim();
    if (!normalizedName) return;

    const exists = users.some(
      user => user.name?.toLowerCase() === normalizedName.toLowerCase()
    );

    if (exists) {
      // Ensure localStorage stays in sync without duplicates
      const uniqueNames = Array.from(new Set(users.map(user => user.name)));
      if (!uniqueNames.includes(normalizedName)) {
        uniqueNames.push(normalizedName);
        localStorage.setItem('monitoredPersonnel', JSON.stringify(uniqueNames));
      }
      return;
    }

    try {
      const { data, error } = await supabase
        .from('monitored_personnel')
        .insert([{ name: normalizedName, role: 'monitor' }])
        .select();

      if (error) {
        // Ignore duplicate errors quietly
        console.warn('Error ensuring monitor record:', error.message);
        return;
      }

      if (data && data[0]) {
        setUsers(prev => {
          const updated = [...prev, data[0]].sort((a, b) => a.name.localeCompare(b.name));
          localStorage.setItem('monitoredPersonnel', JSON.stringify(updated.map(user => user.name)));
          return updated;
        });
        addAdminLog('user_added', `Auto-added monitor: ${normalizedName}`);
      }
    } catch (err) {
      console.error('Unexpected error ensuring monitor record:', err);
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Are you sure you want to delete user "${user.name}"?`)) {
      return;
    }

    setLoading(true);
    try {
      if (user.id && !String(user.id).startsWith('local-') && !String(user.id).startsWith('default-')) {
        const { error } = await supabase
          .from('monitored_personnel')
          .delete()
          .eq('id', user.id);

        if (error) throw error;
      }

      const updatedUsers = users.filter(u => u.id !== user.id);
      setUsers(updatedUsers);
      localStorage.setItem('monitoredPersonnel', JSON.stringify(updatedUsers.map(u => u.name)));
      addAdminLog('user_deleted', `Deleted user: ${user.name}`);
      alert('✅ User deleted successfully!');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('❌ Error deleting user: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLoginUser = async () => {
    if (!newLoginUsername.trim()) {
      alert('Please enter a username');
      return;
    }
    if (!newLoginPassword.trim()) {
      alert('Please enter a password');
      return;
    }
    if (newLoginPassword.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    // Check for duplicate username
    const duplicateUser = loginUsers.find(
      u => u.username.toLowerCase() === newLoginUsername.trim().toLowerCase()
    );
    
    if (duplicateUser) {
      alert('❌ Username already exists! Please choose a different username.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([{
          username: newLoginUsername.trim(),
          password_hash: newLoginPassword.trim(), // In production, use bcrypt
          full_name: newLoginFullName.trim() || newLoginUsername.trim(),
          role: newLoginRole,
          is_active: true
        }])
        .select();

      if (error) throw error;

      await addAdminLog('login_user_added', `Added login user: ${newLoginUsername.trim()} (${newLoginRole})`);
      const monitorName = newLoginFullName.trim() || newLoginUsername.trim();
      await ensureMonitorRecord(monitorName);
      alert(`✅ Login user created successfully!\n\nUsername: ${newLoginUsername}\nPassword: ${newLoginPassword}\n\nPlease share these credentials securely with the user.`);
      setNewLoginUsername('');
      setNewLoginPassword('');
      setNewLoginFullName('');
      setNewLoginRole('user');
      fetchData();
    } catch (error) {
      console.error('Error adding login user:', error);
      alert('❌ Error adding login user: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_active: !currentStatus })
        .eq('user_id', userId);

      if (error) throw error;

      await addAdminLog('user_status_changed', `Changed user status to ${!currentStatus ? 'active' : 'inactive'}`);
      alert('✅ User status updated successfully!');
      fetchData();
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('❌ Error updating user status: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLoginUser = async (userId, username) => {
    if (!window.confirm(`Are you sure you want to delete login user "${username}"? This will permanently remove their access.`)) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      await addAdminLog('login_user_deleted', `Deleted login user: ${username}`);
      alert('✅ Login user deleted successfully!');
      fetchData();
    } catch (error) {
      console.error('Error deleting login user:', error);
      alert('❌ Error deleting login user: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const openEditLoginUser = (user) => {
    setEditingLoginUser(user);
    setEditLoginUsername(user.username || '');
    setEditLoginFullName(user.full_name || '');
    setEditLoginRole(user.role || 'user');
    setEditLoginActive(user.is_active !== false);
    setEditLoginPassword(''); // optional new password
  };

  const handleUpdateLoginUser = async () => {
    if (!editingLoginUser) return;
    if (!editLoginUsername.trim()) {
      alert('Please enter a username');
      return;
    }
    // Prevent duplicate username (other users)
    const duplicate = loginUsers.find(
      u => u.user_id !== editingLoginUser.user_id && u.username?.toLowerCase() === editLoginUsername.trim().toLowerCase()
    );
    if (duplicate) {
      alert('❌ Username already exists. Choose a different username.');
      return;
    }

    setLoading(true);
    try {
      const updatePayload = {
        username: editLoginUsername.trim(),
        full_name: editLoginFullName.trim() || editLoginUsername.trim(),
        role: editLoginRole,
        is_active: editLoginActive
      };
      if (editLoginPassword.trim()) {
        if (editLoginPassword.trim().length < 6) {
          alert('Password must be at least 6 characters long');
          setLoading(false);
          return;
        }
        updatePayload.password_hash = editLoginPassword.trim();
      }

      const { error } = await supabase
        .from('users')
        .update(updatePayload)
        .eq('user_id', editingLoginUser.user_id);

      if (error) throw error;

      await addAdminLog('login_user_updated', `Updated login user: ${editLoginUsername.trim()}`);
      alert('✅ Login user updated successfully!');
      setEditingLoginUser(null);
      setEditLoginPassword('');
      fetchData();
    } catch (error) {
      console.error('Error updating login user:', error);
      alert('❌ Error updating login user: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLog = async () => {
    if (!newLogNote.trim()) {
      alert('Please enter a log note');
      return;
    }

    setLoading(true);
    try {
      await addAdminLog('custom_note', newLogNote.trim());
      alert('✅ Log added successfully!');
      setNewLogNote('');
    } catch (error) {
      console.error('Error adding log:', error);
      alert('❌ Error adding log: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // Clear authentication
    sessionStorage.removeItem('adminAuthenticated');
    sessionStorage.removeItem('adminUsername');
    alert('Logged out successfully!');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-green-700 to-green-800">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white">Admin Panel</h2>
              <p className="text-green-100 text-sm mt-1">
                Logged in as: <span className="font-semibold">{adminName}</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium transition-colors"
              >
                Logout
              </button>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-300 text-3xl font-bold leading-none"
              >
                ×
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b bg-gray-50">
          <div className="flex gap-4 px-6">
            <button
              onClick={() => setActiveTab('portfolios')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'portfolios'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Portfolios ({portfolios.length})
            </button>
            <button
              onClick={() => setActiveTab('loginUsers')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'loginUsers'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Login Users ({loginUsers.length})
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Monitored By / Missed By Users ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('locks')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'locks'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Active Locks ({activeLocks.length})
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'logs'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Admin Logs ({adminLogs.length})
            </button>
            <button
              onClick={() => setActiveTab('coverageMatrix')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'coverageMatrix'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Coverage Matrix
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          {!loading && activeTab === 'portfolios' && (
            <div className="space-y-6">
              {/* Add Portfolio Section */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Add New Portfolio</h3>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newPortfolioName}
                      onChange={(e) => setNewPortfolioName(e.target.value)}
                      placeholder="Enter portfolio name"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddPortfolio()}
                    />
                    <button
                      onClick={handleAddPortfolio}
                      className="px-6 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700"
                    >
                      Add Portfolio
                    </button>
                  </div>
                  <input
                    type="text"
                    value={newPortfolioSubtitle}
                    onChange={(e) => setNewPortfolioSubtitle(e.target.value)}
                    placeholder="Enter subtitle (optional, e.g., 'Powertrack', 'SolarEdge')"
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddPortfolio()}
                  />
                  <input
                    type="text"
                    value={newPortfolioSiteRange}
                    onChange={(e) => setNewPortfolioSiteRange(e.target.value)}
                    placeholder="Enter site range (optional, e.g., 'Sites 1-50', 'Sites 1-100')"
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddPortfolio()}
                  />
                </div>
              </div>

              {/* Edit Portfolio Modal */}
              {editingPortfolio && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Edit Portfolio</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Portfolio Name *
                        </label>
                        <input
                          type="text"
                          value={editPortfolioName}
                          onChange={(e) => setEditPortfolioName(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Subtitle (optional)
                        </label>
                        <input
                          type="text"
                          value={editPortfolioSubtitle}
                          onChange={(e) => setEditPortfolioSubtitle(e.target.value)}
                          placeholder="e.g., Powertrack, SolarEdge, Locus"
                          className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Site Range (optional)
                        </label>
                        <input
                          type="text"
                          value={editPortfolioSiteRange}
                          onChange={(e) => setEditPortfolioSiteRange(e.target.value)}
                          placeholder="e.g., Sites 1-50, Sites 1-100"
                          className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div className="flex gap-3 justify-end">
                        <button
                          onClick={() => {
                            setEditingPortfolio(null);
                            setEditPortfolioName('');
                            setEditPortfolioSubtitle('');
                            setEditPortfolioSiteRange('');
                          }}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 font-medium"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleUpdatePortfolio}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Portfolios List */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Existing Portfolios</h3>
                <div className="space-y-2">
                  {portfolios.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No portfolios found</p>
                  ) : (
                    portfolios.map((portfolio) => (
                      <div
                        key={portfolio.portfolio_id}
                        className="flex justify-between items-center p-4 bg-gray-50 rounded border hover:bg-gray-100"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{portfolio.name}</div>
                          {portfolio.subtitle && (
                            <div className="text-sm text-gray-600 mt-1">Subtitle: {portfolio.subtitle}</div>
                          )}
                          {portfolio.site_range && (
                            <div className="text-sm text-blue-600 mt-1">Site Range: {portfolio.site_range}</div>
                          )}
                          <div className="text-xs text-gray-500 mt-1">
                            ID: {portfolio.portfolio_id}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingPortfolio(portfolio);
                              setEditPortfolioName(portfolio.name);
                              setEditPortfolioSubtitle(portfolio.subtitle || '');
                              setEditPortfolioSiteRange(portfolio.site_range || '');
                            }}
                            className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 font-medium text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeletePortfolio(portfolio.portfolio_id, portfolio.name)}
                            className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 font-medium text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {!loading && activeTab === 'loginUsers' && (
            <div className="space-y-6">
              {/* Add Login User Section */}
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Create New Login User</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Create login credentials for users who need access to the system. Share the credentials securely after creation.
                </p>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Username *
                      </label>
                      <input
                        type="text"
                        value={newLoginUsername}
                        onChange={(e) => setNewLoginUsername(e.target.value)}
                        placeholder="e.g., john.smith"
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Password * (min 6 chars)
                      </label>
                      <input
                        type="text"
                        value={newLoginPassword}
                        onChange={(e) => setNewLoginPassword(e.target.value)}
                        placeholder="Enter secure password"
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={newLoginFullName}
                        onChange={(e) => setNewLoginFullName(e.target.value)}
                        placeholder="e.g., John Smith"
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Role
                      </label>
                      <select
                        value={newLoginRole}
                        onChange={(e) => setNewLoginRole(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>
                  <button
                    onClick={handleAddLoginUser}
                    className="px-6 py-2 bg-green-600 text-white rounded font-medium hover:bg-green-700"
                  >
                    Create Login User
                  </button>
                </div>
              </div>

              {/* Login Users List */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Existing Login Users</h3>
                <div className="space-y-2">
                  {loginUsers.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No login users found. Create one above to get started.</p>
                  ) : (
                    loginUsers.map((user) => (
                      <div
                        key={user.user_id}
                        className="flex justify-between items-center p-4 bg-gray-50 rounded border hover:bg-gray-100"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className="font-medium text-gray-900">{user.username}</div>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${
                              user.role === 'admin'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {user.role.toUpperCase()}
                            </span>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${
                              user.is_active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {user.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 mt-1">{user.full_name || 'No name provided'}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            Last login: {user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}
                          </div>
                          {(user.username || user.password_hash) && (
                            <div className="mt-2">
                              <label className="text-xs font-semibold text-gray-600 mb-1 block">
                                Credentials (copy & share securely)
                              </label>
                              <textarea
                                readOnly
                                value={`Username: ${user.username || ''}\nPassword: ${user.password_hash || 'N/A'}`}
                                className="w-full text-sm font-mono bg-gray-900 text-green-200 rounded border border-gray-700 px-3 py-2 focus:outline-none"
                                rows={2}
                                onFocus={(e) => e.target.select()}
                              />
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditLoginUser(user)}
                            className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 font-medium text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleToggleUserStatus(user.user_id, user.is_active)}
                            className={`px-4 py-2 rounded font-medium text-sm ${
                              user.is_active
                                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {user.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDeleteLoginUser(user.user_id, user.username)}
                            className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 font-medium text-sm"
                            disabled={user.username === 'admin'}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {!loading && activeTab === 'users' && (
            <div className="space-y-6">
              {/* Add User Section */}
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Add New User</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Users added here will appear in "Monitored By" and "Issues Missed By" dropdowns
                </p>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="Enter user name"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddUser()}
                  />
                  <button
                    onClick={handleAddUser}
                    className="px-6 py-2 bg-green-600 text-white rounded font-medium hover:bg-green-700"
                  >
                    Add User
                  </button>
                </div>
              </div>

              {/* Users List */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Existing Users</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {users.length === 0 ? (
                    <p className="text-gray-500 text-center py-8 col-span-2">No users found</p>
                  ) : (
                    users.map((user) => (
                      <div
                        key={user.id || user.name}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded border hover:bg-gray-100"
                      >
                        <div>
                          <div className="font-medium text-gray-900">{user.name}</div>
                          {user.role && (
                            <div className="text-xs text-gray-500 mt-0.5">{user.role}</div>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {!loading && activeTab === 'locks' && (
            <div className="space-y-6">
              <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">
                      🔒 {showExpiredLocks ? 'All Portfolio Locks' : 'Active Portfolio Locks'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {showExpiredLocks 
                        ? 'View all portfolio locks (including expired). You can unlock any portfolio if needed.'
                        : 'View and manage all active portfolio locks. You can unlock any portfolio if needed.'}
                    </p>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showExpiredLocks}
                      onChange={(e) => {
                        setShowExpiredLocks(e.target.checked);
                        fetchData(); // Refresh data when toggling
                      }}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">Show expired locks</span>
                  </label>
                </div>
              </div>

              {activeLocks.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <p className="mt-4 text-gray-500 font-medium">No active locks</p>
                  <p className="mt-2 text-sm text-gray-400">All portfolios are currently unlocked.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          Portfolio
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          Locked By
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          Hour
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          Locked At
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          Expires At
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {activeLocks.map((lock) => (
                        <tr key={lock.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {lock.portfolio_name || 'Unknown'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {lock.monitored_by || 'Unknown'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            Hour {lock.issue_hour}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {new Date(lock.reserved_at).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className={`${new Date(lock.expires_at) < new Date() ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                              {new Date(lock.expires_at).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                              {new Date(lock.expires_at) < new Date() && (
                                <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">Expired</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {new Date(lock.expires_at) >= new Date() ? (
                              <button
                                onClick={() => handleUnlockPortfolio(lock.id, lock.portfolio_name, lock.monitored_by, lock.portfolio_id)}
                                className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 transition-colors"
                              >
                                🔓 Unlock
                              </button>
                            ) : (
                              <span className="text-xs text-gray-400">Expired</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {!loading && activeTab === 'logs' && (
            <div className="space-y-6">
              {/* Add Admin Log Section */}
              <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Add Admin Log</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Admin Name
                    </label>
                    <input
                      type="text"
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Log Note
                    </label>
                    <textarea
                      value={newLogNote}
                      onChange={(e) => setNewLogNote(e.target.value)}
                      placeholder="Enter important note or activity log..."
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  <button
                    onClick={handleAddLog}
                    className="px-6 py-2 bg-purple-600 text-white rounded font-medium hover:bg-purple-700"
                  >
                    Add Log
                  </button>
                </div>
              </div>

              {/* Admin Logs List */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Activity Logs</h3>
                <div className="space-y-2">
                  {adminLogs.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No logs found. Run the ADMIN_LOG_SETUP.sql first.</p>
                  ) : (
                    adminLogs.map((log) => (
                      <div
                        key={log.log_id}
                        className="p-4 bg-gray-50 rounded border hover:bg-gray-100"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${
                                log.action_type === 'portfolio_added' || log.action_type === 'user_added'
                                  ? 'bg-green-100 text-green-800'
                                  : log.action_type === 'portfolio_deleted' || log.action_type === 'user_deleted'
                                  ? 'bg-red-100 text-red-800'
                                  : log.action_type === 'system_alert'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {log.action_type.replace(/_/g, ' ').toUpperCase()}
                              </span>
                              <span className="text-sm font-medium text-gray-900">{log.admin_name}</span>
                            </div>
                            <p className="text-sm text-gray-700">{log.action_description}</p>
                          </div>
                          <div className="text-xs text-gray-500 ml-4 text-right">
                            {new Date(log.created_at).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {!loading && activeTab === 'coverageMatrix' && (
            <PortfolioMonitoringMatrix
              issues={issues}
              portfolios={portfolios}
              monitoredPersonnel={users.map(u => u.name || u)}
            />
          )}

        {/* Edit Login User Modal */}
        {editingLoginUser && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Edit Login User</h3>
                <button
                  onClick={() => {
                    setEditingLoginUser(null);
                    setEditLoginPassword('');
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                  <input
                    type="text"
                    value={editLoginUsername}
                    onChange={(e) => setEditLoginUsername(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editLoginFullName}
                    onChange={(e) => setEditLoginFullName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select
                      value={editLoginRole}
                      onChange={(e) => setEditLoginRole(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2 mt-6 md:mt-0">
                    <input
                      type="checkbox"
                      checked={editLoginActive}
                      onChange={(e) => setEditLoginActive(e.target.checked)}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700">Active</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password (optional)</label>
                  <input
                    type="text"
                    value={editLoginPassword}
                    onChange={(e) => setEditLoginPassword(e.target.value)}
                    placeholder="Leave blank to keep existing"
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimum 6 characters. Leave empty to keep current password.</p>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setEditingLoginUser(null);
                    setEditLoginPassword('');
                  }}
                  className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateLoginUser}
                  className="px-5 py-2 bg-green-600 text-white rounded font-medium hover:bg-green-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded font-medium hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
