import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

const AdminLogin = ({ onLoginSuccess, onSwitchToUser }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // FALLBACK: Check hardcoded admin credentials first (for demo/testing)
      if (username === 'admin' && password === 'admin123') {
        // Store admin info in sessionStorage
        sessionStorage.setItem('adminAuthenticated', 'true');
        sessionStorage.setItem('userId', 'hardcoded-admin');
        sessionStorage.setItem('username', 'admin');
        sessionStorage.setItem('fullName', 'Administrator');
        sessionStorage.setItem('userRole', 'admin');
        const expiry = Date.now() + 2 * 60 * 60 * 1000; // 2 hours for admin
        sessionStorage.setItem('adminAuthExpiresAt', String(expiry));

        setIsLoading(false);
        onLoginSuccess();
        return;
      }

      // Try database authentication
      const { data, error: queryError } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('role', 'admin')
        .single();

      if (queryError || !data) {
        setError('Invalid admin credentials');
        setPassword('');
        setIsLoading(false);
        return;
      }

      // Simple password check (in production, use proper password hashing)
      if (data.password_hash !== password) {
        setError('Invalid admin credentials');
        setPassword('');
        setIsLoading(false);
        return;
      }

      // Check if admin is active
      if (!data.is_active) {
        setError('Your admin account has been deactivated.');
        setIsLoading(false);
        return;
      }

      // Update last login time
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('user_id', data.user_id);

      // Store admin info in sessionStorage
      sessionStorage.setItem('adminAuthenticated', 'true');
      sessionStorage.setItem('userId', data.user_id);
      sessionStorage.setItem('username', data.username);
      sessionStorage.setItem('fullName', data.full_name || data.username);
      sessionStorage.setItem('userRole', 'admin');
      const expiry = Date.now() + 2 * 60 * 60 * 1000; // 2 hours for admin
      sessionStorage.setItem('adminAuthExpiresAt', String(expiry));

      onLoginSuccess();
    } catch (err) {
      console.error('Admin login error:', err);
      setError('An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #76AB3F 0%, #5a8230 50%, #3d5620 100%)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" style={{ border: '2px solid #76AB3F' }}>
        {/* Header */}
        <div className="p-8" style={{ background: 'linear-gradient(to right, #76AB3F 0%, #5a8230 100%)' }}>
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#76AB3F' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white text-center">Admin Login</h2>
          <p className="text-sm text-center mt-2" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Administrator Access Panel</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded flex items-start gap-3">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Username Field */}
          <div>
            <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
              Admin Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 text-sm transition-all"
                placeholder="Enter admin username"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
              Admin Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 text-sm transition-all"
                placeholder="Enter admin password"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full text-white py-3 px-4 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl"
            style={{ 
              background: 'linear-gradient(to right, #76AB3F 0%, #5a8230 100%)',
              focusRing: '#76AB3F'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(to right, #5a8230 0%, #3d5620 100%)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(to right, #76AB3F 0%, #5a8230 100%)'}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <span>Admin Login</span>
              </>
            )}
          </button>

          {/* User Link */}
          <div className="text-center pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onSwitchToUser}
              className="text-sm text-gray-600 font-medium transition-colors"
              onMouseEnter={(e) => e.currentTarget.style.color = '#76AB3F'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#4b5563'}
            >
              Regular user? <span style={{ color: '#76AB3F' }}>Click here</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
