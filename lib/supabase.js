import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fpisfuuqrmzvgsjmswyw.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwaXNmdXVxcm16dmdzam1zd3l3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyMzUwNjUsImV4cCI6MjA5MDgxMTA2NX0.GHzsYjSYGhRUg4XY5VZ2HQI3FQTLItwnZgN6E14dSPQ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

console.log('SUPABASE URL:', supabaseUrl)