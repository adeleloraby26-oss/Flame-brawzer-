export interface Tab {
  id: string;
  url: string;
  title: string;
  favicon?: string;
  isLoading: boolean;
  isPrivate: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
  screenshot?: string;
  createdAt: Date;
  groupId?: string;
}

export interface TabGroup {
  id: string;
  name: string;
  color: string;
  tabIds: string[];
}

export interface Bookmark {
  id: string;
  url: string;
  title: string;
  favicon?: string;
  folderId?: string;
  createdAt: Date;
  visitCount: number;
}

export interface BookmarkFolder {
  id: string;
  name: string;
  bookmarkIds: string[];
}

export interface HistoryItem {
  id: string;
  url: string;
  title: string;
  favicon?: string;
  visitedAt: Date;
  visitCount: number;
}

export interface Download {
  id: string;
  url: string;
  filename: string;
  size: number;
  downloaded: number;
  status: 'pending' | 'downloading' | 'completed' | 'failed' | 'paused';
  startedAt: Date;
  completedAt?: Date;
  mimeType: string;
}

export interface SearchEngine {
  id: string;
  name: string;
  url: string;
  icon: string;
  color: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  rank: 'Explorer' | 'Navigator' | 'Pioneer' | 'Voyager' | 'Legend';
  xp: number;
  level: number;
  stats: {
    totalSearches: number;
    totalTabsOpened: number;
    dataBlocked: number;
    timeSaved: number;
  };
  joinedAt: Date;
}

export type Theme = 'dark' | 'light' | 'amoled' | 'auto';
export type SearchEngineId = 'google' | 'bing' | 'duckduckgo' | 'brave' | 'ecosia';

export interface AppSettings {
  theme: Theme;
  searchEngine: SearchEngineId;
  enableAnimations: boolean;
  enableHaptics: boolean;
  blockAds: boolean;
  blockTrackers: boolean;
  savePasswords: boolean;
  readerMode: boolean;
  customWallpaper?: string;
  showFavicons: boolean;
  compactMode: boolean;
  bottomAddressBar: boolean;
}

export interface SearchSuggestion {
  text: string;
  type: 'search' | 'url' | 'history' | 'bookmark';
  icon?: string;
}
