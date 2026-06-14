import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import Animated, { FadeInDown, FadeIn, Layout } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Clock, Globe, Search, Trash2, X, ChevronRight } from 'lucide-react-native';
import { COLORS, FONT, RADIUS, SPACING } from '../utils/design';
import { GlassCard } from '../components/cards/GlassCard';
import { useBrowserStore } from '../store/browserStore';

const formatRelativeTime = (date: Date) => {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

export const HistoryScreen: React.FC = () => {
  const { history, clearHistory, navigateTo } = useBrowserStore();
  const [query, setQuery] = useState('');

  const filtered = history.filter(h =>
    h.title.toLowerCase().includes(query.toLowerCase()) ||
    h.url.toLowerCase().includes(query.toLowerCase())
  );

  const handleClearAll = () => {
    Alert.alert('Clear History', 'Remove all browsing history?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear All', style: 'destructive', onPress: clearHistory },
    ]);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#07080F', '#000000']} style={StyleSheet.absoluteFill} />

      <Animated.View entering={FadeInDown.springify()} style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>History</Text>
          <Text style={styles.headerSub}>{history.length} visits</Text>
        </View>
        {history.length > 0 && (
          <Pressable onPress={handleClearAll} style={styles.clearBtn}>
            <BlurView intensity={15} tint="dark" style={StyleSheet.absoluteFill} />
            <View style={styles.clearBtnBorder} />
            <Trash2 size={15} color={COLORS.rose} />
            <Text style={styles.clearBtnText}>Clear</Text>
          </Pressable>
        )}
      </Animated.View>

      {/* Search */}
      <Animated.View entering={FadeInDown.delay(80).springify()} style={styles.searchWrap}>
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
        <LinearGradient
          colors={['rgba(255,255,255,0.07)', 'rgba(255,255,255,0.02)']}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.searchBorder} />
        <Search size={16} color={COLORS.textTertiary} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search history"
          placeholderTextColor={COLORS.textTertiary}
          style={styles.searchInput}
          selectionColor={COLORS.flame}
          keyboardAppearance="dark"
        />
        {query.length > 0 && (
          <Pressable onPress={() => setQuery('')}>
            <X size={15} color={COLORS.textTertiary} />
          </Pressable>
        )}
      </Animated.View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <Animated.View entering={FadeIn.delay(200)} style={styles.emptyState}>
            <Clock size={48} color={COLORS.textTertiary} />
            <Text style={styles.emptyTitle}>{query ? 'No results' : 'No history yet'}</Text>
            <Text style={styles.emptySub}>Your visited pages will appear here</Text>
          </Animated.View>
        ) : (
          filtered.map((item, i) => {
            const domain = item.url.replace(/^https?:\/\//, '').split('/')[0];
            return (
              <Animated.View
                key={item.id}
                entering={FadeInDown.delay(i * 40).springify()}
                layout={Layout.springify()}
              >
                <GlassCard
                  style={styles.card}
                  onPress={() => navigateTo(item.url)}
                  intensity="low"
                  radius={RADIUS.xl}
                >
                  <View style={styles.cardInner}>
                    <View style={styles.iconWrap}>
                      <Globe size={15} color={COLORS.textSecondary} />
                    </View>
                    <View style={styles.cardText}>
                      <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                      <View style={styles.metaRow}>
                        <Text style={styles.cardUrl} numberOfLines={1}>{domain}</Text>
                        <Text style={styles.dot}>·</Text>
                        <Text style={styles.timeText}>{formatRelativeTime(item.visitedAt)}</Text>
                      </View>
                    </View>
                    <ChevronRight size={14} color={COLORS.textTertiary} />
                  </View>
                </GlassCard>
              </Animated.View>
            );
          })
        )}
        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.void },
  header: {
    paddingTop: 60, paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.base,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  headerTitle: { fontSize: FONT.xxl, fontWeight: FONT.bold, color: COLORS.textPrimary },
  headerSub: { fontSize: FONT.sm, color: COLORS.textTertiary, marginTop: 2 },
  clearBtn: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.xs,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full, overflow: 'hidden',
  },
  clearBtnBorder: {
    ...StyleSheet.absoluteFill,
    borderRadius: RADIUS.full, borderWidth: 1, borderColor: 'rgba(244,63,94,0.25)',
  },
  clearBtnText: { fontSize: FONT.sm, color: COLORS.rose, fontWeight: FONT.medium },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    marginHorizontal: SPACING.xl, marginBottom: SPACING.base,
    borderRadius: RADIUS.full, overflow: 'hidden',
    paddingHorizontal: SPACING.base, height: 46,
  },
  searchBorder: {
    ...StyleSheet.absoluteFill,
    borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.glassBorder,
  },
  searchInput: {
    flex: 1, color: COLORS.textPrimary, fontSize: FONT.base, padding: 0,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: SPACING.xl },
  card: { marginBottom: SPACING.sm, borderRadius: RADIUS.xl, overflow: 'hidden' },
  cardInner: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, gap: SPACING.md },
  iconWrap: {
    width: 34, height: 34, borderRadius: RADIUS.sm,
    backgroundColor: COLORS.glass, alignItems: 'center', justifyContent: 'center',
  },
  cardText: { flex: 1 },
  cardTitle: { fontSize: FONT.sm, fontWeight: FONT.medium, color: COLORS.textPrimary },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  cardUrl: { fontSize: FONT.xs, color: COLORS.textTertiary },
  dot: { fontSize: FONT.xs, color: COLORS.textDisabled },
  timeText: { fontSize: FONT.xs, color: COLORS.textTertiary },
  emptyState: { alignItems: 'center', paddingTop: 80, gap: SPACING.md },
  emptyTitle: { fontSize: FONT.lg, fontWeight: FONT.semibold, color: COLORS.textSecondary },
  emptySub: { fontSize: FONT.base, color: COLORS.textTertiary },
});
