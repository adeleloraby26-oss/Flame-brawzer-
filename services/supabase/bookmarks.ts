import { supabase, DbBookmark } from './client';
import { Bookmark } from '../../types';

// ── تحويل DB → App type ──────────────────────────────────
const toBookmark = (row: DbBookmark): Bookmark => ({
  id:          row.id,
  url:         row.url,
  title:       row.title,
  favicon:     row.favicon ?? undefined,
  folderId:    row.folder_id ?? undefined,
  visitCount:  row.visit_count,
  createdAt:   new Date(row.created_at),
});

export const bookmarksService = {

  /** جيب كل الـ bookmarks */
  fetchAll: async (userId: string): Promise<Bookmark[]> => {
    const { data, error } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data as DbBookmark[]).map(toBookmark);
  },

  /** أضف bookmark جديد */
  add: async (userId: string, bookmark: Pick<Bookmark, 'url' | 'title' | 'favicon' | 'folderId'>): Promise<Bookmark> => {
    const { data, error } = await supabase
      .from('bookmarks')
      .insert({
        user_id:   userId,
        url:       bookmark.url,
        title:     bookmark.title,
        favicon:   bookmark.favicon ?? null,
        folder_id: bookmark.folderId ?? null,
      })
      .select()
      .single();
    if (error) throw error;
    return toBookmark(data as DbBookmark);
  },

  /** احذف bookmark */
  remove: async (bookmarkId: string) => {
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('id', bookmarkId);
    if (error) throw error;
  },

  /** حدّث عنوان أو folder */
  update: async (bookmarkId: string, updates: { title?: string; folder_id?: string | null }) => {
    const { data, error } = await supabase
      .from('bookmarks')
      .update(updates)
      .eq('id', bookmarkId)
      .select()
      .single();
    if (error) throw error;
    return toBookmark(data as DbBookmark);
  },

  /** زوّد visit_count للـ bookmark */
  incrementVisit: async (userId: string, url: string) => {
    // نجيب الـ bookmark الأول، نزوّد الـ count يدوياً
    const { data } = await supabase
      .from('bookmarks')
      .select('id, visit_count')
      .eq('user_id', userId)
      .eq('url', url)
      .single();
    if (!data) return;
    await supabase
      .from('bookmarks')
      .update({ visit_count: (data.visit_count ?? 0) + 1 })
      .eq('id', data.id);
  },

  /** تابع التغييرات real-time */
  subscribe: (userId: string, callback: (bookmarks: Bookmark[]) => void) => {
    const channel = supabase
      .channel(`bookmarks:${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookmarks', filter: `user_id=eq.${userId}` },
        async () => {
          // كل ما في تغيير، نجيب البيانات من جديد
          const fresh = await bookmarksService.fetchAll(userId);
          callback(fresh);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  },
};
