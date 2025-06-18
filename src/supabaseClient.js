import { createClient } from '@supabase/supabase-js';
export const supabase = createClient(
  'https://txvosnctfvxuesuoifck.supabase.co',
  'YOUR_PUBLIC_ANON_KEY'
);
