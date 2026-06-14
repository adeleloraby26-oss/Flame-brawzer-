import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Dimensions,
  ImageBackground,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming,
  withRepeat, withSequence, withDelay, interpolate,
  useAnimatedScrollHandler, FadeIn, FadeInDown, FadeInUp,
  SlideInDown,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import {
  Zap, Shield, Clock, TrendingUp, Globe, Star,
  ChevronRight, Flame, Sparkles, Lock, RefreshCw,
} from 'lucide-react-native';
import { COLORS, GRADIENTS, FONT, RADIUS, SPACING, ANIMATION, SCREEN } from '../utils/design';
import { GlassCard, Shimmer } from '../components/cards/GlassCard';
import { SearchBar } from '../components/browser/SearchBar';
import { useBrowserStore } from '../store/browserStore';
import { FlameLogo } from '../components/svg/FlameLogo';

const { width: W } = Dimensions.get('window');

const QUICK_SITES = [
  { id: '1', name: 'GitHub', url: 'https://github.com', color: '#f0f0f0', letter: 'G' },
  { id: '2', name: 'Vercel', url: 'https://vercel.com', color: '#fff', letter: 'V' },
  { id: '3', name: 'Figma', url: 'https://figma.com', color: '#A259FF', letter: 'F' },
  { id: '4', name: 'Linear', url: 'https://linear.app', color: '#5E6AD2', letter: 'L' },
  { id: '5', name: 'Notion', url: 'https://notion.so', color: '#fff', letter: 'N' },
  { id: '6', name: 'Arc', url: 'https://arc.net', color: '#FF6B35', letter: 'A' },
  { id: '7', name: 'X', url: 'https://x.com', color: '#fff', letter: 'X' },
  { id: '8', name: 'YouTube', url: 'https://youtube.com', color: '#FF0000', letter: 'Y' },
];

const STATS = [
  { label: 'Ads Blocked', value: '4,872', icon: Shield, color: COLORS.emerald, glow: COLORS.emeraldGlow },
  { label: 'Time Saved', value: '2.4h', icon: Clock, color: COLORS.cyan, glow: COLORS.cyanGlow },
  { label: 'Data Saved', value: '487 MB', icon: Zap, color: COLORS.flame, glow: COLORS.flameGlow },
];

const TRENDING = [
  { id: '1', title: 'React Native 0.85 Released', source: 'reactnative.dev', time: '2h ago' },
  { id: '2', title: 'Apple Vision Pro 2 Announced', source: 'apple.com', time: '4h ago' },
  { id: '3', title: 'AI Browser Wars Heat Up', source: 'techcrunch.com', time: '6h ago' },
];

const QuickSiteItem: React.FC<{ site: typeof QUICK_SITES[0]; index: number; onPress: () => void }> = ({
  site, index, onPress
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(index * 60, withSpring(1, ANIMATION.spring));
  }, []);

  const handlePressIn = () => { scale.value = withSpring(0.88, ANIMATION.springSnappy); };
  const handlePressOut = () => { scale.value = withSpring(1, ANIMATION.springBouncy); };

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.quickSiteWrap, animStyle]}>
      <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
        <View style={styles.quickSiteIcon}>
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
          <LinearGradient
            colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.03)']}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.quickSiteBorder} />
          <Text style={[styles.quickSiteLetter, { color: site.color }]}>{site.letter}</Text>
        </View>
        <Text style={styles.quickSiteName} numberOfLines={1}>{site.name}</Text>
      </Pressable>
    </Animated.View>
  );
};

const StatCard: React.FC<{ stat: typeof STATS[0]; index: number }> = ({ stat, index }) => {
  const glow = useSharedValue(0.5);

  useEffect(() => {
    glow.value = withDelay(
      index * 200,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 2000 }),
          withTiming(0.4, { duration: 2000 }),
        ), -1, true
      )
    );
  }, []);

  const glowStyle = useAnimatedStyle(() => ({ opacity: glow.value }));

  return (
    <Animated.View entering={FadeInDown.delay(400 + index * 100).springify()} style={styles.statCard}>
      <GlassCard style={styles.statCardInner} intensity="mid">
        <Animated.View style={[styles.statGlow, { backgroundColor: stat.glow }, glowStyle]} />
        <View style={[styles.statIconWrap, { backgroundColor: stat.color + '22' }]}>
          <stat.icon size={16} color={stat.color} />
        </View>
        <Text style={styles.statValue}>{stat.value}</Text>
        <Text style={styles.statLabel}>{stat.label}</Text>
      </GlassCard>
    </Animated.View>
  );
};

