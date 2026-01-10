/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

// Access environment variables (Vite uses import.meta.env)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env file");
}

export const supabase = createClient(supabaseUrl, supabaseKey);