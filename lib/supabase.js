// lib/supabase.js
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

let supabase = null;

try {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  if (
    url &&
    key &&
    typeof url === 'string' &&
    typeof key === 'string' &&
    url.startsWith('https://')
  ) {
    supabase = createClient(url, key, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  } else {
    console.log('[VibeHunt] Supabase não configurado — a usar mockData.');
  }
} catch (e) {
  console.log('[VibeHunt] Supabase falhou ao inicializar:', e.message);
  supabase = null;
}

export { supabase };