import { supabase, DbDownload } from './client';
import { Download } from '../../types';

const toDownload = (row: DbDownload): Download => ({
  id:          row.id,
  url:         row.url,
  filename:    row.filename,
  mimeType:    row.mime_type,
  size:        row.size_bytes,
  downloaded:  row.downloaded_bytes,
  status:      row.status,
  startedAt:   new Date(row.started_at),
  completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
});

export const downloadsService = {

  fetchAll: async (userId: string): Promise<Download[]> => {
    const { data, error } = await supabase
      .from('downloads')
      .select('*')
      .eq('user_id', userId)
      .order('started_at', { ascending: false });
    if (error) throw error;
    return (data as DbDownload[]).map(toDownload);
  },

  create: async (userId: string, dl: Omit<Download, 'id' | 'startedAt'>): Promise<Download> => {
    const { data, error } = await supabase
      .from('downloads')
      .insert({
        user_id:          userId,
        url:              dl.url,
        filename:         dl.filename,
        mime_type:        dl.mimeType,
        size_bytes:       dl.size,
        downloaded_bytes: dl.downloaded,
        status:           dl.status,
      })
      .select()
      .single();
    if (error) throw error;
    return toDownload(data as DbDownload);
  },

  updateProgress: async (id: string, downloadedBytes: number, status: Download['status']) => {
    const updates: Record<string, unknown> = { downloaded_bytes: downloadedBytes, status };
    if (status === 'completed') updates.completed_at = new Date().toISOString();
    const { error } = await supabase.from('downloads').update(updates).eq('id', id);
    if (error) throw error;
  },

  remove: async (id: string) => {
    const { error } = await supabase.from('downloads').delete().eq('id', id);
    if (error) throw error;
  },

  subscribe: (userId: string, callback: (downloads: Download[]) => void) => {
    const channel = supabase
      .channel(`downloads:${userId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'downloads', filter: `user_id=eq.${userId}` },
        async () => {
          const fresh = await downloadsService.fetchAll(userId);
          callback(fresh);
        }
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  },
};
