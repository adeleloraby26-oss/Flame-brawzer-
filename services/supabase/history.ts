import { supabase, DbHistoryItem } from './client';
import { HistoryItem } from '../../types';

const toHistoryItem = (row: DbHistoryItem): HistoryItem => ({
  id:          row.id,
  url:         row.url,
  title:       row.title,
  favicon:     row.favicon ?? undefined,
  visitCount:  row.visit_count,
  visitedAt:   new Date(row.visited_at),
});

export const historyService = {

  /** جيب آخر 200 زيارة */
  fetchRecent: async (userId: string, limit = 200): Promise<HistoryItem[]> => {
    const { data, error } = await supabase
      .from('history')
      .select('*')
      .eq('user_id', userId)
      .order('visited_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data as DbHistoryItem[]).map(toHistoryItem);
  },

  /** سجّل زيارة (upsert — بياستخدام الـ postgres function) */
  recordVisit: async (userId: string, url: string, title: string, favicon?: string): Promise<HistoryItem> => {
    const { data, error } = await supabase.rpc('upsert_history', {
      p_user_id: userId,
      p_url:     url,
      p_title:   title,
      p_favicon: favicon ?? null,
    });
    if (error) throw error;
    return toHistoryItem(data as DbHistoryItem);
  },

  /** احذف زيارة واحدة */
  deleteItem: async (historyId: string) => {
    const { error } = await supabase.from('history').delete().eq('id', historyId);
    if (error) throw error;
  },

  /** امسح كل التاريخ */
  clearAll: async (userId: string) => {
    const { error } = await supabase.from('history').delete().eq('user_id', userId);
    if (error) throw error;
  },

  /** ابحث في التاريخ */
  search: async (userId: string, query: string): Promise<HistoryItem[]> => {
    const { data, error } = await supabase
      .from('history')
      .select('*')
      .eq('user_id', userId)
      .or(`title.ilike.%${query}%,url.ilike.%${query}%`)
      .order('visited_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    return (data as DbHistoryItem[]).map(toHistoryItem);
  },

  /** تابع التغييرات */
  subscribe: (userId: string, callback: (items: HistoryItem[]) => void) => {
    const channel = supabase
      .channel(`history:${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'history', filter: `user_id=eq.${userId}` },
        async () => {
          const fresh = await historyService.fetchRecent(userId);
          callback(fresh);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  },
};
