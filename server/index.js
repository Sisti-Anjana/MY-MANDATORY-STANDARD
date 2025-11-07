const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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
  
  if (!portfolio_id || !issue_hour) {
    res.status(400).json({ error: 'Portfolio and hour are required' });
    return;
  }

  // If issue_present is "Yes", issue_details should be provided
  if (issue_present === 'Yes' && !issue_details) {
    res.status(400).json({ error: 'Issue details are required when issue is present' });
    return;
  }

  db.run(
    'INSERT INTO issues (portfolio_id, issue_hour, issue_present, issue_details, case_number, monitored_by, issues_missed_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [portfolio_id, issue_hour, issue_present || null, issue_details || null, case_number || null, monitored_by || null, issues_missed_by || null],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
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
  
  db.run(
    `UPDATE issues 
     SET issue_hour = ?, issue_present = ?, issue_details = ?, 
         case_number = ?, monitored_by = ?, issues_missed_by = ?
     WHERE id = ?`,
    [issue_hour, issue_present, issue_details, case_number, monitored_by, issues_missed_by, id],
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
    res.json(rows);
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

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
});
