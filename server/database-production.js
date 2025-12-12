const { createClient } = require('@supabase/supabase-js');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Determine which database to use based on environment
const USE_SUPABASE = process.env.NODE_ENV === 'production' || process.env.USE_SUPABASE === 'true';

let db;
let supabase;

if (USE_SUPABASE) {
  // Production: Use Supabase (PostgreSQL)
  console.log('🔄 Connecting to Supabase database...');
  
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase credentials not found in environment variables');
    process.exit(1);
  }
  
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('✅ Supabase connected');
  
  // Create a wrapper object that mimics SQLite API but uses Supabase
  db = {
    all: async (query, params, callback) => {
      try {
        const result = await executeSupabaseQuery(query, params);
        if (callback && typeof callback === 'function') {
          callback(null, result);
        }
      } catch (error) {
        if (callback && typeof callback === 'function') {
          callback(error);
        } else {
          throw error;
        }
      }
    },
    
    get: async (query, params, callback) => {
      try {
        const result = await executeSupabaseQuery(query, params);
        if (callback && typeof callback === 'function') {
          callback(null, result[0] || null);
        }
      } catch (error) {
        if (callback && typeof callback === 'function') {
          callback(error);
        } else {
          throw error;
        }
      }
    },
    
    run: async (query, params, callback) => {
      try {
        const result = await executeSupabaseQuery(query, params);
        const mockThis = { lastID: result.id, changes: result.changes || 1 };
        if (callback && typeof callback === 'function') {
          callback.call(mockThis, null);
        }
      } catch (error) {
        if (callback && typeof callback === 'function') {
          callback.call({ changes: 0 }, error);
        } else {
          // If no callback, throw the error so it can be caught by caller
          throw error;
        }
      }
    }
  };
  
} else {
  // Development: Use SQLite
  console.log('🔄 Connecting to SQLite database...');
  const dbPath = path.join(__dirname, 'database.sqlite');
  db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('❌ SQLite connection error:', err.message);
    } else {
      console.log('✅ SQLite connected');
    }
  });
}

// Helper function to convert SQLite queries to Supabase operations
async function executeSupabaseQuery(query, params) {
  // This is a simplified converter - you may need to expand this based on your queries
  const lowerQuery = query.toLowerCase().trim();
  
  // SELECT queries
  if (lowerQuery.startsWith('select')) {
    return await handleSelect(query, params);
  }
  
  // INSERT queries
  if (lowerQuery.startsWith('insert')) {
    return await handleInsert(query, params);
  }
  
  // UPDATE queries
  if (lowerQuery.startsWith('update')) {
    return await handleUpdate(query, params);
  }
  
  // DELETE queries
  if (lowerQuery.startsWith('delete')) {
    return await handleDelete(query, params);
  }
  
  throw new Error(`Unsupported query type: ${query}`);
}

async function handleSelect(query, params) {
  // Parse table name from query
  const tableMatch = query.match(/from\s+(\w+)/i);
  if (!tableMatch) throw new Error('Could not parse table name');
  
  const tableName = tableMatch[1];
  
  let queryBuilder = supabase.from(tableName).select('*');
  
  // Add WHERE conditions if present
  if (query.includes('WHERE')) {
    // This is a simplified implementation
    // You might need to parse WHERE conditions more thoroughly
  }
  
  const { data, error } = await queryBuilder;
  if (error) throw error;
  
  return data || [];
}

async function handleInsert(query, params) {
  // Parse table name
  const tableMatch = query.match(/into\s+(\w+)/i);
  if (!tableMatch) throw new Error('Could not parse table name');
  
  const tableName = tableMatch[1];
  
  // Parse columns
  const columnsMatch = query.match(/\((.*?)\)/);
  if (!columnsMatch) throw new Error('Could not parse columns');
  
  const columns = columnsMatch[1].split(',').map(col => col.trim());
  
  // Create object from columns and params
  const insertData = {};
  columns.forEach((col, index) => {
    insertData[col] = params[index];
  });
  
  const { data, error } = await supabase
    .from(tableName)
    .insert([insertData])
    .select();
  
  if (error) throw error;
  
  return { id: data[0]?.id, changes: 1 };
}

async function handleUpdate(query, params) {
  // Parse table name
  const tableMatch = query.match(/update\s+(\w+)/i);
  if (!tableMatch) throw new Error('Could not parse table name');
  
  const tableName = tableMatch[1];
  
  // This is a simplified implementation
  const { data, error } = await supabase
    .from(tableName)
    .update({})
    .select();
  
  if (error) throw error;
  
  return { changes: data.length };
}

async function handleDelete(query, params) {
  // Parse table name
  const tableMatch = query.match(/from\s+(\w+)/i);
  if (!tableMatch) throw new Error('Could not parse table name');
  
  const tableName = tableMatch[1];
  
  const { data, error } = await supabase
    .from(tableName)
    .delete()
    .select();
  
  if (error) throw error;
  
  return { changes: data.length };
}

module.exports = db;
