/* eslint-disable */
import React, { useState, useEffect } from 'react';
import SinglePageComplete from './components/SinglePageComplete';
import UserLogin from './components/UserLogin';
import AdminLogin from './components/AdminLogin';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loginType, setLoginType] = useState('user'); // 'user' or 'admin'

  // Check authentication status on mount and periodically
  useEffect(() => {
    checkAuthStatus();

    // Check auth status every 5 minutes (less frequent to avoid false logouts)
    const interval = setInterval(checkAuthStatus, 5 * 60000);
    return () => clearInterval(interval);
  }, []);

  const checkAuthStatus = () => {
    try {
      const userAuth = sessionStorage.getItem('userAuthenticated') === 'true';
      const adminAuth = sessionStorage.getItem('adminAuthenticated') === 'true';
      const userRole = sessionStorage.getItem('userRole');
      
      // Check if session expired (only if we have auth flags set)
      if (userAuth || adminAuth) {
        const expiresAtKey = adminAuth ? 'adminAuthExpiresAt' : 'userAuthExpiresAt';
        const expiresAtRaw = sessionStorage.getItem(expiresAtKey);
        
        // Only check expiry if expiresAt exists and is valid
        if (expiresAtRaw) {
          const expiresAt = parseInt(expiresAtRaw, 10);
          
          // Check if expiry is a valid number and if it has actually expired
          if (!isNaN(expiresAt) && expiresAt > 0 && Date.now() > expiresAt) {
            // Session expired - logout
            console.log('Session expired. Logging out...');
            handleLogout();
            return;
          }
        } else {
          // If no expiry set but auth is true, extend the session (grace period)
          // This handles cases where expiry might have been lost but user is still authenticated
          if (userAuth) {
            const newExpiry = Date.now() + 8 * 60 * 60 * 1000; // 8 hours
            sessionStorage.setItem('userAuthExpiresAt', String(newExpiry));
          } else if (adminAuth) {
            const newExpiry = Date.now() + 2 * 60 * 60 * 1000; // 2 hours
            sessionStorage.setItem('adminAuthExpiresAt', String(newExpiry));
          }
        }
      }

      // Set authentication state
      if (adminAuth && userRole === 'admin') {
        setIsAuthenticated(true);
        setIsAdmin(true);
      } else if (userAuth && userRole === 'user') {
        setIsAuthenticated(true);
        setIsAdmin(false);
      } else {
        // Only set to false if we're sure there's no valid auth
        // Don't logout if sessionStorage might have been temporarily unavailable
        if (!userAuth && !adminAuth) {
          setIsAuthenticated(false);
          setIsAdmin(false);
        }
      }
    } catch (error) {
      // If there's an error accessing sessionStorage, don't logout
      // This prevents false logouts due to browser issues
      console.error('Error checking auth status:', error);
    }
  };

  const handleUserLoginSuccess = () => {
    setIsAuthenticated(true);
    setIsAdmin(false);
    setLoginType('user');
  };

  const handleAdminLoginSuccess = () => {
    setIsAuthenticated(true);
    setIsAdmin(true);
    setLoginType('admin');
  };

  const handleLogout = () => {
    // Clear all auth data
    sessionStorage.removeItem('userAuthenticated');
    sessionStorage.removeItem('adminAuthenticated');
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('fullName');
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('userAuthExpiresAt');
    sessionStorage.removeItem('adminAuthExpiresAt');
    
    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  const switchToAdminLogin = () => {
    setLoginType('admin');
  };

  const switchToUserLogin = () => {
    setLoginType('user');
  };

  // If not authenticated, show login screen
  if (!isAuthenticated) {
    if (loginType === 'admin') {
      return <AdminLogin onLoginSuccess={handleAdminLoginSuccess} onSwitchToUser={switchToUserLogin} />;
    } else {
      return <UserLogin onLoginSuccess={handleUserLoginSuccess} onSwitchToAdmin={switchToAdminLogin} />;
    }
  }

  // If authenticated, show main application
  return <SinglePageComplete isAdmin={isAdmin} onLogout={handleLogout} />;
}

export default App;
