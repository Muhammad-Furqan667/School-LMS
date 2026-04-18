import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase credentials in environment variables');
}

/**
 * The centralized Supabase client instance.
 * All database interactions should go through services that utilize this client.
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
