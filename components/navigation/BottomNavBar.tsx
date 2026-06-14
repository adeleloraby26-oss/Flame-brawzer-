import React from 'react';
import { View, Pressable, StyleSheet, Text } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming,
  interpolate, interpolateColor,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Home, Layers, BookOpen, Clock, User } from 'lucide-react-native';
import { COLORS, FONT, RADIUS, SPACING, TAB_BAR_HEIGHT, ANIMATION } from '../../utils/design';
import { useBrowserStore } from '../../store/browserStore';

interface NavItem {
  id: string;
  label: string;
  icon: React.FC<any>;
  screen: 'home' | 'tabs' | 'bookmarks' | 'history' | 'profile';
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', icon: Home, screen: 'home' },
  { id: 'history', label: 'History', icon: Clock, screen: 'history' },
  { id: 'tabs', label: 'Tabs', icon: Layers, screen: 'tabs' },
  { id: 'bookmarks', label: 'Bookmarks', icon: BookOpen, screen: 'bookmarks' },
  { id: 'profile', label: 'Profile', icon: User, screen: 'profile' },
];

interface TabItemProps {
  item: NavItem;
  isActive: boolean;
  onPress: () => void;
  tabCount?: number;
}

const TabItem: React.FC<TabItemProps> = ({ item, isActive, onPress, tabCount }) => {
  const progress = useSharedValue(isActive ? 1 : 0);

  React.useEffect(() => {
    progress.value = withSpring(isActive ? 1 : 0, ANIMATION.springBouncy);
  }, [isActive]);

  const pillStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scaleX: interpolate(progress.value, [0, 1], [0.3, 1]) }],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(progress.value, [0, 1], [1, 1.1]) },
      { translateY: interpolate(progress.value, [0, 1], [0, -2]) },
    ],
  }));

  const iconColor = isActive ? COLORS.flame : COLORS.textTertiary;

  return (
    <Pressable onPress={onPress} style={styles.navItem}>
      <Animated.View style={[styles.pillBg, pillStyle]} />
      <Animated.View style={iconStyle}>
        <View style={styles.iconWrapper}>
          {item.id === 'tabs' && tabCount !== undefined && tabCount > 0 ? (
            <View style={styles.tabCountContainer}>
              <Layers size={20} color={iconColor} />
              <View style={[styles.countBadge, isActive && styles.countBadgeActive]}>
                <Text style={styles.countText}>{tabCount > 99 ? '99+' : tabCount}</Text>
              </View>
            </View>
          ) : (
            <item.icon size={22} color={iconColor} strokeWidth={isActive ? 2.2 : 1.8} />
          )}
        </View>
      </Animated.View>
    </Pressable>
  );
};

export const BottomNavBar: React.FC = () => {
  const { activeScreen, setActiveScreen, tabs, toggleTabsView, showTabsView } = useBrowserStore();
  const translateY = useSharedValue(0);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const handleNavPress = (item: NavItem) => {
    if (item.screen === 'tabs') {
      toggleTabsView();
    } else {
      setActiveScreen(item.screen);
    }
  };

  const getIsActive = (item: NavItem) => {
    if (item.screen === 'tabs') return showTabsView;
    return activeScreen === item.screen && !showTabsView;
  };

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.02)']}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.topBorder} />
      <View style={styles.inner}>
        {NAV_ITEMS.map(item => (
          <TabItem
            key={item.id}
            item={item}
            isActive={getIsActive(item)}
            onPress={() => handleNavPress(item)}
            tabCount={item.id === 'tabs' ? tabs.length : undefined}
          />
        ))}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: TAB_BAR_HEIGHT,
    overflow: 'hidden',
  },
  topBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  inner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xl,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    position: 'relative',
  },
  pillBg: {
    position: 'absolute',
    bottom: -4,
    width: 36,
    height: 3,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.flame,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabCountContainer: {
    position: 'relative',
  },
  countBadge: {
    position: 'absolute',
    top: -6,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.textTertiary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  countBadgeActive: {
    backgroundColor: COLORS.flame,
  },
  countText: {
    color: COLORS.textPrimary,
    fontSize: 9,
    fontWeight: FONT.bold,
  },
});
