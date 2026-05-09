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

    // Fetch user's tags
    const { data: userTransactions } = await supabase
      .from('transactions')
      .select('books(tags)')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
      .limit(10);
      
    if (!userTransactions || userTransactions.length === 0) {
       return new Response(JSON.stringify({ matches: [] }), { headers: { ...corsHeaders, "Content-Type": "application/json" }});
    }

    const myTags = new Set<string>();
    userTransactions.forEach(t => {
      t.books.tags?.forEach((tag: string) => myTags.add(tag));
    });

    // Find other users
    const { data: otherUsers } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .neq('id', user_id);

    const matches = [];
    
    for (const other of otherUsers || []) {
      const { data: otherTransactions } = await supabase
        .from('transactions')
        .select('books(tags)')
        .eq('user_id', other.id)
        .limit(20);
        
      let overlap = 0;
      otherTransactions?.forEach(t => {
        t.books.tags?.forEach((tag: string) => {
          if (myTags.has(tag)) overlap++;
        });
      });
      
      if (overlap > 0) {
        matches.push({ ...other, overlap_score: overlap });
      }
    }
    
    matches.sort((a, b) => b.overlap_score - a.overlap_score);
    const topMatches = matches.slice(0, 5);

    return new Response(JSON.stringify({ matches: topMatches }), {
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
