-- Supabase database schema for Road Sign Factory
-- This will be automatically created through Supabase dashboard

-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Projects table (extends built-in auth.users)
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (length(name) > 0 AND length(name) <= 255),
  description TEXT DEFAULT '',
  project_data JSONB NOT NULL,
  thumbnail_url TEXT,
  metadata JSONB DEFAULT '{}',
  is_public BOOLEAN DEFAULT FALSE,
  shared_token TEXT UNIQUE,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project sharing table
CREATE TABLE project_shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  shared_with_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  permission_level TEXT DEFAULT 'view' CHECK (permission_level IN ('view', 'edit', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, shared_with_user_id)
);

-- Usage analytics table
CREATE TABLE usage_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_updated_at ON projects(updated_at DESC);
CREATE INDEX idx_projects_public ON projects(is_public) WHERE is_public = TRUE;
CREATE INDEX idx_projects_shared_token ON projects(shared_token) WHERE shared_token IS NOT NULL;
CREATE INDEX idx_project_shares_user_id ON project_shares(shared_with_user_id);
CREATE INDEX idx_usage_stats_user_id ON usage_stats(user_id);

-- Row Level Security (RLS) policies
-- Users can only see their own projects
CREATE POLICY "Users can view own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own projects
CREATE POLICY "Users can insert own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own projects
CREATE POLICY "Users can update own projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own projects
CREATE POLICY "Users can delete own projects" ON projects
  FOR DELETE USING (auth.uid() = user_id);

-- Public projects are viewable by anyone
CREATE POLICY "Public projects are viewable" ON projects
  FOR SELECT USING (is_public = TRUE);

-- Shared projects policies
CREATE POLICY "Users can view shared projects" ON project_shares
  FOR SELECT USING (auth.uid() = shared_with_user_id);

-- Functions for updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for projects updated_at
CREATE TRIGGER update_projects_updated_at 
  BEFORE UPDATE ON projects
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically log usage stats
CREATE OR REPLACE FUNCTION log_project_access()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO usage_stats (user_id, event_type, event_data)
  VALUES (
    auth.uid(),
    TG_OP || '_PROJECT',
    jsonb_build_object(
      'project_id', NEW.id,
      'project_name', NEW.name
    )
  );
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for usage logging
CREATE TRIGGER log_project_access_trigger
  AFTER INSERT OR UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION log_project_access();

-- Storage bucket policies (for file uploads)
-- This needs to be set in Supabase dashboard under Storage > Policies

-- Allow authenticated users to upload to their own folder
-- Bucket: project-files
-- Policy: Users can upload to own folder
-- ((bucket_id = 'project-files') AND ((auth.uid())::text = (storage.foldername(name))[1]))
