import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lwadglqcejqjmacjajgw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3YWRnbHFjZWpxam1hY2phamd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3MzM5NzYsImV4cCI6MjA5MTMwOTk3Nn0.YaG1NTiTox85w6AiocbY3kjCBYpu5iPsfCyCnhRcQ4I';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seedAdmin() {
  console.log('--- SYSTEM INITIALIZATION: ADMIN SEEDING ---');
  
  const email = 'admin@schooling.app';
  const password = 'Password123!';
  const role = 'admin';

  // 1. Check if user exists in profiles
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', 'admin')
    .single();

  if (existingProfile) {
    console.log('✅ Admin profile already exists:', existingProfile.id);
    return;
  }

  console.log('🔄 Creating admin account...');
  
  // 2. Sign up the user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role,
        username: 'ADMIN'
      }
    }
  });

  if (authError) {
    if (authError.message.includes('already registered')) {
      console.log('ℹ️ Auth user exists but profile is missing. Attempting to fix...');
      // If user exists in auth but not profile, we need their UID.
      // We can't easily get it without the service key or the user logging in.
      console.error('❌ FATAL: Auth user exists but profile is missing. Please delete the user from Supabase Auth dashboard and run this script again.');
    } else {
      console.error('❌ Auth Error:', authError.message);
    }
    return;
  }

  if (authData.user) {
    console.log('✅ Sign up successful! UID:', authData.user.id);
    
    // 3. Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        username: 'admin',
        role: 'admin',
        is_active: true
      });

    if (profileError) {
      console.error('❌ Profile Creation Error:', profileError.message);
    } else {
      console.log('🚀 SYSTEM INITIALIZED: Admin account created.');
    }
  }
}

seedAdmin();
