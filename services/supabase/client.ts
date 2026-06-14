import { createClient } from '@supabase/supabase-js';

// ─── ضع بياناتك هنا أو في .env ───────────────────────────
const SUPABASE_URL  = process.env.EXPO_PUBLIC_SUPABASE_URL  || 'https://rgdhkkmgpjqqqmjsnqaj.supabase.co';
const SUPABASE_ANON = process.env.EXPO_PUBLIC_SUPABASE_ANON || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnZGhra21ncGpxcXFtanNucWFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzODA4MjMsImV4cCI6MjA5Njk1NjgyM30.gD_tiT-TbU6X1g-pVaL78Sv1byy2ISBau6FH9DQ18CU';
// ─────────────────────────────────────────────────────────

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: {
    persistSession:     true,
    autoRefreshToken:   true,
    detectSessionInUrl: false,
  },
  realtime: { params: { eventsPerSecond: 10 } },
});

// ─── Database types (مبنية على الـ schema) ───────────────

export type DbProfile = {
  id:          string;
  name:        string;
  email:       string;
  avatar_url:  string | null;
  rank:        'Explorer' | 'Navigator' | 'Pioneer' | 'Voyager' | 'Legend';
  xp:          number;
  level:       number;
  stats:       {
    totalSearches:    number;
    totalTabsOpened:  number;
    dataBlocked:      number;
    timeSaved:        number;
  };
  settings:    Record<string, unknown>;
  created_at:  string;
  updated_at:  string;
};

export type DbBookmark = {
  id:          string;
  user_id:     string;
  url:         string;
  title:       string;
  favicon:     string | null;
  folder_id:   string | null;
  visit_count: number;
  created_at:  string;
  updated_at:  string;
};

export type DbHistoryItem = {
  id:          string;
  user_id:     string;
  url:         string;
  title:       string;
  favicon:     string | null;
  visit_count: number;
  visited_at:  string;
};

export type DbDownload = {
  id:               string;
  user_id:          string;
  url:              string;
  filename:         string;
  mime_type:        string;
  size_bytes:       number;
  downloaded_bytes: number;
  status:           'pending' | 'downloading' | 'completed' | 'failed' | 'paused';
  started_at:       string;
  completed_at:     string | null;
  updated_at:       string;
};

export type DbTabSession = {
  id:            string;
  user_id:       string;
  device_name:   string;
  tabs:          unknown[];
  active_tab_id: string | null;
  saved_at:      string;
};

export type DbSearchEngine = {
  id:           string;
  name:         string;
  url_template: string;
  icon_url:     string | null;
  color:        string;
  is_default:   boolean;
  is_builtin:   boolean;
  sort_order:   number;
};
