import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import Animated, {
  FadeInDown, FadeOutUp, useSharedValue, useAnimatedStyle, withSpring,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, Globe, Clock, Bookmark, ArrowUpRight } from 'lucide-react-native';
import { COLORS, FONT, RADIUS, SPACING, ANIMATION } from '../../utils/design';
import { useBrowserStore } from '../../store/browserStore';

const QUICK_SUGGESTIONS = [
  { text: 'github.com', type: 'url' as const },
  { text: 'vercel.com', type: 'url' as const },
  { text: 'react native docs', type: 'search' as const },
  { text: 'expo documentation', type: 'search' as const },
  { text: 'figma.com', type: 'url' as const },
];

const SuggestionRow: React.FC<{
  text: string;
  type: 'search' | 'url' | 'history' | 'bookmark';
  index: number;
  onPress: () => void;
}> = ({ text, type, index, onPress }) => {
  const scale = useSharedValue(1);
  const pressStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const Icon = type === 'url' ? Globe : type === 'history' ? Clock : type === 'bookmark' ? Bookmark : Search;
  const iconColor = type === 'url' ? COLORS.cyan : type === 'history' ? COLORS.textTertiary : type === 'bookmark' ? COLORS.flame : COLORS.textTertiary;

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 40).springify()}
      style={pressStyle}
    >
      <Pressable
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.97, ANIMATION.springSnappy); }}
        onPressOut={() => { scale.value = withSpring(1); }}
        style={styles.row}
      >
        <View style={[styles.iconWrap, { backgroundColor: iconColor + '18' }]}>
          <Icon size={14} color={iconColor} />
        </View>
        <Text style={styles.suggestionText} numberOfLines={1}>{text}</Text>
        <ArrowUpRight size={14} color={COLORS.textTertiary} />
      </Pressable>
    </Animated.View>
  );
};

export const SearchSuggestions: React.FC = () => {
  const { isAddressBarFocused, addressInput, navigateTo, history, bookmarks } = useBrowserStore();

  if (!isAddressBarFocused) return null;

  const q = addressInput.toLowerCase().trim();

  const suggestions: Array<{ text: string; type: 'search' | 'url' | 'history' | 'bookmark' }> = [];

  if (q) {
    // History matches
    history
      .filter(h => h.url.toLowerCase().includes(q) || h.title.toLowerCase().includes(q))
      .slice(0, 3)
      .forEach(h => suggestions.push({ text: h.url.replace(/^https?:\/\//, ''), type: 'history' }));

    // Bookmark matches
    bookmarks
      .filter(b => b.url.toLowerCase().includes(q) || b.title.toLowerCase().includes(q))
      .slice(0, 2)
      .forEach(b => suggestions.push({ text: b.url.replace(/^https?:\/\//, ''), type: 'bookmark' }));

    // Search suggestion
    suggestions.push({ text: `Search "${q}"`, type: 'search' });
    if (q.includes('.')) {
      suggestions.unshift({ text: q.startsWith('http') ? q : `https://${q}`, type: 'url' });
    }
  } else {
    QUICK_SUGGESTIONS.forEach(s => suggestions.push(s));
  }

  return (
    <Animated.View entering={FadeInDown.springify()} style={styles.container}>
      <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={['rgba(7,8,15,0.97)', 'rgba(2,2,5,0.99)']}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.topBorder} />
      <ScrollView
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
      >
        {suggestions.slice(0, 6).map((s, i) => (
          <SuggestionRow
            key={`${s.text}-${i}`}
            text={s.text}
            type={s.type}
            index={i}
            onPress={() => navigateTo(s.text)}
          />
        ))}
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 110,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    overflow: 'hidden',
  },
  topBorder: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  scroll: { flex: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionText: {
    flex: 1,
    fontSize: FONT.base,
    color: COLORS.textPrimary,
  },
});
