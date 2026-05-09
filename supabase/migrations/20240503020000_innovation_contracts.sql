-- Innovation Phase 2: Spatial, Predictive, and Cognitive Layers

-- 1. Copy Odyssey Map (Spatial Layer)
-- Add geographic tracking to the copy_timeline table
ALTER TABLE public.copy_timeline ADD COLUMN IF NOT EXISTS location_geo GEOGRAPHY(POINT);

-- Add index for spatial queries (requires PostGIS, but Supabase supports geography natively in PostGIS)
-- Ensure PostGIS is enabled if not already
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE INDEX IF NOT EXISTS copy_timeline_location_geo_idx ON public.copy_timeline USING GIST (location_geo);

-- 2. Return Risk Predictor (Predictive Intelligence)
-- Analyzes user's past return behavior and current loan load
CREATE OR REPLACE FUNCTION public.predict_return_risk(p_user_id UUID)
RETURNS FLOAT
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    COALESCE(AVG(EXTRACT(DAY FROM (return_date - due_date))), 0) * 0.2 + 
    (SELECT count(*) FROM public.transactions WHERE user_id = p_user_id AND NOT returned) * 0.5
  FROM public.transactions 
  WHERE user_id = p_user_id AND returned = true;
$$;

-- 3. Copy Personalities (AI Consciousness Layer)
-- Stores the synthesized "Soul" of a physical book copy
CREATE TABLE IF NOT EXISTS public.copy_personalities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    copy_id TEXT NOT NULL REFERENCES public.book_copies(copy_id) ON DELETE CASCADE,
    traits JSONB NOT NULL DEFAULT '[]'::jsonb,
    summary TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(copy_id)
);

-- RLS for copy_personalities
ALTER TABLE public.copy_personalities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Copy personalities are viewable by everyone."
ON public.copy_personalities FOR SELECT
USING (true);

-- Only service role (Edge Functions) can insert/update personalities
-- So we don't add public insert policies.
