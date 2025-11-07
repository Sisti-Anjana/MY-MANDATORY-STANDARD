import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

const AdminPanel = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('portfolios');
  const [portfolios, setPortfolios] = useState([]);
  const [users, setUsers] = useState([]);
  const [adminLogs, setAdminLogs] = useState([]);
  const [newPortfolioName, setNewPortfolioName] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newLogNote, setNewLogNote] = useState('');
  const [adminName, setAdminName] = useState('Admin');
  const [loading, setLoading] = useState(false);

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

      // Note: For users, we're managing them in the component state
      // In a real app, you'd have a users table
      const storedUsers = localStorage.getItem('monitoredPersonnel');
      if (storedUsers) {
        setUsers(JSON.parse(storedUsers));
      } else {
        // Default users
        const defaultUsers = [
          'Anjana', 'Anita P', 'Arun V', 'Bharat Gu', 'Deepa L', 
          'jenny', 'Kumar S', 'Lakshmi B', 'Manoj D', 'Rajesh K',
          'Ravi T', 'Vikram N'
        ];
        setUsers(defaultUsers);
        localStorage.setItem('monitoredPersonnel', JSON.stringify(defaultUsers));
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

  const handleAddPortfolio = async () => {
    if (!newPortfolioName.trim()) {
      alert('Please enter a portfolio name');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('portfolios')
        .insert([{ name: newPortfolioName.trim() }])
        .select();

      if (error) throw error;

      await addAdminLog('portfolio_added', `Added portfolio: ${newPortfolioName.trim()}`, data[0].portfolio_id);
      alert('✅ Portfolio added successfully!');
      setNewPortfolioName('');
      fetchData();
    } catch (error) {
      console.error('Error adding portfolio:', error);
      alert('❌ Error adding portfolio: ' + error.message);
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

  const handleAddUser = () => {
    if (!newUserName.trim()) {
      alert('Please enter a user name');
      return;
    }

    if (users.includes(newUserName.trim())) {
      alert('User already exists');
      return;
    }

    const updatedUsers = [...users, newUserName.trim()].sort();
    setUsers(updatedUsers);
    localStorage.setItem('monitoredPersonnel', JSON.stringify(updatedUsers));
    addAdminLog('user_added', `Added user: ${newUserName.trim()}`);
    setNewUserName('');
    alert('✅ User added successfully!');
  };

  const handleDeleteUser = (userName) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"?`)) {
      return;
    }

    const updatedUsers = users.filter(u => u !== userName);
    setUsers(updatedUsers);
    localStorage.setItem('monitoredPersonnel', JSON.stringify(updatedUsers));
    addAdminLog('user_deleted', `Deleted user: ${userName}`);
    alert('✅ User deleted successfully!');
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-gray-800 to-gray-900">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white">Admin Panel</h2>
              <p className="text-gray-300 text-sm mt-1">Manage portfolios and users</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300 text-3xl font-bold leading-none"
            >
              ×
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b bg-gray-50">
          <div className="flex gap-4 px-6">
            <button
              onClick={() => setActiveTab('portfolios')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'portfolios'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Portfolios ({portfolios.length})
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Monitored By / Missed By Users ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'logs'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Admin Logs ({adminLogs.length})
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
              </div>

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
                        <div>
                          <div className="font-medium text-gray-900">{portfolio.name}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            ID: {portfolio.portfolio_id}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeletePortfolio(portfolio.portfolio_id, portfolio.name)}
                          className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 font-medium text-sm"
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
                        key={user}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded border hover:bg-gray-100"
                      >
                        <div className="font-medium text-gray-900">{user}</div>
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
