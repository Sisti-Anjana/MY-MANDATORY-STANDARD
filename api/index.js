// Vercel serverless function wrapper for Express app
const app = require('../server/index.js');

// Export as Vercel serverless function
// Vercel will call this for /api/* routes
module.exports = app;

