'use client';
import { useEffect } from 'react';
import { getBrowserSupabase } from '@/lib/supabase/browser';

export function useAuthSync() {
  useEffect(() => {
    const supabase = getBrowserSupabase();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // tell server to update its cookies
        await fetch('/api/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event, session }),
        });
      }
    );
    return () => subscription.unsubscribe();
  }, []);
}
