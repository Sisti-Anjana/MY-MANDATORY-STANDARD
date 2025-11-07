const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Helper function to make API calls with retry
const apiCall = async (endpoint, options = {}, retries = 3) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  console.log('Making API call to:', url);

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, config);
      
      console.log('API response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
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
};

// Stats API
export const statsAPI = {
  getStats: () => apiCall('/stats'),
};

// Coverage API
export const coverageAPI = {
  getCoverage: () => apiCall('/coverage'),
};
