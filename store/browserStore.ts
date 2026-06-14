import { create } from 'zustand';
import { Tab, Bookmark, HistoryItem, Download, AppSettings, TabGroup, UserProfile } from '../types';
import {
  bookmarksService,
  historyService,
  profileService,
  downloadsService,
  tabSessionsService,
} from '../services/supabase';

// ─────────────────────────────────────────────
//  State interface
// ─────────────────────────────────────────────
interface BrowserState {
  // Auth
  userId: string | null;
  isLoggedIn: boolean;

  // Tabs
  tabs: Tab[];
  activeTabId: string | null;
  tabGroups: TabGroup[];
  showTabsView: boolean;

  // Navigation UI
  showAddressBar: boolean;
  isAddressBarFocused: boolean;
  addressInput: string;
  isFullscreen: boolean;

  // Data
  bookmarks: Bookmark[];
  history: HistoryItem[];
  downloads: Download[];

  // Settings
  settings: AppSettings;

  // Profile
  profile: UserProfile;

  // UI
  activeScreen: 'home' | 'browser' | 'tabs' | 'history' | 'downloads' | 'bookmarks' | 'settings' | 'profile';
  showNavBar: boolean;

  // ── Supabase sync actions ──────────────────
  setUserId: (id: string | null) => void;
  syncFromSupabase: () => Promise<void>;
  startRealtimeSync: () => () => void;

  // ── Tabs ──────────────────────────────────
  addTab: (url?: string, isPrivate?: boolean) => string;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  updateTab: (id: string, updates: Partial<Tab>) => void;
  duplicateTab: (id: string) => void;

  // ── Navigation ────────────────────────────
  navigateTo: (url: string) => void;
  setAddressInput: (text: string) => void;
  setAddressBarFocused: (focused: boolean) => void;
  toggleTabsView: () => void;

  // ── Bookmarks ─────────────────────────────
  addBookmark: (url: string, title: string, favicon?: string) => Promise<void>;
  removeBookmark: (id: string) => Promise<void>;
  isBookmarked: (url: string) => boolean;

  // ── History ───────────────────────────────
  addToHistory: (url: string, title: string, favicon?: string) => Promise<void>;
  clearHistory: () => Promise<void>;

  // ── Settings ──────────────────────────────
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;

  // ── UI ────────────────────────────────────
  setActiveScreen: (screen: BrowserState['activeScreen']) => void;
  setShowNavBar: (show: boolean) => void;
}

// ─────────────────────────────────────────────
//  Defaults
// ─────────────────────────────────────────────
const DEFAULT_SETTINGS: AppSettings = {
  theme: 'amoled',
  searchEngine: 'google',
  enableAnimations: true,
  enableHaptics: true,
  blockAds: true,
  blockTrackers: true,
  savePasswords: true,
  readerMode: false,
  showFavicons: true,
  compactMode: false,
  bottomAddressBar: false,
};

const DEFAULT_PROFILE: UserProfile = {
  id: '',
  name: 'Flame User',
  email: '',
  rank: 'Explorer',
  xp: 0,
  level: 1,
  stats: { totalSearches: 0, totalTabsOpened: 0, dataBlocked: 0, timeSaved: 0 },
  joinedAt: new Date(),
};

let tabIdCounter = 1;
const createTab = (url = 'flame://home', isPrivate = false): Tab => ({
  id: `tab-${Date.now()}-${tabIdCounter++}`,
  url,
  title: url === 'flame://home' ? 'New Tab' : url,
  isLoading: false,
  isPrivate,
  canGoBack: false,
  canGoForward: false,
  createdAt: new Date(),
});

// ─────────────────────────────────────────────
//  Store
// ─────────────────────────────────────────────
const initialTab = createTab('flame://home');

