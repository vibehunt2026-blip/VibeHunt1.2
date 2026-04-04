// lib/supabase.js
//
// ─── PASSO 1 ──────────────────────────────────────────────────────────────────
// Enquanto não tens as credenciais Supabase, este ficheiro exporta null.
// A app corre com mockData sem qualquer erro.
//
// ─── PASSO 2 (quando tiveres o projeto Supabase criado) ──────────────────────
// 1. Cria um ficheiro .env na raiz do projeto:
//      EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
//      EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
//
// 2. Substitui todo o conteúdo deste ficheiro por:
//
//    import 'react-native-url-polyfill/auto';
//    import { createClient } from '@supabase/supabase-js';
//    import AsyncStorage from '@react-native-async-storage/async-storage';
//
//    export const supabase = createClient(
//      process.env.EXPO_PUBLIC_SUPABASE_URL,
//      process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
//      {
//        auth: {
//          storage: AsyncStorage,
//          autoRefreshToken: true,
//          persistSession: true,
//          detectSessionInUrl: false,
//        },
//      }
//    );
//
// 3. Corre: npx expo start --clear
// ─────────────────────────────────────────────────────────────────────────────

export const supabase = null;