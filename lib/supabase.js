// src/lib/supabase.js
//
// ⚠️  Substitui os valores abaixo pelas tuas credenciais:
//      Supabase Dashboard → Settings → API
//
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL      = 'https://rroptuofcdbntohoozrx.supabase.co'; // ← altera
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyb3B0dW9mY2RibnRvaG9venJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMTk2NTUsImV4cCI6MjA4OTY5NTY1NX0.Fik3cOq4W6pmDZAlJy9hafBI-U9FrzFlPVKKCiTRI34';                        // ← altera

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage:            AsyncStorage,
    autoRefreshToken:   true,
    persistSession:     true,
    detectSessionInUrl: false,  // obrigatório em React Native
  },
});