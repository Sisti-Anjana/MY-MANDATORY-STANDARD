const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wkkclsbaavdlplcqrsyr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indra2Nsc2JhYXZkbHBsY3Fyc3lyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2NTY2MzksImV4cCI6MjA3NzIzMjYzOX0.cz3vhJ-U9riaUjb7JBcf_didvZWRVZryjOgTIxmVmQ8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('🔍 Testing Supabase Connection...\n');
  
  // Test 1: Get portfolios
  console.log('TEST 1: Fetching portfolios...');
  const { data: portfolios, error: portfoliosError } = await supabase
    .from('portfolios')
    .select('*')
    .limit(5);
  
  if (portfoliosError) {
    console.error('❌ Error fetching portfolios:', portfoliosError);
  } else {
    console.log('✅ Successfully fetched', portfolios.length, 'portfolios');
    console.log('Sample portfolio:', portfolios[0]);
  }
  
  // Test 2: Get issues
  console.log('\nTEST 2: Fetching issues...');
  const { data: issues, error: issuesError } = await supabase
    .from('issues')
    .select('*')
    .limit(5);
  
  if (issuesError) {
    console.error('❌ Error fetching issues:', issuesError);
  } else {
    console.log('✅ Successfully fetched', issues.length, 'issues');
    if (issues.length > 0) {
      console.log('Sample issue:', issues[0]);
    }
  }
  
  // Test 3: Try to insert a test issue
  if (portfolios && portfolios.length > 0) {
    console.log('\nTEST 3: Attempting to insert test issue...');
    const testData = {
      portfolio_id: portfolios[0].portfolio_id,
      issue_hour: 10,
      issue_present: 'Yes',
      issue_details: 'TEST ISSUE - Please ignore',
      case_number: 'TEST-001',
      monitored_by: 'Kumar S',
      entered_by: 'Test Script'
    };
    
    console.log('Data to insert:', testData);
    
    const { data: insertData, error: insertError } = await supabase
      .from('issues')
      .insert([testData])
      .select();
    
    if (insertError) {
      console.error('❌ Insert Error:');
      console.error('Code:', insertError.code);
      console.error('Message:', insertError.message);
      console.error('Details:', insertError.details);
      console.error('Hint:', insertError.hint);
    } else {
      console.log('✅ Successfully inserted test issue!');
      console.log('Inserted data:', insertData);
      
      // Clean up
      const { error: deleteError } = await supabase
        .from('issues')
        .delete()
        .eq('issue_id', insertData[0].issue_id);
      
      if (!deleteError) {
        console.log('✅ Test issue deleted');
      }
    }
  }
  
  console.log('\n✅ All tests completed!');
}

testConnection().catch(console.error);
