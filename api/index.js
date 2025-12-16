// Vercel serverless function wrapper for Express app
const app = require('../server/index.js');

// Export as Vercel serverless function handler
// Vercel routes /api/* to this function
module.exports = (req, res) => {
  // Pass the request to Express app
  return app(req, res);
};

