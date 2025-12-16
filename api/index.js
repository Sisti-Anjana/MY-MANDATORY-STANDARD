// Vercel serverless function wrapper for Express app
const app = require('../server/index.js');

// Export as Vercel serverless function handler
// Vercel routes /api/* to this function
module.exports = (req, res) => {
  // Vercel passes the full path including /api, so Express routes should match
  // Ensure the path includes /api prefix for Express routes
  const originalUrl = req.url;
  if (!originalUrl.startsWith('/api')) {
    req.url = '/api' + originalUrl;
  }
  
  // Pass the request to Express app
  return app(req, res);
};