const TrendingItem: React.FC<{ item: typeof TRENDING[0]; index: number; onPress: () => void }> = ({
  item, index, onPress
}) => (
  <Animated.View entering={FadeInDown.delay(700 + index * 80).springify()}>
    <GlassCard style={styles.trendingCard} onPress={onPress} intensity="low">
      <View style={styles.trendingInner}>
        <View style={styles.trendingIconWrap}>
          <Globe size={14} color={COLORS.textSecondary} />
        </View>
        <View style={styles.trendingText}>
          <Text style={styles.trendingTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.trendingMeta}>{item.source} · {item.time}</Text>
        </View>
        <ChevronRight size={14} color={COLORS.textTertiary} />
      </View>
    </GlassCard>
  </Animated.View>
);

export const HomeScreen: React.FC = () => {
  const { navigateTo, tabs, history } = useBrowserStore();
  const scrollY = useSharedValue(0);

  const heroGlow = useSharedValue(0.4);
  const flameScale = useSharedValue(0);
  const greetingOpacity = useSharedValue(0);

  useEffect(() => {
    flameScale.value = withDelay(100, withSpring(1, ANIMATION.springBouncy));
    greetingOpacity.value = withDelay(200, withTiming(1, { duration: 600 }));
    heroGlow.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 3000 }),
        withTiming(0.3, { duration: 3000 }),
      ), -1, true
    );
  }, []);

  const scrollHandler = useAnimatedScrollHandler(e => {
    scrollY.value = e.contentOffset.y;
  });

  const heroStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, 120], [1, 0]),
    transform: [{ translateY: interpolate(scrollY.value, [0, 120], [0, -40]) }],
  }));

  const heroGlowStyle = useAnimatedStyle(() => ({ opacity: heroGlow.value }));
  const flameEnterStyle = useAnimatedStyle(() => ({ transform: [{ scale: flameScale.value }] }));
  const greetStyle = useAnimatedStyle(() => ({ opacity: greetingOpacity.value }));

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const privateTabCount = tabs.filter(t => t.isPrivate).length;

  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <LinearGradient
        colors={['#07080F', '#020205', '#000000']}
        style={StyleSheet.absoluteFill}
      />

      {/* Hero ambient glow */}
      <Animated.View style={[styles.heroGlow, heroGlowStyle]}>
        <LinearGradient
          colors={[COLORS.flameGlow, 'transparent']}
          style={{ flex: 1 }}
        />
      </Animated.View>

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero section */}
        <Animated.View style={[styles.hero, heroStyle]}>
          <Animated.View style={flameEnterStyle}>
            <FlameLogo size={64} animated />
          </Animated.View>
          <Animated.View style={greetStyle}>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.heroSub}>What will you explore today?</Text>
          </Animated.View>
        </Animated.View>

        {/* Search bar */}
        <Animated.View entering={FadeInDown.delay(150).springify()}>
          <SearchBar />
        </Animated.View>

        {/* Private mode badge */}
        {privateTabCount > 0 && (
          <Animated.View entering={FadeIn.delay(200)} style={styles.privateBadgeWrap}>
            <GlassCard style={styles.privateBadge} glow={COLORS.privateAccent} radius={RADIUS.full}>
              <View style={styles.privateBadgeInner}>
                <Lock size={12} color={COLORS.privateAccent} />
                <Text style={styles.privateBadgeText}>{privateTabCount} private tab{privateTabCount > 1 ? 's' : ''} open</Text>
              </View>
            </GlassCard>
          </Animated.View>
        )}

        {/* Stats row */}
        <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.section}>
          <View style={styles.statsRow}>
            {STATS.map((stat, i) => (
              <StatCard key={stat.label} stat={stat} index={i} />
            ))}
          </View>
        </Animated.View>

        {/* Quick access */}
        <Animated.View entering={FadeInDown.delay(450).springify()} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Access</Text>
            <Pressable>
              <Text style={styles.sectionAction}>Edit</Text>
            </Pressable>
          </View>
          <View style={styles.quickSitesGrid}>
            {QUICK_SITES.map((site, i) => (
              <QuickSiteItem
                key={site.id}
                site={site}
                index={i}
                onPress={() => navigateTo(site.url)}
              />
            ))}
          </View>
        </Animated.View>

        {/* Recent history */}
        {history.length > 0 && (
          <Animated.View entering={FadeInDown.delay(550).springify()} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent</Text>
              <Pressable>
                <Text style={styles.sectionAction}>See all</Text>
              </Pressable>
            </View>
            {history.slice(0, 3).map((item, i) => (
              <Animated.View key={item.id} entering={FadeInDown.delay(600 + i * 60).springify()}>
                <GlassCard
                  style={styles.historyCard}
                  onPress={() => navigateTo(item.url)}
                  intensity="low"
                >
                  <View style={styles.historyInner}>
                    <View style={styles.historyIcon}>
                      <Globe size={14} color={COLORS.textSecondary} />
                    </View>
                    <View style={styles.historyText}>
                      <Text style={styles.historyTitle} numberOfLines={1}>{item.title}</Text>
                      <Text style={styles.historyUrl} numberOfLines={1}>{item.url.replace(/^https?:\/\//, '')}</Text>
                    </View>
                    <ChevronRight size={14} color={COLORS.textTertiary} />
                  </View>
                </GlassCard>
              </Animated.View>
            ))}
          </Animated.View>
        )}

        {/* Trending */}
        <Animated.View entering={FadeInDown.delay(650).springify()} style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <TrendingUp size={15} color={COLORS.flame} />
              <Text style={styles.sectionTitle}>Trending</Text>
            </View>
          </View>
          {TRENDING.map((item, i) => (
            <TrendingItem
              key={item.id}
              item={item}
              index={i}
              onPress={() => navigateTo(`https://${item.source}`)}
            />
          ))}
        </Animated.View>

        {/* Bottom spacer for nav bar */}
        <View style={styles.bottomSpacer} />
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.void,
  },
  heroGlow: {
    position: 'absolute',
    top: -60,
    left: -60,
    right: -60,
    height: 320,
    zIndex: 0,
  },
  scrollContent: {
    paddingTop: 60,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    gap: SPACING.base,
  },
  greeting: {
    fontSize: FONT.xl,
    fontWeight: FONT.semibold,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  heroSub: {
    fontSize: FONT.base,
    color: COLORS.textTertiary,
    textAlign: 'center',
    marginTop: 2,
  },
  section: {
    marginTop: SPACING.xxl,
    paddingHorizontal: SPACING.base,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  sectionTitle: {
    fontSize: FONT.md,
    fontWeight: FONT.semibold,
    color: COLORS.textPrimary,
  },
  sectionAction: {
    fontSize: FONT.sm,
    color: COLORS.flame,
    fontWeight: FONT.medium,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  statCard: {
    flex: 1,
  },
  statCardInner: {
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    gap: SPACING.xs,
    overflow: 'hidden',
  },
  statGlow: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  statIconWrap: {
    width: 30,
    height: 30,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: FONT.md,
    fontWeight: FONT.bold,
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: FONT.xs,
    color: COLORS.textTertiary,
  },
  quickSitesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.base,
  },
  quickSiteWrap: {
    width: (W - SPACING.base * 2 - SPACING.base * 3) / 4,
    alignItems: 'center',
    gap: SPACING.xs,
  },
  quickSiteIcon: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  quickSiteBorder: {
    ...StyleSheet.absoluteFill,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  quickSiteLetter: {
    fontSize: FONT.xl,
    fontWeight: FONT.bold,
  },
  quickSiteName: {
    fontSize: FONT.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  historyCard: {
    marginBottom: SPACING.sm,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  historyInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.md,
  },
  historyIcon: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.glass,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyText: {
    flex: 1,
  },
  historyTitle: {
    fontSize: FONT.sm,
    fontWeight: FONT.medium,
    color: COLORS.textPrimary,
  },
  historyUrl: {
    fontSize: FONT.xs,
    color: COLORS.textTertiary,
    marginTop: 2,
  },
  trendingCard: {
    marginBottom: SPACING.sm,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  trendingInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.md,
  },
  trendingIconWrap: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.glass,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendingText: { flex: 1 },
  trendingTitle: {
    fontSize: FONT.sm,
    fontWeight: FONT.medium,
    color: COLORS.textPrimary,
  },
  trendingMeta: {
    fontSize: FONT.xs,
    color: COLORS.textTertiary,
    marginTop: 2,
  },
  privateBadgeWrap: {
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  privateBadge: {
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  privateBadgeInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  privateBadgeText: {
    fontSize: FONT.xs,
    color: COLORS.privateAccent,
    fontWeight: FONT.medium,
  },
  bottomSpacer: { height: 120 },
});
