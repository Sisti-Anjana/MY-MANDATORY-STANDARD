const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'server', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Checking database schema...\n');

// Check if all_sites_checked column exists
db.all("PRAGMA table_info(portfolios)", (err, columns) => {
  if (err) {
    console.error('❌ Error checking database:', err);
    db.close();
    return;
  }

  console.log('📋 Current columns in portfolios table:');
  columns.forEach(col => {
    console.log(`   - ${col.name} (${col.type})`);
  });

  const hasAllSitesChecked = columns.some(col => col.name === 'all_sites_checked');
  const hasUpdatedAt = columns.some(col => col.name === 'updated_at');

  if (!hasAllSitesChecked || !hasUpdatedAt) {
    console.log('\n⚠️  Missing required columns. Adding them now...\n');

    db.serialize(() => {
      // Add all_sites_checked column if missing
      if (!hasAllSitesChecked) {
        db.run("ALTER TABLE portfolios ADD COLUMN all_sites_checked INTEGER DEFAULT 0", (err) => {
          if (err) {
            console.error('❌ Error adding all_sites_checked column:', err);
          } else {
            console.log('✅ Added all_sites_checked column');
          }
        });
      }

      // Add updated_at column if missing
      if (!hasUpdatedAt) {
        db.run("ALTER TABLE portfolios ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP", (err) => {
          if (err) {
            console.error('❌ Error adding updated_at column:', err);
          } else {
            console.log('✅ Added updated_at column');
          }
        });
      }

      // Create trigger for auto-updating updated_at
      db.run("DROP TRIGGER IF EXISTS update_portfolios_updated_at", (err) => {
        if (err) console.error('Note: Error dropping old trigger:', err);
      });

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
          console.error('❌ Error creating trigger:', err);
        } else {
          console.log('✅ Created update trigger');
        }

        // Verify the changes
        console.log('\n🔍 Verifying changes...\n');
        db.all("PRAGMA table_info(portfolios)", (err, newColumns) => {
          if (err) {
            console.error('❌ Error verifying:', err);
          } else {
            console.log('📋 Updated columns in portfolios table:');
            newColumns.forEach(col => {
              console.log(`   - ${col.name} (${col.type})`);
            });
            console.log('\n✨ Database is ready!');
          }
          db.close();
        });
      });
    });
  } else {
    console.log('\n✅ Database already has all required columns!');
    db.close();
  }
});
