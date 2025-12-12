const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
// Use production database if USE_SUPABASE is true or NODE_ENV is production
const db = (process.env.USE_SUPABASE === 'true' || process.env.NODE_ENV === 'production') 
  ? require('./database-production') 
  : require('./database');

const app = express();
const PORT = process.env.PORT || 5001;

// Session store (in production, use Redis or similar)
const sessions = new Map();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session middleware
app.use((req, res, next) => {
  let sessionId = req.headers['x-session-id'];
  if (!sessionId) {
    sessionId = uuidv4();
    sessions.set(sessionId, { createdAt: Date.now() });
  }
  req.sessionId = sessionId;
  res.setHeader('x-session-id', sessionId);
  next();
});

// Cleanup expired reservations (run every minute)
setInterval(() => {
  const promise = db.run('DELETE FROM hour_reservations WHERE expires_at < datetime("now")', [], (err) => {
    if (err) {
      console.error('Error cleaning up expired reservations:', err);
    }
  });
  // Handle promise rejection if db.run returns a promise
  if (promise && typeof promise.catch === 'function') {
    promise.catch((err) => {
      console.error('Error cleaning up expired reservations (promise rejection):', err);
    });
  }
}, 60000);

// Routes

// Get all portfolios
app.get('/api/portfolios', (req, res) => {
  db.all('SELECT * FROM portfolios ORDER BY name', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Add new portfolio (for admin)
app.post('/api/portfolios', (req, res) => {
  const { name } = req.body;
  
  if (!name) {
    res.status(400).json({ error: 'Portfolio name is required' });
    return;
  }

  db.run(
    'INSERT INTO portfolios (name) VALUES (?)',
    [name],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ 
        id: this.lastID, 
        name: name,
        message: 'Portfolio created successfully'
      });
    }
  );
});

// Delete portfolio
app.delete('/api/portfolios/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM portfolios WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Portfolio deleted successfully' });
  });
});

// Get portfolio status (all_sites_checked)
app.get('/api/portfolios/:id/status', (req, res) => {
  const { id } = req.params;
  
  db.get(
    'SELECT id, name, all_sites_checked, updated_at FROM portfolios WHERE id = ?',
    [id],
    (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (!row) {
        res.status(404).json({ error: 'Portfolio not found' });
        return;
      }
      res.json({
        id: row.id,
        name: row.name,
        all_sites_checked: row.all_sites_checked || false,
        updated_at: row.updated_at
      });
    }
  );
});

// Update portfolio status (all_sites_checked)
app.put('/api/portfolios/:id/status', (req, res) => {
  const { id } = req.params;
  const { all_sites_checked } = req.body;
  
  if (typeof all_sites_checked !== 'boolean') {
    res.status(400).json({ error: 'all_sites_checked must be a boolean value' });
    return;
  }
  
  db.run(
    'UPDATE portfolios SET all_sites_checked = ?, updated_at = datetime("now") WHERE id = ?',
    [all_sites_checked, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Portfolio not found' });
        return;
      }
      res.json({ 
        message: 'Portfolio status updated successfully',
        all_sites_checked: all_sites_checked
      });
    }
  );
});

// Get sites by portfolio
app.get('/api/portfolios/:portfolioId/sites', (req, res) => {
  const portfolioId = req.params.portfolioId;
  db.all(
    'SELECT * FROM sites WHERE portfolio_id = ? ORDER BY name',
    [portfolioId],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    }
  );
});

// Get all sites
app.get('/api/sites', (req, res) => {
  db.all(`
    SELECT s.*, p.name as portfolio_name 
    FROM sites s 
    JOIN portfolios p ON s.portfolio_id = p.id 
    ORDER BY p.name, s.name
  `, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Create new issue
app.post('/api/issues', (req, res) => {
  const { portfolio_id, issue_hour, issue_present, issue_details, case_number, monitored_by, issues_missed_by } = req.body;
  const sessionId = req.sessionId;
  
  if (!portfolio_id || !issue_hour) {
    res.status(400).json({ error: 'Portfolio and hour are required' });
    return;
  }

  if (!monitored_by) {
    res.status(400).json({ error: 'Monitored By is required' });
    return;
  }

  // Normalize issue_present to proper case (Yes or No)
  const normalizedIssuePresent = issue_present && issue_present.toString().toLowerCase() === 'yes' ? 'Yes' : 'No';

  // If issue_present is "Yes", issue_details should be provided
  if (normalizedIssuePresent === 'Yes' && !issue_details) {
    res.status(400).json({ error: 'Issue details are required when issue is present' });
    return;
  }

  db.run(
    'INSERT INTO issues (portfolio_id, issue_hour, issue_present, issue_details, case_number, monitored_by, issues_missed_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [portfolio_id, issue_hour, normalizedIssuePresent, issue_details || null, case_number || null, monitored_by || null, issues_missed_by || null],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      // Release the reservation after successful issue creation
      db.run(
        'DELETE FROM hour_reservations WHERE portfolio_id = ? AND issue_hour = ? AND monitored_by = ? AND session_id = ?',
        [portfolio_id, issue_hour, monitored_by, sessionId],
        (releaseErr) => {
          if (releaseErr) {
            console.error('Error releasing reservation:', releaseErr);
          }
        }
      );
      
      res.json({ 
        id: this.lastID, 
        message: 'Issue created successfully'
      });
    }
  );
});

// Update issue (for edit functionality)
app.put('/api/issues/:id', (req, res) => {
  const { id } = req.params;
  const { issue_hour, issue_present, issue_details, case_number, monitored_by, issues_missed_by } = req.body;
  
  // Normalize issue_present to proper case (Yes or No)
  const normalizedIssuePresent = issue_present && issue_present.toString().toLowerCase() === 'yes' ? 'Yes' : 'No';
  
  db.run(
    `UPDATE issues 
     SET issue_hour = ?, issue_present = ?, issue_details = ?, 
         case_number = ?, monitored_by = ?, issues_missed_by = ?
     WHERE id = ?`,
    [issue_hour, normalizedIssuePresent, issue_details, case_number, monitored_by, issues_missed_by, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: 'Issue updated successfully' });
    }
  );
});

