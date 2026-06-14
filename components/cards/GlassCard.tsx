import React from 'react';
import { StyleSheet, View, ViewStyle, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withRepeat,
  interpolate,
} from 'react-native-reanimated';
import { COLORS, RADIUS, SHADOWS, ANIMATION } from '../../utils/design';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  onLongPress?: () => void;
  intensity?: 'low' | 'mid' | 'high';
  glow?: string;
  radius?: number;
  disabled?: boolean;
  noPressEffect?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  onPress,
  onLongPress,
  intensity = 'mid',
  glow,
  radius = RADIUS.xl,
  disabled = false,
  noPressEffect = false,
}) => {
  const pressed = useSharedValue(0);

  const handlePressIn = () => {
    if (noPressEffect) return;
    pressed.value = withSpring(1, ANIMATION.springSnappy);
  };

  const handlePressOut = () => {
    if (noPressEffect) return;
    pressed.value = withSpring(0, ANIMATION.spring);
  };

  const animStyle = useAnimatedStyle(() => {
    if (noPressEffect) return {};
    return {
      transform: [
        { scale: interpolate(pressed.value, [0, 1], [1, 0.97]) },
      ],
    };
  });

  const borderColors: Record<string, string> = {
    low: COLORS.glassBorder,
    mid: 'rgba(255,255,255,0.10)',
    high: 'rgba(255,255,255,0.18)',
  };

  const gradients: Record<string, [string, string]> = {
    low: ['rgba(255,255,255,0.03)', 'rgba(255,255,255,0.01)'],
    mid: ['rgba(255,255,255,0.07)', 'rgba(255,255,255,0.02)'],
    high: ['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.04)'],
  };

  const content = (
    <Animated.View style={[{ borderRadius: radius, overflow: 'hidden' }, animStyle, style]}>
      {glow && (
        <View
          style={[
            StyleSheet.absoluteFill,
            { borderRadius: radius, backgroundColor: glow, opacity: 0.15 },
          ]}
        />
      )}
      <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={gradients[intensity]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <View
        style={[
          StyleSheet.absoluteFill,
          { borderRadius: radius, borderWidth: 1, borderColor: borderColors[intensity] },
        ]}
      />
      {children}
    </Animated.View>
  );

  if (onPress || onLongPress) {
    return (
      <AnimatedPressable
        onPress={onPress}
        onLongPress={onLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={[{ borderRadius: radius }, animStyle, style]}
      >
        {glow && (
          <View
            style={[
              StyleSheet.absoluteFill,
              { borderRadius: radius, backgroundColor: glow, opacity: 0.15 },
            ]}
          />
        )}
        <BlurView intensity={20} tint="dark" style={[StyleSheet.absoluteFill, { borderRadius: radius }]} />
        <LinearGradient
          colors={gradients[intensity]}
          style={[StyleSheet.absoluteFill, { borderRadius: radius }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <View
          style={[
            StyleSheet.absoluteFill,
            { borderRadius: radius, borderWidth: 1, borderColor: borderColors[intensity] },
          ]}
        />
        {children}
      </AnimatedPressable>
    );
  }

  return content;
};

interface ShimmerProps {
  width: number;
  height: number;
  radius?: number;
  style?: ViewStyle;
}

export const Shimmer: React.FC<ShimmerProps> = ({ width, height, radius = RADIUS.md, style }) => {
  const offset = useSharedValue(-1);

  React.useEffect(() => {
    offset.value = withRepeat(
      withTiming(1, { duration: 1400 }),
      -1, false
    );
  }, []);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(offset.value, [-1, 1], [-200, 200]) }],
  }));

  return (
    <View
      style={[
        { width, height, borderRadius: radius, overflow: 'hidden', backgroundColor: COLORS.glass },
        style,
      ]}
    >
      <Animated.View style={[StyleSheet.absoluteFill, shimmerStyle]}>
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.06)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ flex: 1 }}
        />
      </Animated.View>
    </View>
  );
};
