import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, TextInput,
} from 'react-native';
import Animated, {
  FadeInDown, FadeIn, useSharedValue, useAnimatedStyle,
  withSpring, withTiming, Layout,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import {
  Search, BookOpen, Globe, Trash2, ExternalLink,
  Star, FolderOpen, Plus,
} from 'lucide-react-native';
import { COLORS, FONT, RADIUS, SPACING, ANIMATION } from '../utils/design';
import { GlassCard } from '../components/cards/GlassCard';
import { useBrowserStore } from '../store/browserStore';

export const BookmarksScreen: React.FC = () => {
  const { bookmarks, removeBookmark, navigateTo } = useBrowserStore();
  const [query, setQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  const filtered = bookmarks.filter(b =>
    b.title.toLowerCase().includes(query.toLowerCase()) ||
    b.url.toLowerCase().includes(query.toLowerCase())
  );

  const focusScale = useSharedValue(1);
  const searchStyle = useAnimatedStyle(() => ({
    transform: [{ scale: focusScale.value }],
  }));

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#07080F', '#000000']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <Animated.View entering={FadeInDown.springify()} style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Bookmarks</Text>
          <Text style={styles.headerSub}>{bookmarks.length} saved</Text>
        </View>
        <Pressable style={styles.addBtn}>
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
          <LinearGradient colors={['rgba(255,77,0,0.2)', 'rgba(255,77,0,0.05)']} style={StyleSheet.absoluteFill} />
          <View style={styles.addBtnBorder} />
          <Plus size={18} color={COLORS.flame} />
        </Pressable>
      </Animated.View>

      {/* Search */}
      <Animated.View entering={FadeInDown.delay(80).springify()} style={[styles.searchWrap, searchStyle]}>
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
          placeholder="Search bookmarks"
          placeholderTextColor={COLORS.textTertiary}
          style={styles.searchInput}
          onFocus={() => {
            setSearchFocused(true);
            focusScale.value = withSpring(1.01, ANIMATION.spring);
          }}
          onBlur={() => {
            setSearchFocused(false);
            focusScale.value = withSpring(1, ANIMATION.spring);
          }}
          selectionColor={COLORS.flame}
          keyboardAppearance="dark"
        />
      </Animated.View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <Animated.View entering={FadeIn.delay(200)} style={styles.emptyState}>
            <BookOpen size={48} color={COLORS.textTertiary} />
            <Text style={styles.emptyTitle}>No bookmarks yet</Text>
            <Text style={styles.emptySub}>Sites you save will appear here</Text>
          </Animated.View>
        ) : (
          filtered.map((bm, i) => {
            const domain = bm.url.replace(/^https?:\/\//, '').split('/')[0];
            return (
              <Animated.View
                key={bm.id}
                entering={FadeInDown.delay(i * 50).springify()}
                layout={Layout.springify()}
              >
                <GlassCard
                  style={styles.card}
                  onPress={() => navigateTo(bm.url)}
                  intensity="low"
                  radius={RADIUS.xl}
                >
                  <View style={styles.cardInner}>
                    <View style={styles.favicon}>
                      <Globe size={16} color={COLORS.textSecondary} />
                    </View>
                    <View style={styles.cardText}>
                      <Text style={styles.cardTitle} numberOfLines={1}>{bm.title}</Text>
                      <Text style={styles.cardUrl} numberOfLines={1}>{domain}</Text>
                    </View>
                    <Pressable
                      onPress={() => removeBookmark(bm.id)}
                      style={styles.deleteBtn}
                      hitSlop={8}
                    >
                      <Trash2 size={15} color={COLORS.textTertiary} />
                    </Pressable>
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
    paddingTop: 60,
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.base,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { fontSize: FONT.xxl, fontWeight: FONT.bold, color: COLORS.textPrimary },
  headerSub: { fontSize: FONT.sm, color: COLORS.textTertiary, marginTop: 2 },
  addBtn: {
    width: 40, height: 40, borderRadius: RADIUS.md,
    overflow: 'hidden', alignItems: 'center', justifyContent: 'center',
  },
  addBtnBorder: {
    ...StyleSheet.absoluteFill,
    borderRadius: RADIUS.md, borderWidth: 1, borderColor: 'rgba(255,77,0,0.25)',
  },
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
    flex: 1, color: COLORS.textPrimary, fontSize: FONT.base,
    padding: 0, fontWeight: FONT.regular,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: SPACING.xl },
  card: { marginBottom: SPACING.sm, borderRadius: RADIUS.xl, overflow: 'hidden' },
  cardInner: {
    flexDirection: 'row', alignItems: 'center',
    padding: SPACING.md, gap: SPACING.md,
  },
  favicon: {
    width: 36, height: 36, borderRadius: RADIUS.sm,
    backgroundColor: COLORS.glass, alignItems: 'center', justifyContent: 'center',
  },
  cardText: { flex: 1 },
  cardTitle: { fontSize: FONT.sm, fontWeight: FONT.medium, color: COLORS.textPrimary },
  cardUrl: { fontSize: FONT.xs, color: COLORS.textTertiary, marginTop: 2 },
  deleteBtn: { padding: SPACING.xs },
  emptyState: {
    alignItems: 'center', justifyContent: 'center',
    paddingTop: 80, gap: SPACING.md,
  },
  emptyTitle: { fontSize: FONT.lg, fontWeight: FONT.semibold, color: COLORS.textSecondary },
  emptySub: { fontSize: FONT.base, color: COLORS.textTertiary },
});
