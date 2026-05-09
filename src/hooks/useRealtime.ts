import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

type RealtimePayload = {
  schema: string;
  table: string;
  commit_timestamp: string;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: Record<string, any>;
  old: Record<string, any>;
  errors: string[] | null;
};

export const useRealtime = (
  table: string,
  onUpdate: (payload: RealtimePayload) => void,
  filter?: string
) => {
  useEffect(() => {
    let channel: RealtimeChannel;
    
    if (filter) {
      channel = supabase.channel(`public:${table}:${filter}`)
        .on('postgres_changes', { event: '*', schema: 'public', table, filter }, (payload: any) => {
          onUpdate(payload);
        })
        .subscribe();
    } else {
      channel = supabase.channel(`public:${table}`)
        .on('postgres_changes', { event: '*', schema: 'public', table }, (payload: any) => {
          onUpdate(payload);
        })
        .subscribe();
    }

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, filter, onUpdate]);
};
