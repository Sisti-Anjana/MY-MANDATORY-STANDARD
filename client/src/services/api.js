const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Session management
let sessionId = localStorage.getItem('session_id');

// Helper function to make API calls with retry
const apiCall = async (endpoint, options = {}, retries = 3) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'x-session-id': sessionId || '',
      ...options.headers,
    },
    ...options,
  };

  console.log('Making API call to:', url);

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, config);
      
      // Store session ID from response
      const newSessionId = response.headers.get('x-session-id');
      if (newSessionId && newSessionId !== sessionId) {
        sessionId = newSessionId;
        localStorage.setItem('session_id', newSessionId);
      }
      
      console.log('API response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API response data:', data);
      return { data };
    } catch (error) {
      console.error(`API call failed (attempt ${attempt}/${retries}):`, error);
      
      if (attempt === retries) {
        console.error('URL:', url);
        console.error('Config:', config);
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
};

// Portfolios API
export const portfoliosAPI = {
  getAll: () => apiCall('/portfolios'),
  getById: (id) => apiCall(`/portfolios/${id}`),
  getSites: (portfolioId) => apiCall(`/portfolios/${portfolioId}/sites`),
};

// Sites API
export const sitesAPI = {
  getAll: () => apiCall('/sites'),
};

// Issues API
export const issuesAPI = {
  getAll: () => apiCall('/issues'),
  create: (issueData) => apiCall('/issues', {
    method: 'POST',
    body: JSON.stringify(issueData),
  }),
  update: (issueId, issueData) => apiCall(`/issues/${issueId}`, {
    method: 'PUT',
    body: JSON.stringify(issueData),
  }),
  delete: (issueId) => apiCall(`/issues/${issueId}`, {
    method: 'DELETE',
  }),
};

// Stats API
export const statsAPI = {
  getStats: () => apiCall('/stats'),
};

// Coverage API
export const coverageAPI = {
  getCoverage: () => apiCall('/coverage'),
};

// Hour Reservation API
export const reservationAPI = {
  // Create or update a reservation
  reserve: (reservationData) => apiCall('/reservations', {
    method: 'POST',
    body: JSON.stringify(reservationData),
  }),
  
  // Check if a combination is reserved
  check: (portfolio_id, issue_hour, monitored_by) => 
    apiCall(`/reservations/check?portfolio_id=${portfolio_id}&issue_hour=${issue_hour}&monitored_by=${encodeURIComponent(monitored_by)}`),
  
  // Get all active reservations (for all users)
  getActive: () => apiCall('/reservations/all'),
  
  // Get all reservations for current session
  getMyReservations: () => apiCall('/reservations'),
  
  // Release a reservation
  release: (reservationId) => apiCall(`/reservations/${reservationId}`, {
    method: 'DELETE',
  }),
};