export const useBrowserStore = create<BrowserState>((set, get) => ({
  userId: null,
  isLoggedIn: false,

  tabs: [initialTab],
  activeTabId: initialTab.id,
  tabGroups: [],
  showTabsView: false,

  showAddressBar: true,
  isAddressBarFocused: false,
  addressInput: '',
  isFullscreen: false,

  bookmarks: [
    { id: 'bm1', url: 'https://github.com',    title: 'GitHub',   visitCount: 45, createdAt: new Date() },
    { id: 'bm2', url: 'https://vercel.com',    title: 'Vercel',   visitCount: 32, createdAt: new Date() },
    { id: 'bm3', url: 'https://figma.com',     title: 'Figma',    visitCount: 28, createdAt: new Date() },
    { id: 'bm4', url: 'https://linear.app',    title: 'Linear',   visitCount: 19, createdAt: new Date() },
    { id: 'bm5', url: 'https://notion.so',     title: 'Notion',   visitCount: 67, createdAt: new Date() },
    { id: 'bm6', url: 'https://arc.net',       title: 'Arc',      visitCount: 12, createdAt: new Date() },
  ],
  history: [
    { id: 'h1', url: 'https://github.com/trending',    title: 'Trending · GitHub',  visitedAt: new Date(Date.now() - 300000),  visitCount: 3  },
    { id: 'h2', url: 'https://vercel.com/dashboard',   title: 'Vercel Dashboard',   visitedAt: new Date(Date.now() - 1800000), visitCount: 7  },
    { id: 'h3', url: 'https://news.ycombinator.com',   title: 'Hacker News',        visitedAt: new Date(Date.now() - 5400000), visitCount: 12 },
  ],
  downloads: [],
  settings: DEFAULT_SETTINGS,
  profile: DEFAULT_PROFILE,
  activeScreen: 'home',
  showNavBar: true,

  // ── Supabase ────────────────────────────────────────────
  setUserId: (id) => set({ userId: id, isLoggedIn: !!id }),

  /** يُستدعى مرة بعد تسجيل الدخول */
  syncFromSupabase: async () => {
    const { userId } = get();
    if (!userId) return;
    try {
      const [profile, bookmarks, history, downloads, settings] = await Promise.all([
        profileService.fetchProfile(userId),
        bookmarksService.fetchAll(userId),
        historyService.fetchRecent(userId),
        downloadsService.fetchAll(userId),
        profileService.fetchSettings(userId),
      ]);
      set({ profile, bookmarks, history, downloads, settings });
    } catch (err) {
      console.warn('[Flame] syncFromSupabase error:', err);
      // تشتغل بالبيانات المحلية لو الـ sync فشل
    }
  },

  /** يبدأ الـ realtime subscriptions ويرجع cleanup function */
  startRealtimeSync: () => {
    const { userId } = get();
    if (!userId) return () => {};

    const unsubBookmarks = bookmarksService.subscribe(userId, (bookmarks) => set({ bookmarks }));
    const unsubHistory   = historyService.subscribe(userId, (history)   => set({ history }));
    const unsubDownloads = downloadsService.subscribe(userId, (downloads) => set({ downloads }));

    return () => {
      unsubBookmarks();
      unsubHistory();
      unsubDownloads();
    };
  },

  // ── Tabs ────────────────────────────────────────────────
  addTab: (url = 'flame://home', isPrivate = false) => {
    const tab = createTab(url, isPrivate);
    set(state => ({
      tabs: [...state.tabs, tab],
      activeTabId: tab.id,
      activeScreen: url === 'flame://home' ? 'home' : 'browser',
      showTabsView: false,
    }));
    // XP لفتح تاب جديد
    const { userId } = get();
    if (userId) profileService.addXP(userId, 'tab_opened', 5).catch(() => {});
    return tab.id;
  },

  closeTab: (id) => {
    set(state => {
      const tabs = state.tabs.filter(t => t.id !== id);
      if (tabs.length === 0) {
        const newTab = createTab();
        return { tabs: [newTab], activeTabId: newTab.id, activeScreen: 'home' as const };
      }
      const newActive = state.activeTabId === id
        ? tabs[Math.max(0, state.tabs.findIndex(t => t.id === id) - 1)].id
        : state.activeTabId;
      return { tabs, activeTabId: newActive };
    });
  },

  setActiveTab: (id) => {
    set(state => {
      const tab = state.tabs.find(t => t.id === id);
      return {
        activeTabId: id,
        showTabsView: false,
        activeScreen: tab?.url === 'flame://home' ? 'home' as const : 'browser' as const,
      };
    });
  },

  updateTab: (id, updates) =>
    set(state => ({ tabs: state.tabs.map(t => t.id === id ? { ...t, ...updates } : t) })),

  duplicateTab: (id) => {
    const tab = get().tabs.find(t => t.id === id);
    if (tab) get().addTab(tab.url, tab.isPrivate);
  },

  // ── Navigation ──────────────────────────────────────────
  navigateTo: (url) => {
    const formatted = url.startsWith('http') || url.startsWith('flame://')
      ? url
      : url.includes('.')
        ? `https://${url}`
        : `https://www.google.com/search?q=${encodeURIComponent(url)}`;

    const { activeTabId } = get();
    if (activeTabId) {
      set(state => ({
        tabs: state.tabs.map(t =>
          t.id === activeTabId ? { ...t, url: formatted, isLoading: true, title: formatted } : t
        ),
        activeScreen: 'browser',
        isAddressBarFocused: false,
        addressInput: formatted,
      }));
    }
    // XP للبحث
    const { userId } = get();
    if (userId) profileService.addXP(userId, 'search', 2).catch(() => {});
  },

  setAddressInput:      (text)    => set({ addressInput: text }),
  setAddressBarFocused: (focused) => set({ isAddressBarFocused: focused }),
  toggleTabsView:       ()        => set(state => ({ showTabsView: !state.showTabsView })),

  // ── Bookmarks ───────────────────────────────────────────
  addBookmark: async (url, title, favicon) => {
    const { userId } = get();

    // Optimistic update أولاً
    const tempId = `bm-${Date.now()}`;
    const tempBookmark: Bookmark = { id: tempId, url, title, favicon, visitCount: 0, createdAt: new Date() };
    set(state => ({ bookmarks: [tempBookmark, ...state.bookmarks] }));

    if (userId) {
      try {
        const saved = await bookmarksService.add(userId, { url, title, favicon });
        // استبدل الـ temp بالـ real id
        set(state => ({
          bookmarks: state.bookmarks.map(b => b.id === tempId ? saved : b)
        }));
        await profileService.addXP(userId, 'bookmark_added', 10);
      } catch (err) {
        console.warn('[Flame] addBookmark error:', err);
        // يبقى الـ optimistic — مش بنلغيه
      }
    }
  },

  removeBookmark: async (id) => {
    // Optimistic
    set(state => ({ bookmarks: state.bookmarks.filter(b => b.id !== id) }));
    const { userId } = get();
    if (userId) {
      try { await bookmarksService.remove(id); }
      catch (err) { console.warn('[Flame] removeBookmark error:', err); }
    }
  },

  isBookmarked: (url) => get().bookmarks.some(b => b.url === url),

  // ── History ─────────────────────────────────────────────
  addToHistory: async (url, title, favicon) => {
    // Optimistic
    set(state => {
      const existing = state.history.findIndex(h => h.url === url);
      if (existing >= 0) {
        const updated = [...state.history];
        updated[existing] = { ...updated[existing], visitedAt: new Date(), visitCount: updated[existing].visitCount + 1 };
        return { history: updated };
      }
      const item: HistoryItem = {
        id: `h-${Date.now()}`, url, title, favicon, visitedAt: new Date(), visitCount: 1
      };
      return { history: [item, ...state.history].slice(0, 200) };
    });

    const { userId } = get();
    if (userId) {
      try { await historyService.recordVisit(userId, url, title, favicon); }
      catch (err) { console.warn('[Flame] addToHistory error:', err); }
    }
  },

  clearHistory: async () => {
    set({ history: [] });
    const { userId } = get();
    if (userId) {
      try { await historyService.clearAll(userId); }
      catch (err) { console.warn('[Flame] clearHistory error:', err); }
    }
  },

  // ── Settings ────────────────────────────────────────────
  updateSettings: async (updates) => {
    set(state => ({ settings: { ...state.settings, ...updates } }));
    const { userId, settings } = get();
    if (userId) {
      try { await profileService.saveSettings(userId, { ...settings, ...updates }); }
      catch (err) { console.warn('[Flame] saveSettings error:', err); }
    }
  },

  // ── UI ──────────────────────────────────────────────────
  setActiveScreen: (screen) => set({ activeScreen: screen }),
  setShowNavBar:   (show)   => set({ showNavBar: show }),
}));
