// ─────────────────────────────────────────────────────────────────────────────
// src/lib/supabase.js
//
// Cliente Supabase — ponto único de inicialização em toda a app.
//
// CONFIGURAÇÃO:
//   Cria um ficheiro .env na raiz do projeto com as variáveis:
//     EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
//     EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
//
// ATENÇÃO:
//   ⚠️  Nunca coloca as credenciais directamente neste ficheiro.
//   ⚠️  O prefixo EXPO_PUBLIC_ é obrigatório para o Expo expor a variável
//       ao bundle do cliente. Sem ele, process.env retorna undefined.
//   ⚠️  Adiciona .env ao .gitignore antes de qualquer commit.
//
// TODOS OS IMPORTS DEVEM VIR DAQUI:
//   import { supabase } from '../../../lib/supabase';
//   (ajusta o número de ../ conforme a profundidade do ficheiro)
// ─────────────────────────────────────────────────────────────────────────────

import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ── Leitura das variáveis de ambiente ─────────────────────────────────────────
// Em desenvolvimento, se as variáveis não existirem, lança um aviso claro
// em vez de um erro críptico do Supabase mais tarde.
const SUPABASE_URL      = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (__DEV__ && (!SUPABASE_URL || !SUPABASE_ANON_KEY)) {
  console.warn(
    '[VibeHunt] ⚠️  Variáveis de ambiente do Supabase em falta.\n' +
    'Cria um ficheiro .env na raiz com:\n' +
    '  EXPO_PUBLIC_SUPABASE_URL=...\n' +
    '  EXPO_PUBLIC_SUPABASE_ANON_KEY=...\n' +
    'A app vai usar apenas os dados locais (mockData) até esta configuração ser feita.'
  );
}

// ── Criação do cliente ────────────────────────────────────────────────────────
// Mesmo que as variáveis sejam undefined, o cliente é criado com strings vazias
// para não crashar. O fallback para mockData no eventService garante que a app
// continua a funcionar no modo de desenvolvimento.
export const supabase = createClient(
  SUPABASE_URL      ?? 'https://placeholder.supabase.co',
  SUPABASE_ANON_KEY ?? 'placeholder-key',
  {
    auth: {
      storage:            AsyncStorage,
      autoRefreshToken:   true,
      persistSession:     true,
      detectSessionInUrl: false, // obrigatório em React Native (sem browser URL)
    },
  }
);