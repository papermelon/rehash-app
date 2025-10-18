import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const supabase = await getServerSupabase();
  const { event, session } = await req.json();

  if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
    // writes auth cookies for the server
    await supabase.auth.setSession({
      access_token: session?.access_token ?? '',
      refresh_token: session?.refresh_token ?? ''
    });
  } else if (event === 'SIGNED_OUT') {
    await supabase.auth.signOut();
  }
  return NextResponse.json({ ok: true });
}
