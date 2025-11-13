const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Adding updated_at column...\n');

db.serialize(() => {
  // Check if updated_at exists
  db.all("PRAGMA table_info(portfolios)", (err, columns) => {
    if (err) {
      console.error('❌ Error:', err);
      db.close();
      return;
    }

    const hasUpdatedAt = columns.some(col => col.name === 'updated_at');
    
    if (!hasUpdatedAt) {
      // SQLite doesn't allow CURRENT_TIMESTAMP as default in ALTER TABLE
      // So we add it without default, then update existing rows
      db.run("ALTER TABLE portfolios ADD COLUMN updated_at DATETIME", (err) => {
        if (err) {
          console.error('❌ Error adding updated_at:', err);
        } else {
          console.log('✅ Added updated_at column');
          
          // Update existing rows to set updated_at to current timestamp
          db.run("UPDATE portfolios SET updated_at = CURRENT_TIMESTAMP WHERE updated_at IS NULL", (err) => {
            if (err) {
              console.error('❌ Error updating existing rows:', err);
            } else {
              console.log('✅ Updated existing rows with current timestamp');
            }
            
            // Verify
            db.all("PRAGMA table_info(portfolios)", (err, newColumns) => {
              if (err) {
                console.error('❌ Error verifying:', err);
              } else {
                console.log('\n📋 Current columns:');
                newColumns.forEach(col => {
                  console.log(`   - ${col.name} (${col.type})`);
                });
                console.log('\n✨ Database is ready!');
              }
              db.close();
            });
          });
        }
      });
    } else {
      console.log('✅ updated_at column already exists!');
      db.close();
    }
  });
});
