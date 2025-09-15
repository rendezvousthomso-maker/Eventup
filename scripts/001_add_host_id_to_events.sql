-- Add host_id column to events table to link events to users
ALTER TABLE events ADD COLUMN IF NOT EXISTS host_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Enable Row Level Security on events table
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for events table
CREATE POLICY "Users can view all events" ON events FOR SELECT USING (true);
CREATE POLICY "Users can insert their own events" ON events FOR INSERT WITH CHECK (auth.uid() = host_id);
CREATE POLICY "Users can update their own events" ON events FOR UPDATE USING (auth.uid() = host_id);
CREATE POLICY "Users can delete their own events" ON events FOR DELETE USING (auth.uid() = host_id);
