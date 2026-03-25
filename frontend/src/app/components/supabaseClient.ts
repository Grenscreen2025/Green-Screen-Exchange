import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ntxzpearypxruddvsciv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50eHpwZWFyeXB4cnVkZHZzY2l2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3OTgyMjEsImV4cCI6MjA4OTM3NDIyMX0.oqxYSosdxvpa949h2CwpK_0GbbeP8jB6VYgzLTqsCv8';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);