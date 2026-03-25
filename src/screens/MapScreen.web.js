// src/screens/MapScreen.web.js
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme/colors';

export default function MapScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      
      {/* ── Header simulado na Web ────────────────────────────────── */}
      <SafeAreaView style={{ backgroundColor: colors.bg }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: spacing.md }}>
          <Text style={{ color: colors.textPrimary, fontSize: 22, fontWeight: '800' }}>Explorar</Text>
          <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: colors.bgCard, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="options-outline" size={22} color={colors.textPrimary} />
          </View>
        </View>
      </SafeAreaView>

      {/* ── Mensagem de Fallback para PC ────────────────────────────── */}
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#12121A' }}>
        <Text style={{ fontSize: 60, marginBottom: 20 }}>🗺️</Text>
        <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>
          Mapa Exclusivo do Telemóvel
        </Text>
        <Text style={{ color: colors.textSecondary, textAlign: 'center', paddingHorizontal: 40, maxWidth: 400, lineHeight: 20 }}>
          O módulo nativo de mapas não corre no browser. Podes testar o Login, Perfil e Listas aqui no PC! No telemóvel o mapa funcionará a 100%.
        </Text>
      </View>
    </View>
  );
}