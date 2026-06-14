import React, { useRef, useState, useCallback } from 'react';
import { View, StyleSheet, Text, Pressable, ActivityIndicator, Animated as RNAnimated } from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming,
  interpolate, FadeIn,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import {
  ArrowLeft, ArrowRight, RefreshCw, X, Shield, Globe,
  BookmarkPlus, Bookmark, Share2, MoreHorizontal,
} from 'lucide-react-native';
import { COLORS, FONT, RADIUS, SPACING, ANIMATION, SCREEN } from '../utils/design';
import { useBrowserStore } from '../store/browserStore';
import { SearchBar } from '../components/browser/SearchBar';
import { GlassCard } from '../components/cards/GlassCard';

const BrowserControls: React.FC<{
  canGoBack: boolean;
  canGoForward: boolean;
  isLoading: boolean;
  isBookmarked: boolean;
  onBack: () => void;
  onForward: () => void;
  onRefresh: () => void;
  onBookmark: () => void;
}> = ({ canGoBack, canGoForward, isLoading, isBookmarked, onBack, onForward, onRefresh, onBookmark }) => {

  const ControlBtn: React.FC<{
    icon: React.FC<any>;
    onPress: () => void;
    disabled?: boolean;
    color?: string;
    size?: number;
  }> = ({ icon: Icon, onPress, disabled, color, size = 20 }) => {
    const scale = useSharedValue(1);
    const handlePressIn = () => { scale.value = withSpring(0.85, ANIMATION.springSnappy); };
    const handlePressOut = () => { scale.value = withSpring(1, ANIMATION.springBouncy); };
    const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
    return (
      <Animated.View style={style}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled}
          style={styles.ctrlBtn}
        >
          <Icon size={size} color={disabled ? COLORS.textDisabled : (color || COLORS.textSecondary)} strokeWidth={1.8} />
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <View style={styles.controls}>
      <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.02)']}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.controlsBorder} />
      <View style={styles.controlsInner}>
        <ControlBtn icon={ArrowLeft} onPress={onBack} disabled={!canGoBack} />
        <ControlBtn icon={ArrowRight} onPress={onForward} disabled={!canGoForward} />
        <ControlBtn icon={isLoading ? X : RefreshCw} onPress={onRefresh} />
        <ControlBtn
          icon={isBookmarked ? Bookmark : BookmarkPlus}
          onPress={onBookmark}
          color={isBookmarked ? COLORS.flame : undefined}
        />
        <ControlBtn icon={Share2} onPress={() => {}} />
        <ControlBtn icon={MoreHorizontal} onPress={() => {}} />
      </View>
    </View>
  );
};

const LoadingBar: React.FC<{ progress: number; visible: boolean }> = ({ progress, visible }) => {
  const opacity = useSharedValue(visible ? 1 : 0);
  React.useEffect(() => {
    opacity.value = withTiming(visible ? 1 : 0, { duration: 200 });
  }, [visible]);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={[styles.loadingBar, style]}>
      <View style={[styles.loadingProgress, { width: `${progress}%` }]}>
        <LinearGradient
          colors={[COLORS.flame, COLORS.flameSoft]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </View>
    </Animated.View>
  );
};

