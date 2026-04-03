// lib/supabase.js

import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL      = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const hasValidConfig =
  SUPABASE_URL &&
  SUPABASE_ANON_KEY &&
  SUPABASE_URL.startsWith('https://') &&
  !SUPABASE_URL.includes('placeholder');

if (__DEV__ && !hasValidConfig) {
  console.warn(
    '[VibeHunt] ⚠️  Supabase não configurado — a app usa apenas mockData.\n' +
    'Cria um .env com EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY.'
  );
}

// Só cria o cliente real se as credenciais forem válidas.
// Caso contrário exporta null — os serviços (eventService, etc.)
// já têm fallback para mockData quando a query falha ou o cliente é null.
export const supabase = hasValidConfig
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage:            AsyncStorage,
        autoRefreshToken:   true,
        persistSession:     true,
        detectSessionInUrl: false,
      },
    })
  : null;