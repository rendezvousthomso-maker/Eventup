-- Create events table for the event discovery platform
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Pet Meet', 'Games Night', 'Recreation')),
  date DATE NOT NULL,
  time TIME NOT NULL,
  location TEXT NOT NULL,
  address TEXT NOT NULL,
  seats INTEGER NOT NULL CHECK (seats > 0),
  host_name TEXT NOT NULL,
  host_whatsapp TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Create policies for events table
-- Allow everyone to view events (public discovery)
CREATE POLICY "events_select_all" 
  ON public.events FOR SELECT 
  USING (true);

-- Only authenticated users can insert events (host events)
CREATE POLICY "events_insert_authenticated" 
  ON public.events FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

-- Only the creator can update their events
CREATE POLICY "events_update_own" 
  ON public.events FOR UPDATE 
  USING (auth.uid() IS NOT NULL);

-- Only the creator can delete their events
CREATE POLICY "events_delete_own" 
  ON public.events FOR DELETE 
  USING (auth.uid() IS NOT NULL);
