import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env, getSupabaseKey } from './env.js';
import { Database } from '../types/index.js';

const supabaseUrl = env.SUPABASE_URL;
const supabaseKey = getSupabaseKey();

export const supabase: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl,
  supabaseKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);
