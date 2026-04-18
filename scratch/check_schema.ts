import { supabase } from '../src/lib/supabase';

async function checkResultsSchema() {
  const { data, error } = await supabase.rpc('get_table_columns', { table_name: 'results' });
  // If RPC is missing, use a direct query to information_schema if allowed, 
  // or just try to fetch one row and see the keys.
  
  const { data: oneRow } = await supabase.from('results').select('*').limit(1);
  console.log('Columns in results:', oneRow ? Object.keys(oneRow[0] || {}) : 'No rows found');
  
  // Try to get column info from information_schema
  const { data: columns, error: colError } = await supabase
    .from('information_schema.columns')
    .select('column_name, data_type, is_nullable')
    .eq('table_name', 'results');
    
  console.log('Columns Meta:', JSON.stringify(columns, null, 2));
}

checkResultsSchema();
