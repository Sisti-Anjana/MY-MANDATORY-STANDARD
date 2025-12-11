import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

const UserLogin = ({ onLoginSuccess, onSwitchToAdmin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // FALLBACK: Check hardcoded credentials first (for demo/testing)
      const hardcodedUsers = [
        { username: 'user1', password: 'user123', full_name: 'User One', role: 'user', user_id: 'hardcoded-1' },
        { username: 'user2', password: 'user123', full_name: 'User Two', role: 'user', user_id: 'hardcoded-2' }
      ];

      const hardcodedUser = hardcodedUsers.find(
        u => u.username === username && u.password === password
      );

      if (hardcodedUser) {
        // Store user info in sessionStorage
        sessionStorage.setItem('userAuthenticated', 'true');
        sessionStorage.setItem('userId', hardcodedUser.user_id);
        sessionStorage.setItem('username', hardcodedUser.username);
        sessionStorage.setItem('fullName', hardcodedUser.full_name);
        sessionStorage.setItem('userRole', 'user');
        const expiry = Date.now() + 8 * 60 * 60 * 1000; // 8 hours
        sessionStorage.setItem('userAuthExpiresAt', String(expiry));

        setIsLoading(false);
        onLoginSuccess();
        return;
      }

      // Try database authentication
      const { data, error: queryError } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('role', 'user')
        .single();

      if (queryError || !data) {
        setError('Invalid username or password');
        setPassword('');
        setIsLoading(false);
        return;
      }

      // Simple password check (in production, use proper password hashing)
      if (data.password_hash !== password) {
        setError('Invalid username or password');
        setPassword('');
        setIsLoading(false);
        return;
      }

      // Check if user is active
      if (!data.is_active) {
        setError('Your account has been deactivated. Please contact administrator.');
        setIsLoading(false);
        return;
      }

      // Update last login time
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('user_id', data.user_id);

      // Store user info in sessionStorage
      sessionStorage.setItem('userAuthenticated', 'true');
      sessionStorage.setItem('userId', data.user_id);
      sessionStorage.setItem('username', data.username);
      sessionStorage.setItem('fullName', data.full_name || data.username);
      sessionStorage.setItem('userRole', 'user');
      const expiry = Date.now() + 8 * 60 * 60 * 1000; // 8 hours
      sessionStorage.setItem('userAuthExpiresAt', String(expiry));

      onLoginSuccess();
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left panel (branding) */}
          <div className="relative p-8 flex flex-col justify-center bg-white">
            <div className="flex flex-col items-center gap-6">
              <img
                src="/login.png"
                alt="Brand Logo"
                className="h-56 w-auto object-contain"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
              <div className="text-center space-y-1">
                <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Welcome</h2>
                <p className="text-sm text-gray-500">Please sign in to continue</p>
              </div>
            </div>
          </div>

          {/* Right panel (form) */}
          <div
            className="p-8 md:p-10 bg-white text-white"
            style={{
              background: 'linear-gradient(135deg, #76AB3F 0%, #5a8f2f 50%, #3d6d1f 100%)'
            }}
          >
            <div className="text-center mb-8 space-y-1">
              <h2 className="text-2xl font-extrabold text-white">User Login</h2>
              <p className="text-sm text-emerald-50">Access your portfolio dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {/* Username Field */}
              <div className="space-y-2">
                <label htmlFor="username" className="block text-sm font-semibold text-gray-800">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-sm transition-all shadow-sm"
                    placeholder="Type your username"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-800">
                    Password
                  </label>
                  <span className="text-xs text-emerald-600 font-semibold cursor-pointer">Forgot password?</span>
                </div>
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
                    className="block w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-sm transition-all shadow-sm"
                    placeholder="Type your password"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full text-white py-3 px-4 rounded-xl font-semibold focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl bg-gradient-to-r from-emerald-600 to-emerald-500"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/80 border-t-transparent rounded-full animate-spin"></div>
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    <span>Sign In</span>
                  </>
                )}
              </button>

              {/* Admin Link */}
              <div className="text-center pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onSwitchToAdmin}
                  className="text-sm text-white font-semibold transition-colors hover:text-emerald-100"
                >
                  Are you an admin? <span className="text-white">Click here</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;