// Delete issue
app.delete('/api/issues/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM issues WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Issue deleted successfully' });
  });
});

// Get all issues with portfolio info
app.get('/api/issues', (req, res) => {
  const { search, portfolio_id } = req.query;
  
  let query = `
    SELECT 
      i.*,
      p.name as portfolio_name
    FROM issues i
    JOIN portfolios p ON i.portfolio_id = p.id
  `;
  
  const params = [];
  const conditions = [];
  
  // Add search filter
  if (search) {
    conditions.push(`(p.name LIKE ? OR i.issue_details LIKE ? OR i.case_number LIKE ?)`);
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  
  // Add portfolio filter
  if (portfolio_id) {
    conditions.push('i.portfolio_id = ?');
    params.push(portfolio_id);
  }
  
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  
  query += ' ORDER BY i.created_at DESC';
  
  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    // Normalize issue_present values
    const normalizedRows = rows.map(row => ({
      ...row,
      issue_present: row.issue_present && row.issue_present.toString().toLowerCase() === 'yes' ? 'Yes' : 'No'
    }));
    res.json(normalizedRows);
  });
});

// Get issues by specific portfolio
app.get('/api/portfolios/:portfolioId/issues', (req, res) => {
  const { portfolioId } = req.params;
  
  db.all(`
    SELECT 
      i.*,
      p.name as portfolio_name
    FROM issues i
    JOIN portfolios p ON i.portfolio_id = p.id
    WHERE i.portfolio_id = ?
    ORDER BY i.created_at DESC
  `, [portfolioId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get hourly coverage data
app.get('/api/coverage', (req, res) => {
  // Get total number of portfolios
  db.get('SELECT COUNT(*) as total FROM portfolios', (err, portfolioCount) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    // Get issues by hour with portfolio counts for today only
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    db.all(`
      SELECT 
        issue_hour,
        COUNT(DISTINCT portfolio_id) as portfolios_with_issues
      FROM issues 
      WHERE DATE(created_at) = ?
      GROUP BY issue_hour
      ORDER BY issue_hour
    `, [today], (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      const totalPortfolios = portfolioCount.total;
      const coverageData = [];

      // Initialize all hours with 0% coverage
      for (let hour = 1; hour <= 24; hour++) {
        coverageData.push({
          hour: hour,
          portfolios_with_issues: 0,
          coverage_percentage: 0
        });
      }

      // Update with actual data
      rows.forEach(row => {
        const hourIndex = row.issue_hour - 1;
        if (hourIndex >= 0 && hourIndex < 24) {
          coverageData[hourIndex] = {
            hour: row.issue_hour,
            portfolios_with_issues: row.portfolios_with_issues,
            coverage_percentage: Math.round((row.portfolios_with_issues / totalPortfolios) * 100)
          };
        }
      });

      res.json({
        total_portfolios: totalPortfolios,
        coverage_by_hour: coverageData
      });
    });
  });
});

// Get issue statistics
app.get('/api/stats', (req, res) => {
  db.all(`
    SELECT 
      COUNT(*) as total_issues,
      COUNT(DISTINCT portfolio_id) as portfolios_with_issues,
      AVG(issue_hour) as avg_issue_hour,
      SUM(CASE WHEN issue_present = 'Yes' THEN 1 ELSE 0 END) as issues_with_problems
    FROM issues
  `, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows[0]);
  });
});

// Get all users
app.get('/api/users', (req, res) => {
  db.all('SELECT * FROM users ORDER BY name', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Add new user
app.post('/api/users', (req, res) => {
  const { name, role } = req.body;
  
  if (!name || !role) {
    res.status(400).json({ error: 'Name and role are required' });
    return;
  }

  db.run(
    'INSERT INTO users (name, role) VALUES (?, ?)',
    [name, role],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID, name: name, role: role, message: 'User created successfully' });
    }
  );
});

// Delete user
app.delete('/api/users/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM users WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'User deleted successfully' });
  });
});

