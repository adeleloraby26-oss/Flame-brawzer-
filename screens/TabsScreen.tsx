import React, { useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming,
  interpolate, FadeIn, SlideInUp, runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { X, Plus, Lock, Globe } from 'lucide-react-native';
import { COLORS, FONT, RADIUS, SPACING, ANIMATION } from '../utils/design';
import { useBrowserStore } from '../store/browserStore';
import { Tab } from '../types';
import { GlassCard } from '../components/cards/GlassCard';

const { width: W } = Dimensions.get('window');
const CARD_W = W - SPACING.base * 4;

const TabCard: React.FC<{
  tab: Tab;
  index: number;
  isActive: boolean;
  onPress: () => void;
  onClose: () => void;
}> = ({ tab, index, isActive, onPress, onClose }) => {
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  const closeTab = () => onClose();

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
      opacity.value = interpolate(Math.abs(e.translationX), [0, 150], [1, 0]);
      scale.value = interpolate(Math.abs(e.translationX), [0, 150], [1, 0.95]);
    })
    .onEnd((e) => {
      if (Math.abs(e.translationX) > 120) {
        translateX.value = withTiming(e.translationX > 0 ? W : -W, { duration: 200 });
        opacity.value = withTiming(0, { duration: 200 }, () => {
          runOnJS(closeTab)();
        });
      } else {
        translateX.value = withSpring(0, ANIMATION.spring);
        opacity.value = withSpring(1);
        scale.value = withSpring(1);
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { scale: scale.value }],
    opacity: opacity.value,
  }));

  const borderColor = isActive
    ? COLORS.flame
    : tab.isPrivate
    ? COLORS.privateAccent
    : 'rgba(255,255,255,0.1)';

  const domain = tab.url.replace(/^https?:\/\//, '').split('/')[0];

  return (
    <Animated.View entering={FadeIn.delay(index * 60).springify()} style={[styles.cardWrap, cardStyle]}>
      <GestureDetector gesture={panGesture}>
        <Animated.View>
          <Pressable onPress={onPress} style={[styles.card, { borderColor }]}>
            <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
            <LinearGradient
              colors={
                tab.isPrivate
                  ? ['rgba(168,85,247,0.12)', 'rgba(10,0,20,0.95)']
                  : isActive
                  ? ['rgba(255,77,0,0.1)', 'rgba(13,14,26,0.95)']
                  : ['rgba(255,255,255,0.07)', 'rgba(7,8,15,0.95)']
              }
              style={StyleSheet.absoluteFill}
            />

            <View style={styles.cardHeader}>
              <View style={styles.cardSiteInfo}>
                {tab.isPrivate
                  ? <Lock size={12} color={COLORS.privateAccent} />
                  : <Globe size={12} color={COLORS.textTertiary} />
                }
                <Text style={styles.cardDomain} numberOfLines={1}>{domain}</Text>
              </View>
              <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={8}>
                <BlurView intensity={15} tint="dark" style={StyleSheet.absoluteFill} />
                <X size={12} color={COLORS.textSecondary} />
              </Pressable>
            </View>

            <View style={styles.cardPreview}>
              <View style={styles.previewPlaceholder}>
                <Globe size={28} color={COLORS.textTertiary} />
                <Text style={styles.previewUrl} numberOfLines={2}>{tab.title}</Text>
              </View>
            </View>

            {isActive && (
              <View style={styles.activeGlow}>
                <LinearGradient
                  colors={[COLORS.flameGlow, 'transparent']}
                  style={{ flex: 1, borderRadius: RADIUS.xl }}
                />
              </View>
            )}
            {isActive && <View style={styles.activePill} />}
          </Pressable>
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
};

export const TabsScreen: React.FC = () => {
  const { tabs, activeTabId, closeTab, setActiveTab, addTab, toggleTabsView } = useBrowserStore();

  const normalTabs = tabs.filter(t => !t.isPrivate);
  const privateTabs = tabs.filter(t => t.isPrivate);

  return (
    <Animated.View entering={SlideInUp.springify()} style={styles.container}>
      <LinearGradient colors={['#0A0A14', '#07080F', '#000000']} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>{tabs.length} Tab{tabs.length !== 1 ? 's' : ''}</Text>
        <Pressable onPress={toggleTabsView} style={styles.doneBtn}>
          <Text style={styles.doneBtnText}>Done</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {normalTabs.length > 0 && (
          <View style={styles.tabGroup}>
            <View style={styles.groupHeader}>
              <Globe size={13} color={COLORS.textTertiary} />
              <Text style={styles.groupTitle}>Tabs</Text>
              <View style={styles.countPill}>
                <Text style={styles.countPillText}>{normalTabs.length}</Text>
              </View>
            </View>
            {normalTabs.map((tab, i) => (
              <TabCard
                key={tab.id}
                tab={tab}
                index={i}
                isActive={tab.id === activeTabId}
                onPress={() => setActiveTab(tab.id)}
                onClose={() => closeTab(tab.id)}
              />
            ))}
          </View>
        )}

        {privateTabs.length > 0 && (
          <View style={styles.tabGroup}>
            <View style={styles.groupHeader}>
              <Lock size={13} color={COLORS.privateAccent} />
              <Text style={[styles.groupTitle, { color: COLORS.privateAccent }]}>Private</Text>
              <View style={[styles.countPill, { backgroundColor: 'rgba(168,85,247,0.2)' }]}>
                <Text style={[styles.countPillText, { color: COLORS.privateAccent }]}>{privateTabs.length}</Text>
              </View>
            </View>
            {privateTabs.map((tab, i) => (
              <TabCard
                key={tab.id}
                tab={tab}
                index={i}
                isActive={tab.id === activeTabId}
                onPress={() => setActiveTab(tab.id)}
                onClose={() => closeTab(tab.id)}
              />
            ))}
          </View>
        )}

        <View style={styles.newTabRow}>
          <Pressable onPress={() => addTab('flame://home', false)} style={styles.newTabBtn}>
            <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
            <LinearGradient
              colors={['rgba(255,77,0,0.18)', 'rgba(255,77,0,0.06)']}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.newTabBtnBorder} />
            <Plus size={18} color={COLORS.flame} />
            <Text style={styles.newTabBtnText}>New Tab</Text>
          </Pressable>

          <Pressable onPress={() => addTab('flame://home', true)} style={styles.newTabBtn}>
            <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
            <LinearGradient
              colors={['rgba(168,85,247,0.18)', 'rgba(168,85,247,0.06)']}
              style={StyleSheet.absoluteFill}
            />
            <View style={[styles.newTabBtnBorder, { borderColor: 'rgba(168,85,247,0.25)' }]} />
            <Lock size={16} color={COLORS.privateAccent} />
            <Text style={[styles.newTabBtnText, { color: COLORS.privateAccent }]}>Private</Text>
          </Pressable>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.void },
  header: {
    paddingTop: 60, paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.base,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  headerTitle: { fontSize: FONT.xl, fontWeight: FONT.bold, color: COLORS.textPrimary },
  doneBtn: { paddingHorizontal: SPACING.base, paddingVertical: SPACING.sm },
  doneBtnText: { color: COLORS.flame, fontSize: FONT.md, fontWeight: FONT.semibold },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: SPACING.base * 2 },
  tabGroup: { marginBottom: SPACING.xl },
  groupHeader: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginBottom: SPACING.md,
  },
  groupTitle: {
    fontSize: FONT.sm, fontWeight: FONT.semibold, color: COLORS.textTertiary,
    textTransform: 'uppercase', letterSpacing: 0.8,
  },
  countPill: {
    paddingHorizontal: 7, paddingVertical: 2,
    borderRadius: RADIUS.full, backgroundColor: COLORS.glass,
  },
  countPillText: { fontSize: FONT.xs, fontWeight: FONT.semibold, color: COLORS.textTertiary },
  cardWrap: { marginBottom: SPACING.md },
  card: {
    width: CARD_W, minHeight: 200, borderRadius: RADIUS.xxl,
    overflow: 'hidden', borderWidth: 1, alignSelf: 'center',
  },
  cardHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: SPACING.base, paddingBottom: SPACING.sm,
  },
  cardSiteInfo: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, flex: 1 },
  cardDomain: { fontSize: FONT.sm, color: COLORS.textSecondary, fontWeight: FONT.medium },
  closeBtn: {
    width: 24, height: 24, borderRadius: 12,
    overflow: 'hidden', alignItems: 'center', justifyContent: 'center',
  },
  cardPreview: {
    flex: 1, minHeight: 130, margin: SPACING.sm, marginTop: 0,
    borderRadius: RADIUS.lg, backgroundColor: 'rgba(0,0,0,0.3)', overflow: 'hidden',
  },
  previewPlaceholder: {
    flex: 1, minHeight: 130, alignItems: 'center', justifyContent: 'center',
    gap: SPACING.sm, padding: SPACING.base,
  },
  previewUrl: { fontSize: FONT.sm, color: COLORS.textTertiary, textAlign: 'center' },
  activeGlow: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  activePill: {
    position: 'absolute', bottom: 0, alignSelf: 'center',
    width: 32, height: 3, borderRadius: 2, backgroundColor: COLORS.flame,
  },
  newTabRow: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.sm },
  newTabBtn: {
    flex: 1, height: 56, borderRadius: RADIUS.xl, overflow: 'hidden',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm,
  },
  newTabBtnBorder: {
    ...StyleSheet.absoluteFill,
    borderRadius: RADIUS.xl, borderWidth: 1, borderColor: 'rgba(255,77,0,0.25)',
  },
  newTabBtnText: { fontSize: FONT.base, fontWeight: FONT.semibold, color: COLORS.flame },
});
