import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAuditAccounts() {
  console.log('Re-creating teach_audit...');
  const { data: teachData, error: teachError } = await supabase.auth.admin.createUser({
    email: 'teach_audit@schooling.app',
    password: 'Password123!',
    email_confirm: true,
    user_metadata: { role: 'teacher' },
    app_metadata: { role: 'teacher' }
  });
  if (teachError) console.error('Teach Error:', teachError);
  else console.log('Teach Audit Created:', teachData.user.id);

  console.log('Re-creating parent_audit...');
  const { data: parentData, error: parentError } = await supabase.auth.admin.createUser({
    email: 'parent_audit@schooling.app',
    password: 'Password123!',
    email_confirm: true,
    user_metadata: { role: 'parent' },
    app_metadata: { role: 'parent' }
  });
  if (parentError) console.error('Parent Error:', parentError);
  else console.log('Parent Audit Created:', parentData.user.id);
}

createAuditAccounts();
