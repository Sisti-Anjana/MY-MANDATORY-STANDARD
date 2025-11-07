const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
db.serialize(() => {
  // Create portfolios table
  db.run(`
    CREATE TABLE IF NOT EXISTS portfolios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create sites table
  db.run(`
    CREATE TABLE IF NOT EXISTS sites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      portfolio_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (portfolio_id) REFERENCES portfolios (id),
      UNIQUE(portfolio_id, name)
    )
  `);

  // Create issues table
  db.run(`
    CREATE TABLE IF NOT EXISTS issues (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      portfolio_id INTEGER NOT NULL,
      issue_hour INTEGER NOT NULL,
      issue_present TEXT NOT NULL,
      issue_details TEXT,
      case_number TEXT,
      monitored_by TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      issues_missed_by TEXT,
      FOREIGN KEY (portfolio_id) REFERENCES portfolios (id)
    )
  `);

  // Insert sample data
  const samplePortfolios = [
    { name: 'BESS & Trimark' },
    { name: 'Mid Atlantic 1' },
    { name: 'Mid Atlantic 2' },
    { name: 'Midwest 1' },
    { name: 'Midwest 2' },
    { name: 'New England 1' },
    { name: 'New England 2' },
    { name: 'New England 3' },
    { name: 'Nor Cal 1' },
    { name: 'Nor Cal 2' },
    { name: 'So Cal 1' },
    { name: 'So Cal 2' },
    { name: 'So Cal 3' },
    { name: 'Guarantee Sites' },
    { name: 'Intermountain West' },
    { name: 'Aurora' },
    { name: 'Chint' },
    { name: 'Locus' },
    { name: 'SolrenView' },
    { name: 'SolarEdge' },
    { name: 'eG/GByte/PD/GPM' },
    { name: 'Power Factor' }
  ];

  const sampleSites = [
    // BESS & Trimark
    { portfolio_id: 1, name: 'Multi Das' },
    { portfolio_id: 1, name: 'BESS Site 1' },
    { portfolio_id: 1, name: 'BESS Site 2' },
    { portfolio_id: 1, name: 'Trimark Site 1' },
    { portfolio_id: 1, name: 'Trimark Site 2' },
    
    // Mid Atlantic 1
    { portfolio_id: 2, name: 'MA1 Site 1' },
    { portfolio_id: 2, name: 'MA1 Site 2' },
    { portfolio_id: 2, name: 'MA1 Site 3' },
    { portfolio_id: 2, name: 'MA1 Site 4' },
    { portfolio_id: 2, name: 'MA1 Site 5' },
    
    // Mid Atlantic 2
    { portfolio_id: 3, name: 'MA2 Site 1' },
    { portfolio_id: 3, name: 'MA2 Site 2' },
    { portfolio_id: 3, name: 'MA2 Site 3' },
    { portfolio_id: 3, name: 'MA2 Site 4' },
    { portfolio_id: 3, name: 'MA2 Site 5' },
    
    // Midwest 1
    { portfolio_id: 4, name: 'MW1 Site 1' },
    { portfolio_id: 4, name: 'MW1 Site 2' },
    { portfolio_id: 4, name: 'MW1 Site 3' },
    { portfolio_id: 4, name: 'MW1 Site 4' },
    { portfolio_id: 4, name: 'MW1 Site 5' },
    
    // Midwest 2
    { portfolio_id: 5, name: 'MW2 Site 1' },
    { portfolio_id: 5, name: 'MW2 Site 2' },
    { portfolio_id: 5, name: 'MW2 Site 3' },
    { portfolio_id: 5, name: 'MW2 Site 4' },
    { portfolio_id: 5, name: 'MW2 Site 5' },
    
    // New England 1
    { portfolio_id: 6, name: 'NE1 Site 1' },
    { portfolio_id: 6, name: 'NE1 Site 2' },
    { portfolio_id: 6, name: 'NE1 Site 3' },
    { portfolio_id: 6, name: 'NE1 Site 4' },
    { portfolio_id: 6, name: 'NE1 Site 5' },
    
    // New England 2
    { portfolio_id: 7, name: 'NE2 Site 1' },
    { portfolio_id: 7, name: 'NE2 Site 2' },
    { portfolio_id: 7, name: 'NE2 Site 3' },
    { portfolio_id: 7, name: 'NE2 Site 4' },
    { portfolio_id: 7, name: 'NE2 Site 5' },
    
    // New England 3
    { portfolio_id: 8, name: 'NE3 Site 1' },
    { portfolio_id: 8, name: 'NE3 Site 2' },
    { portfolio_id: 8, name: 'NE3 Site 3' },
    { portfolio_id: 8, name: 'NE3 Site 4' },
    { portfolio_id: 8, name: 'NE3 Site 5' },
    
    // Nor Cal 1
    { portfolio_id: 9, name: 'NC1 Site 1' },
    { portfolio_id: 9, name: 'NC1 Site 2' },
    { portfolio_id: 9, name: 'NC1 Site 3' },
    { portfolio_id: 9, name: 'NC1 Site 4' },
    { portfolio_id: 9, name: 'NC1 Site 5' },
    
    // Nor Cal 2
    { portfolio_id: 10, name: 'NC2 Site 1' },
    { portfolio_id: 10, name: 'NC2 Site 2' },
    { portfolio_id: 10, name: 'NC2 Site 3' },
    { portfolio_id: 10, name: 'NC2 Site 4' },
    { portfolio_id: 10, name: 'NC2 Site 5' },
    
    // So Cal 1
    { portfolio_id: 11, name: 'SC1 Site 1' },
    { portfolio_id: 11, name: 'SC1 Site 2' },
    { portfolio_id: 11, name: 'SC1 Site 3' },
    { portfolio_id: 11, name: 'SC1 Site 4' },
    { portfolio_id: 11, name: 'SC1 Site 5' },
    
    // So Cal 2
    { portfolio_id: 12, name: 'SC2 Site 1' },
    { portfolio_id: 12, name: 'SC2 Site 2' },
    { portfolio_id: 12, name: 'SC2 Site 3' },
    { portfolio_id: 12, name: 'SC2 Site 4' },
    { portfolio_id: 12, name: 'SC2 Site 5' },
    
    // So Cal 3
    { portfolio_id: 13, name: 'SC3 Site 1' },
    { portfolio_id: 13, name: 'SC3 Site 2' },
    { portfolio_id: 13, name: 'SC3 Site 3' },
    { portfolio_id: 13, name: 'SC3 Site 4' },
    { portfolio_id: 13, name: 'SC3 Site 5' },
    
    // Guarantee Sites
    { portfolio_id: 14, name: 'GS Site 1' },
    { portfolio_id: 14, name: 'GS Site 2' },
    { portfolio_id: 14, name: 'GS Site 3' },
    { portfolio_id: 14, name: 'GS Site 4' },
    { portfolio_id: 14, name: 'GS Site 5' },
    
    // Intermountain West
    { portfolio_id: 15, name: 'IW Site 1' },
    { portfolio_id: 15, name: 'IW Site 2' },
    { portfolio_id: 15, name: 'IW Site 3' },
    { portfolio_id: 15, name: 'IW Site 4' },
    { portfolio_id: 15, name: 'IW Site 5' },
    
    // Aurora
    { portfolio_id: 16, name: 'Aurora' },
    { portfolio_id: 16, name: 'Aurora Site 1' },
    { portfolio_id: 16, name: 'Aurora Site 2' },
    { portfolio_id: 16, name: 'Aurora Site 3' },
    { portfolio_id: 16, name: 'Aurora Site 4' },
    
    // Chint
    { portfolio_id: 17, name: 'Chint' },
    { portfolio_id: 17, name: 'Chint Site 1' },
    { portfolio_id: 17, name: 'Chint Site 2' },
    { portfolio_id: 17, name: 'Chint Site 3' },
    { portfolio_id: 17, name: 'Chint Site 4' },
    
    // Locus
    { portfolio_id: 18, name: 'Locus' },
    { portfolio_id: 18, name: 'Locus Site 1' },
    { portfolio_id: 18, name: 'Locus Site 2' },
    { portfolio_id: 18, name: 'Locus Site 3' },
    { portfolio_id: 18, name: 'Locus Site 4' },
    
    // SolrenView
    { portfolio_id: 19, name: 'SolrenView' },
    { portfolio_id: 19, name: 'SolrenView Site 1' },
    { portfolio_id: 19, name: 'SolrenView Site 2' },
    { portfolio_id: 19, name: 'SolrenView Site 3' },
    { portfolio_id: 19, name: 'SolrenView Site 4' },
    
    // SolarEdge
    { portfolio_id: 20, name: 'SolarEdge' },
    { portfolio_id: 20, name: 'SolarEdge Site 1' },
    { portfolio_id: 20, name: 'SolarEdge Site 2' },
    { portfolio_id: 20, name: 'SolarEdge Site 3' },
    { portfolio_id: 20, name: 'SolarEdge Site 4' },
    
    // eG/GByte/PD/GPM
    { portfolio_id: 21, name: 'eG Site 1' },
    { portfolio_id: 21, name: 'GByte Site 1' },
    { portfolio_id: 21, name: 'PD Site 1' },
    { portfolio_id: 21, name: 'GPM Site 1' },
    { portfolio_id: 21, name: 'eG Site 2' },
    
    // Power Factor
    { portfolio_id: 22, name: 'Power Factor' },
    { portfolio_id: 22, name: 'PF Site 1' },
    { portfolio_id: 22, name: 'PF Site 2' },
    { portfolio_id: 22, name: 'PF Site 3' },
    { portfolio_id: 22, name: 'PF Site 4' }
  ];

  // Insert sample portfolios
  const insertPortfolio = db.prepare('INSERT OR IGNORE INTO portfolios (name) VALUES (?)');
  samplePortfolios.forEach(portfolio => {
    insertPortfolio.run(portfolio.name);
  });
  insertPortfolio.finalize();

  // Insert sample sites
  const insertSite = db.prepare('INSERT OR IGNORE INTO sites (portfolio_id, name) VALUES (?, ?)');
  sampleSites.forEach(site => {
    insertSite.run(site.portfolio_id, site.name);
  });
  insertSite.finalize();
});

module.exports = db;