// Hour Reservation endpoints

// Reserve a portfolio/hour/monitor combination
app.post('/api/reservations', (req, res) => {
  const { portfolio_id, issue_hour, monitored_by } = req.body;
  const sessionId = req.sessionId;
  
  if (!portfolio_id || issue_hour === undefined || !monitored_by) {
    res.status(400).json({ error: 'Portfolio, hour, and monitored_by are required' });
    return;
  }

  // Set expiration to 1 hour from now
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

  // Check if already reserved by someone else
  db.get(
    'SELECT * FROM hour_reservations WHERE portfolio_id = ? AND issue_hour = ? AND monitored_by = ?',
    [portfolio_id, issue_hour, monitored_by],
    (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      if (row) {
        // Check if it's expired
        if (new Date(row.expires_at) < new Date()) {
          // Delete expired reservation
          db.run('DELETE FROM hour_reservations WHERE id = ?', [row.id]);
        } else if (row.session_id !== sessionId) {
          // Someone else has it reserved
          res.status(409).json({ 
            error: 'This combination is already reserved by another user',
            reserved: true
          });
          return;
        } else {
          // Same session, update expiration
          db.run(
            'UPDATE hour_reservations SET expires_at = ? WHERE id = ?',
            [expiresAt, row.id],
            (err) => {
              if (err) {
                res.status(500).json({ error: err.message });
                return;
              }
              res.json({ 
                message: 'Reservation updated',
                reservation_id: row.id,
                session_id: sessionId
              });
            }
          );
          return;
        }
      }

      // Create new reservation
      db.run(
        'INSERT OR REPLACE INTO hour_reservations (portfolio_id, issue_hour, monitored_by, session_id, expires_at) VALUES (?, ?, ?, ?, ?)',
        [portfolio_id, issue_hour, monitored_by, sessionId, expiresAt],
        function(err) {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }
          res.json({ 
            message: 'Reservation created',
            reservation_id: this.lastID,
            session_id: sessionId,
            expires_at: expiresAt
          });
        }
      );
    }
  );
});

// Check if a combination is reserved
app.get('/api/reservations/check', (req, res) => {
  const { portfolio_id, issue_hour, monitored_by } = req.query;
  const sessionId = req.sessionId;

  if (!portfolio_id || !issue_hour || !monitored_by) {
    res.status(400).json({ error: 'Portfolio, hour, and monitored_by are required' });
    return;
  }

  db.get(
    `SELECT * FROM hour_reservations 
     WHERE portfolio_id = ? AND issue_hour = ? AND monitored_by = ? 
     AND expires_at > datetime("now")`,
    [portfolio_id, issue_hour, monitored_by],
    (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      if (row) {
        res.json({
          reserved: true,
          is_yours: row.session_id === sessionId,
          monitored_by: row.session_id === sessionId ? row.monitored_by : null,
          expires_at: row.expires_at
        });
      } else {
        res.json({ reserved: false });
      }
    }
  );
});

// Get all active reservations (for current session only)
app.get('/api/reservations', (req, res) => {
  const sessionId = req.sessionId;

  db.all(
    `SELECT r.*, p.name as portfolio_name 
     FROM hour_reservations r
     JOIN portfolios p ON r.portfolio_id = p.id
     WHERE r.session_id = ? AND r.expires_at > datetime("now")
     ORDER BY r.reserved_at DESC`,
    [sessionId],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    }
  );
});

// Get ALL active reservations (for all users - for card highlighting)
app.get('/api/reservations/all', (req, res) => {
  db.all(
    `SELECT r.*, p.name as portfolio_name 
     FROM hour_reservations r
     JOIN portfolios p ON r.portfolio_id = p.id
     WHERE r.expires_at > datetime("now")
     ORDER BY r.reserved_at DESC`,
    [],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    }
  );
});

// Release a reservation
app.delete('/api/reservations/:id', (req, res) => {
  const { id } = req.params;
  const sessionId = req.sessionId;

  // Only allow deletion of own reservations
  db.run(
    'DELETE FROM hour_reservations WHERE id = ? AND session_id = ?',
    [id, sessionId],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Reservation not found or not owned by you' });
        return;
      }
      res.json({ message: 'Reservation released' });
    }
  );
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit the process, just log the error
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Don't exit the process, just log the error
});

// Export app for serverless deployment (Vercel)
module.exports = app;

// Only start server if not in serverless environment
if (process.env.VERCEL !== '1' && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📡 API available at http://localhost:${PORT}/api`);
  });
}
