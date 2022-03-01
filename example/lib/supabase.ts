import { createClient } from '@supabase/supabase-js'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, '1', {
  fetch: (...args) => fetch(...args),
  autoRefreshToken: false,
  persistSession: false,
  detectSessionInUrl: false,
})

export default supabase
