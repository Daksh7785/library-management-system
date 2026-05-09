import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (!supabaseUrl || !supabaseServiceRoleKey) throw new Error("Missing env vars");
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
    
    const { user_id } = await req.json();
    if (!user_id) throw new Error("user_id required");

    // Fetch user transactions and reading sessions
    const { data: transactions } = await supabase
      .from('transactions')
      .select('books(genre, tags, author)')
      .eq('user_id', user_id);

    const { data: sessions } = await supabase
      .from('reading_sessions')
      .select('pages_read, mood, started_at, ended_at')
      .eq('user_id', user_id);

    const genreCounts: Record<string, number> = {};
    const authorCounts: Record<string, number> = {};
    const moodPattern: Record<string, number> = {};
    let totalPages = 0;
    let totalSessionTime = 0; // in milliseconds

    transactions?.forEach(t => {
      const g = t.books.genre;
      if (g) genreCounts[g] = (genreCounts[g] || 0) + 1;
      
      const a = t.books.author;
      if (a) authorCounts[a] = (authorCounts[a] || 0) + 1;
    });

    sessions?.forEach(s => {
      totalPages += (s.pages_read || 0);
      if (s.mood) moodPattern[s.mood] = (moodPattern[s.mood] || 0) + 1;
      if (s.started_at && s.ended_at) {
        totalSessionTime += (new Date(s.ended_at).getTime() - new Date(s.started_at).getTime());
      }
    });

    // Determine top genres
    const top_genres = Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1])
      .map(e => e[0])
      .slice(0, 3);

    // Determine reading pace
    let reading_pace = 'medium';
    if (totalSessionTime > 0 && totalPages > 0) {
      const pagesPerHour = totalPages / (totalSessionTime / (1000 * 60 * 60));
      if (pagesPerHour > 40) reading_pace = 'fast';
      else if (pagesPerHour < 15) reading_pace = 'slow';
    }

    // Recommend next (simplified: pick a popular book in their top genre they haven't read)
    let recommended_next: any[] = [];
    if (top_genres.length > 0) {
      const { data: recs } = await supabase
        .from('books')
        .select('id, title, cover_url, author')
        .eq('genre', top_genres[0])
        .order('demand_score', { ascending: false })
        .limit(3);
      recommended_next = recs || [];
    }

    // Update profile
    const reading_dna = {
      top_genres,
      reading_pace,
      mood_pattern: Object.keys(moodPattern),
      recommended_next
    };

    await supabase.from('profiles').update({ reading_dna }).eq('id', user_id);

    return new Response(JSON.stringify(reading_dna), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
