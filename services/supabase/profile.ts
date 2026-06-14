import { supabase, DbProfile } from './client';
import { AppSettings, UserProfile } from '../../types';

// ── تحويل DB → App type ──────────────────────────────────
const toUserProfile = (row: DbProfile): UserProfile => ({
  id:        row.id,
  name:      row.name,
  email:     row.email,
  avatar:    row.avatar_url ?? undefined,
  rank:      row.rank,
  xp:        row.xp,
  level:     row.level,
  stats:     row.stats as UserProfile['stats'],
  joinedAt:  new Date(row.created_at),
});

export const profileService = {

  /** جيب بروفايل المستخدم الحالي */
  fetchProfile: async (userId: string): Promise<UserProfile> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return toUserProfile(data as DbProfile);
  },

  /** حدّث الاسم والصورة */
  updateProfile: async (userId: string, updates: { name?: string; avatar_url?: string }) => {
    const { error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId);
    if (error) throw error;
  },

  /** جيب الإعدادات */
  fetchSettings: async (userId: string): Promise<AppSettings> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('settings')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data.settings as AppSettings;
  },

  /** احفظ الإعدادات */
  saveSettings: async (userId: string, settings: AppSettings) => {
    const { error } = await supabase
      .from('profiles')
      .update({ settings, updated_at: new Date().toISOString() })
      .eq('id', userId);
    if (error) throw error;
  },

  /** أضف XP (بياستخدام الـ postgres function) */
  addXP: async (userId: string, event: string, amount: number, metadata?: Record<string, unknown>) => {
    const { error } = await supabase.rpc('add_xp', {
      p_user_id:  userId,
      p_event:    event,
      p_xp:       amount,
      p_metadata: metadata ?? {},
    });
    if (error) throw error;
  },

  /** حدّث الـ stats */
  updateStats: async (userId: string, stats: UserProfile['stats']) => {
    const { error } = await supabase
      .from('profiles')
      .update({ stats, updated_at: new Date().toISOString() })
      .eq('id', userId);
    if (error) throw error;
  },
};