export const BrowserScreen: React.FC = () => {
  const {
    activeTabId, tabs, updateTab, addToHistory,
    isBookmarked: checkBookmarked, addBookmark, removeBookmark, bookmarks,
  } = useBrowserStore();

  const webViewRef = useRef<WebView>(null);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const activeTab = tabs.find(t => t.id === activeTabId);
  const url = activeTab?.url || 'https://www.google.com';
  const isPrivate = activeTab?.isPrivate || false;
  const bookmarked = checkBookmarked(url);

  const handleNavStateChange = useCallback((state: WebViewNavigation) => {
    if (!activeTabId) return;
    updateTab(activeTabId, {
      url: state.url,
      title: state.title || state.url,
      canGoBack: state.canGoBack,
      canGoForward: state.canGoForward,
    });
  }, [activeTabId]);

  const handleLoadProgress = useCallback(({ nativeEvent }: any) => {
    setLoadProgress(Math.round(nativeEvent.progress * 100));
  }, []);

  const handleLoadStart = useCallback(() => {
    setIsLoading(true);
    setLoadProgress(5);
  }, []);

  const handleLoadEnd = useCallback(({ nativeEvent }: any) => {
    setIsLoading(false);
    setLoadProgress(100);
    if (activeTabId) {
      updateTab(activeTabId, { isLoading: false });
      addToHistory(nativeEvent.url, nativeEvent.title || nativeEvent.url);
    }
  }, [activeTabId]);

  const handleBack = () => webViewRef.current?.goBack();
  const handleForward = () => webViewRef.current?.goForward();
  const handleRefresh = () => {
    if (isLoading) webViewRef.current?.stopLoading();
    else webViewRef.current?.reload();
  };

  const handleBookmark = () => {
    if (bookmarked) {
      const bm = bookmarks.find(b => b.url === url);
      if (bm) removeBookmark(bm.id);
    } else {
      addBookmark(url, activeTab?.title || url);
    }
  };

  const bgColor = isPrivate ? COLORS.privateBase : COLORS.void;

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {isPrivate && (
        <LinearGradient
          colors={['rgba(168,85,247,0.12)', 'transparent']}
          style={styles.privateOverlay}
        />
      )}

      {/* Address bar area */}
      <View style={styles.addressArea}>
        {isPrivate && (
          <Animated.View entering={FadeIn} style={styles.privateIndicator}>
            <BlurView intensity={15} tint="dark" style={StyleSheet.absoluteFill} />
            <View style={styles.privateIndicatorBorder} />
            <Shield size={11} color={COLORS.privateAccent} />
            <Text style={styles.privateText}>Private</Text>
          </Animated.View>
        )}
        <SearchBar />
        <LoadingBar progress={loadProgress} visible={isLoading} />
      </View>

      {/* WebView */}
      <View style={styles.webViewContainer}>
        <WebView
          ref={webViewRef}
          source={{ uri: url }}
          style={styles.webView}
          onNavigationStateChange={handleNavStateChange}
          onLoadProgress={handleLoadProgress}
          onLoadStart={handleLoadStart}
          onLoadEnd={handleLoadEnd}
          allowsBackForwardNavigationGestures
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState
          renderLoading={() => (
            <View style={styles.webViewLoading}>
              <ActivityIndicator color={COLORS.flame} size="large" />
            </View>
          )}
        />
      </View>

      {/* Controls */}
      <BrowserControls
        canGoBack={activeTab?.canGoBack || false}
        canGoForward={activeTab?.canGoForward || false}
        isLoading={isLoading}
        isBookmarked={bookmarked}
        onBack={handleBack}
        onForward={handleForward}
        onRefresh={handleRefresh}
        onBookmark={handleBookmark}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  privateOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    zIndex: 0,
  },
  addressArea: {
    paddingTop: 54,
    paddingBottom: SPACING.sm,
    zIndex: 10,
  },
  privateIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 4,
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    marginBottom: SPACING.xs,
  },
  privateIndicatorBorder: {
    ...StyleSheet.absoluteFill,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.3)',
  },
  privateText: {
    fontSize: FONT.xs,
    color: COLORS.privateAccent,
    fontWeight: FONT.medium,
  },
  webViewContainer: {
    flex: 1,
  },
  webView: {
    flex: 1,
    backgroundColor: COLORS.void,
  },
  webViewLoading: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
  },
  loadingBar: {
    height: 2,
    marginHorizontal: SPACING.base,
    borderRadius: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
    marginTop: 4,
  },
  loadingProgress: {
    height: '100%',
    borderRadius: 1,
    overflow: 'hidden',
  },
  controls: {
    height: 56,
    overflow: 'hidden',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.07)',
  },
  controlsBorder: {
    ...StyleSheet.absoluteFill,
  },
  controlsInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: SPACING.base,
  },
  ctrlBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.md,
  },
});
