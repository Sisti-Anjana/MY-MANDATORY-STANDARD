// QUICK FIX: Add Portfolios Directly from Browser Console
// Copy this entire code and paste it in your browser console (F12)

// Portfolio names
const portfolioNames = [
  'Aurora',
  'BESS & Trimark',
  'Chint',
  'eG/GByte/PD/GPM',
  'Guarantee Sites',
  'Intermountain West',
  'KK',
  'Locus',
  'Main Portfolio',
  'Mid Atlantic 1',
  'Mid Atlantic 2',
  'Midwest 1',
  'Midwest 2',
  'New England 1',
  'New England 2',
  'New England 3',
  'Nor Cal 1',
  'Nor Cal 2',
  'PLF',
  'Power Factor',
  'Secondary Portfolio',
  'So Cal 1',
  'So Cal 2',
  'So Cal 3',
  'SolarEdge',
  'SolrenView'
];

// Import Supabase client
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wkkclsbaavdlplcqrsyr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrY2xzYmFhdmRscGxjcXJzeXIiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTczMDY0MzcyMywiZXhwIjoyMDQ2MjE5NzIzfQ.f1cqPQJ5HBJ8vp7l_chCQIZ2A3dHm6l03wC5J1nP-NI';

const supabase = createClient(supabaseUrl, supabaseKey);

// Function to add all portfolios
async function addAllPortfolios() {
  console.log('🚀 Starting to add portfolios...');
  
  try {
    // First, check if portfolios table exists
    const { data: existingPortfolios, error: checkError } = await supabase
      .from('portfolios')
      .select('name')
      .limit(1);
    
    if (checkError) {
      console.error('❌ Error checking portfolios table:', checkError);
      console.log('💡 The portfolios table might not exist. Please run DATABASE_SETUP.sql first.');
      return;
    }
    
    console.log('✅ Portfolios table exists');
    
    // Get existing portfolio names
    const { data: allExisting } = await supabase
      .from('portfolios')
      .select('name');
    
    const existingNames = new Set((allExisting || []).map(p => p.name));
    console.log(`📊 Found ${existingNames.size} existing portfolios`);
    
    // Add portfolios that don't exist
    let addedCount = 0;
    for (const name of portfolioNames) {
      if (!existingNames.has(name)) {
        const { error } = await supabase
          .from('portfolios')
          .insert([{ name }]);
        
        if (error) {
          console.error(`❌ Error adding ${name}:`, error);
        } else {
          console.log(`✅ Added: ${name}`);
          addedCount++;
        }
      } else {
        console.log(`⏭️  Skipped (already exists): ${name}`);
      }
    }
    
    console.log(`\n🎉 DONE! Added ${addedCount} new portfolios`);
    console.log('📊 Total portfolios should be:', portfolioNames.length);
    
    // Verify
    const { data: finalCount } = await supabase
      .from('portfolios')
      .select('name');
    
    console.log(`✅ Verified: ${finalCount.length} portfolios in database`);
    console.log('\n🔄 Please refresh the page (F5) to see portfolios in dropdown!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the function
addAllPortfolios();
