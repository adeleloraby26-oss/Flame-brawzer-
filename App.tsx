import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Animated, { FadeOut, FadeIn } from 'react-native-reanimated';

import { HomeScreen }      from './screens/HomeScreen';
import { BrowserScreen }   from './screens/BrowserScreen';
import { TabsScreen }      from './screens/TabsScreen';
import { BookmarksScreen } from './screens/BookmarksScreen';
import { HistoryScreen }   from './screens/HistoryScreen';
import { SettingsScreen }  from './screens/SettingsScreen';
import { ProfileScreen }   from './screens/ProfileScreen';
import { DownloadsScreen } from './screens/DownloadsScreen';
import { SplashScreen }    from './screens/SplashScreen';
import { AuthScreen }      from './screens/AuthScreen';

import { BottomNavBar }       from './components/navigation/BottomNavBar';
import { SearchSuggestions }  from './components/browser/SearchSuggestions';

import { useBrowserStore }  from './store/browserStore';
import { authService }      from './services/supabase';
import { COLORS }           from './utils/design';

// ── Screen router ─────────────────────────────────────────
const ScreenRouter: React.FC = () => {
  const { activeScreen, showTabsView } = useBrowserStore();
  if (showTabsView) return <TabsScreen />;
  switch (activeScreen) {
    case 'home':       return <HomeScreen />;
    case 'browser':    return <BrowserScreen />;
    case 'bookmarks':  return <BookmarksScreen />;
    case 'history':    return <HistoryScreen />;
    case 'settings':   return <SettingsScreen />;
    case 'profile':    return <ProfileScreen />;
    default:           return <HomeScreen />;
  }
};

// ── Root App ──────────────────────────────────────────────
export default function App() {
  const [splashDone,  setSplashDone]  = useState(false);
  const [showAuth,    setShowAuth]    = useState(false);
  const [appReady,    setAppReady]    = useState(false);

  const { isAddressBarFocused, setUserId, syncFromSupabase, startRealtimeSync } = useBrowserStore();
  const unsubRef = useRef<(() => void) | null>(null);

  // ── Check existing session on mount ───────────────────
  useEffect(() => {
    const init = async () => {
      try {
        const session = await authService.getSession();
        if (session?.user) {
          await handleAuthenticated(session.user.id);
        }
      } catch {
        // no session — will show auth after splash
      } finally {
        setAppReady(true);
      }
    };
    init();

    // Listen for auth changes (logout, token refresh)
    const sub = authService.onAuthStateChange(async (session) => {
      if (session?.user) {
        await handleAuthenticated(session.user.id);
      } else {
        setUserId(null);
        unsubRef.current?.();
      }
    });

    return () => sub?.unsubscribe?.();
  }, []);

  const handleAuthenticated = async (userId: string) => {
    if (!userId) {
      // guest mode — skip sync
      setShowAuth(false);
      return;
    }
    setUserId(userId);
    await syncFromSupabase();
    unsubRef.current = startRealtimeSync();
    setShowAuth(false);
  };

  const handleSplashDone = () => {
    setSplashDone(true);
    if (appReady && !useBrowserStore.getState().isLoggedIn) {
      setShowAuth(true);
    }
  };

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

        <View style={styles.container}>
          {/* ── Main app ── */}
          <ScreenRouter />
          {isAddressBarFocused && <SearchSuggestions />}
          {!isAddressBarFocused && <BottomNavBar />}

          {/* ── Auth overlay ── */}
          {showAuth && (
            <Animated.View entering={FadeIn} exiting={FadeOut} style={StyleSheet.absoluteFill}>
              <AuthScreen onAuthenticated={handleAuthenticated} />
            </Animated.View>
          )}

          {/* ── Splash (always on top until done) ── */}
          {!splashDone && <SplashScreen onFinish={handleSplashDone} />}
        </View>

      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root:      { flex: 1, backgroundColor: COLORS.void },
  container: { flex: 1, backgroundColor: COLORS.void },
});
