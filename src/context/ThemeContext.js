// src/context/ThemeContext.js
//
// Sistema de tema com pré-visualização e confirmação.
//
// Estados:
//   currentTheme  — tema confirmado e guardado em AsyncStorage
//   previewTheme  — tema que está a ser visualizado na UI (pode diferir)
//
// themeColors usa sempre previewTheme para que a app reaja em tempo real.
// Só ao chamar confirmTheme() é que o tema fica persistido.
// cancelPreview() reverte previewTheme para currentTheme.

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { darkColors, lightColors } from '../theme/colors';

const STORAGE_KEY = '@vibehunt_theme';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  // Tema confirmado (o que está guardado)
  const [currentTheme, setCurrentTheme] = useState('dark');
  // Tema em pré-visualização (pode diferir do currentTheme)
  const [previewTheme, setPreviewTheme]  = useState('dark');

  // ── Carrega o tema guardado ao arrancar ───────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved === 'light' || saved === 'dark') {
          setCurrentTheme(saved);
          setPreviewTheme(saved);
        }
      } catch {
        // Se AsyncStorage falhar, fica com o dark por omissão
      }
    })();
  }, []);

  // ── Aplica um tema em pré-visualização (sem guardar) ─────────────────────
  const applyPreview = useCallback((id) => {
    setPreviewTheme(id);
  }, []);

  // ── Confirma o tema em pré-visualização e guarda-o ───────────────────────
  const confirmTheme = useCallback(async () => {
    setCurrentTheme(previewTheme);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, previewTheme);
    } catch {
      // Falha silenciosa — o estado em memória já foi actualizado
    }
  }, [previewTheme]);

  // ── Cancela a pré-visualização e reverte para o tema confirmado ──────────
  const cancelPreview = useCallback(() => {
    setPreviewTheme(currentTheme);
  }, [currentTheme]);

  // Compatibilidade com código existente que chama toggleTheme(id)
  // (ex: chamadas directas fora do modal)
  const toggleTheme = useCallback((id) => {
    setCurrentTheme(id);
    setPreviewTheme(id);
    AsyncStorage.setItem(STORAGE_KEY, id).catch(() => {});
  }, []);

  // themeColors baseia-se sempre no previewTheme para feedback imediato
  const themeColors = previewTheme === 'dark' ? darkColors : lightColors;

  // isPreviewing = true quando há uma alteração por confirmar
  const isPreviewing = previewTheme !== currentTheme;

  return (
    <ThemeContext.Provider value={{
      theme: previewTheme,        // tema activo na UI
      currentTheme,               // tema guardado
      previewTheme,               // tema em preview (igual ao theme)
      isPreviewing,               // true se há alteração por confirmar
      applyPreview,               // aplica preview sem guardar
      confirmTheme,               // guarda o previewTheme
      cancelPreview,              // reverte preview para currentTheme
      toggleTheme,                // atalho compatível com código legado
      themeColors,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    // Fallback seguro se usado fora do provider
    return {
      theme: 'dark',
      currentTheme: 'dark',
      previewTheme: 'dark',
      isPreviewing: false,
      applyPreview: () => {},
      confirmTheme: async () => {},
      cancelPreview: () => {},
      toggleTheme: () => {},
      themeColors: darkColors,
    };
  }
  return ctx;
}