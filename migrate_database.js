// Quick Database Migration Script
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'server', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('🔧 Starting database migration...');

db.serialize(() => {
  // Add all_sites_checked column
  db.run(`ALTER TABLE portfolios ADD COLUMN all_sites_checked INTEGER DEFAULT 0`, (err) => {
    if (err) {
      if (err.message.includes('duplicate column')) {
        console.log('✅ Column all_sites_checked already exists');
      } else {
        console.error('❌ Error adding all_sites_checked:', err.message);
      }
    } else {
      console.log('✅ Added column: all_sites_checked');
    }
  });

  // Add updated_at column
  db.run(`ALTER TABLE portfolios ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP`, (err) => {
    if (err) {
      if (err.message.includes('duplicate column')) {
        console.log('✅ Column updated_at already exists');
      } else {
        console.error('❌ Error adding updated_at:', err.message);
      }
    } else {
      console.log('✅ Added column: updated_at');
    }
  });

  // Drop existing trigger if it exists
  db.run(`DROP TRIGGER IF EXISTS update_portfolios_updated_at`, (err) => {
    if (err) {
      console.error('❌ Error dropping trigger:', err.message);
    } else {
      console.log('✅ Dropped old trigger (if existed)');
    }
  });

  // Create trigger
  db.run(`
    CREATE TRIGGER update_portfolios_updated_at
    AFTER UPDATE ON portfolios
    FOR EACH ROW
    BEGIN
      UPDATE portfolios 
      SET updated_at = CURRENT_TIMESTAMP 
      WHERE id = NEW.id;
    END
  `, (err) => {
    if (err) {
      console.error('❌ Error creating trigger:', err.message);
    } else {
      console.log('✅ Created trigger: update_portfolios_updated_at');
    }
  });

  // Verify the changes
  db.all(`SELECT name, all_sites_checked, updated_at FROM portfolios LIMIT 5`, (err, rows) => {
    if (err) {
      console.error('❌ Error verifying:', err.message);
    } else {
      console.log('\n✅ Migration complete! Verification:');
      console.table(rows);
    }
    
    db.close(() => {
      console.log('\n🎉 Database migration finished successfully!');
      console.log('👉 Now restart your server and client.');
    });
  });
});
