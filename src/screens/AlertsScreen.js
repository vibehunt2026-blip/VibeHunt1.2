import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme/colors';
import { mockAlerts } from '../data/MockData';

const TYPE_COLORS = {
  event_hot:    colors.secondary,
  friend_checkin: colors.success,
  badge:        colors.accent,
  xp:           colors.primary,
  event_suggest: colors.primaryLight,
  buddy:        '#06B6D4',
  tribe:        '#8B5CF6',
  event_reminder: colors.textSecondary,
};

function AlertRow({ alert, onPress }) {
  const [read, setRead] = useState(alert.read);
  const accentColor = TYPE_COLORS[alert.type] || colors.primary;

  return (
    <TouchableOpacity
      style={[styles.alertRow, !read && styles.alertRowUnread]}
      onPress={() => { setRead(true); onPress?.(alert); }}
      activeOpacity={0.82}
    >
      {!read && <View style={[styles.unreadBar, { backgroundColor: accentColor }]} />}
      <View style={[styles.iconWrap, { backgroundColor: `${accentColor}22` }]}>
        <Text style={styles.iconEmoji}>{alert.icon}</Text>
      </View>
      <View style={styles.alertContent}>
        <View style={styles.alertTop}>
          <Text style={[styles.alertTitle, !read && styles.alertTitleBold]}>{alert.title}</Text>
          <Text style={styles.alertTime}>{alert.time}</Text>
        </View>
        <Text style={styles.alertBody}>{alert.body}</Text>
        {alert.action && (
          <TouchableOpacity style={[styles.actionBtn, { borderColor: accentColor }]}>
            <Text style={[styles.actionText, { color: accentColor }]}>{alert.action}</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function AlertsScreen() {
  const [alerts, setAlerts] = useState(mockAlerts);
  const unreadCount = alerts.filter(a => !a.read).length;

  const markAllRead = () => setAlerts(prev => prev.map(a => ({ ...a, read: true })));

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: colors.bg }}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Alertas</Text>
            {unreadCount > 0 && (
              <Text style={styles.subtitle}>{unreadCount} não lidos</Text>
            )}
          </View>
          {unreadCount > 0 && (
            <TouchableOpacity style={styles.markBtn} onPress={markAllRead}>
              <Ionicons name="checkmark-done-outline" size={18} color={colors.primary} />
              <Text style={styles.markText}>Marcar tudo</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filter tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          {['Todos', '🔥 Eventos', '👥 Social', '🏆 Conquistas'].map((t, i) => (
            <TouchableOpacity key={t} style={[styles.tab, i === 0 && styles.tabActive]}>
              <Text style={[styles.tabText, i === 0 && styles.tabTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {/* Unread section */}
        {unreadCount > 0 && (
          <>
            <Text style={styles.groupLabel}>Novos</Text>
            {alerts.filter(a => !a.read).map(a => (
              <AlertRow
                key={a.id}
                alert={a}
                onPress={() => setAlerts(prev => prev.map(x => x.id === a.id ? { ...x, read: true } : x))}
              />
            ))}
            <Text style={styles.groupLabel}>Anteriores</Text>
          </>
        )}
        {alerts.filter(a => a.read).map(a => (
          <AlertRow key={a.id} alert={a} />
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: { color: colors.textPrimary, fontSize: 26, fontWeight: '800' },
  subtitle: { color: colors.primary, fontSize: 13, fontWeight: '600', marginTop: 2 },
  markBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(139,92,246,0.1)',
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: radius.full,
    marginTop: 4,
  },
  markText: { color: colors.primary, fontSize: 13, fontWeight: '600' },

  tabs: { paddingHorizontal: spacing.md, gap: 8, paddingBottom: spacing.sm },
  tab: {
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.bgCard,
    borderWidth: 1, borderColor: colors.border,
  },
  tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: colors.white },

  list: { flex: 1 },
  groupLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },

  alertRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
    position: 'relative',
  },
  alertRowUnread: { backgroundColor: 'rgba(139,92,246,0.04)' },
  unreadBar: {
    position: 'absolute',
    left: 0, top: 0, bottom: 0,
    width: 3, borderRadius: 2,
  },
  iconWrap: {
    width: 46, height: 46, borderRadius: 23,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  iconEmoji: { fontSize: 22 },
  alertContent: { flex: 1 },
  alertTop: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    marginBottom: 3,
  },
  alertTitle: {
    color: colors.textSecondary, fontSize: 14, fontWeight: '500',
    flex: 1, marginRight: 8, lineHeight: 19,
  },
  alertTitleBold: { color: colors.textPrimary, fontWeight: '700' },
  alertTime: { color: colors.textMuted, fontSize: 11, flexShrink: 0 },
  alertBody: {
    color: colors.textSecondary, fontSize: 13, lineHeight: 18, marginBottom: 8,
  },
  actionBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  actionText: { fontSize: 12, fontWeight: '700' },
});