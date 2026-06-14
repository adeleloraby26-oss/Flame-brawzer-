import { supabase, DbTabSession } from './client';
import { Tab } from '../../types';

export const tabSessionsService = {

  /** احفظ التابات الحالية */
  save: async (userId: string, tabs: Tab[], activeTabId: string | null, deviceName = 'My Device') => {
    // نمسح الجلسة القديمة لنفس الـ device ونحطها من جديد (upsert)
    const { error } = await supabase
      .from('tab_sessions')
      .upsert({
        user_id:       userId,
        device_name:   deviceName,
        tabs:          tabs.map(t => ({
          id:         t.id,
          url:        t.url,
          title:      t.title,
          isPrivate:  t.isPrivate,
          createdAt:  t.createdAt.toISOString(),
        })),
        active_tab_id: activeTabId,
        saved_at:      new Date().toISOString(),
      }, { onConflict: 'user_id,device_name' });
    if (error) throw error;
  },

  /** جيب جلسات كل الأجهزة */
  fetchAll: async (userId: string) => {
    const { data, error } = await supabase
      .from('tab_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('saved_at', { ascending: false });
    if (error) throw error;
    return data as DbTabSession[];
  },
};
