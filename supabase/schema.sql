-- ==============================================================================
-- KANSYA HYBRID CLOUD BACKEND (SUPABASE SQL SCHEMA)
-- ==============================================================================
-- Run this script in your Supabase SQL Editor (https://supabase.com/dashboard)
-- to enable live, real-time multi-device invitations and Collab Squad syncing.
-- ==============================================================================

-- 1. PROFILES TABLE (Public Directory for Username Lookup)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  avatar_id TEXT DEFAULT 'avatar_1',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. COLLAB GOALS TABLE (Shared Duo & Group Targets)
CREATE TABLE IF NOT EXISTS public.collab_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invite_code TEXT UNIQUE NOT NULL, -- e.g. "BORA-924"
  title TEXT NOT NULL,
  target_price BIGINT NOT NULL,
  current_amount BIGINT DEFAULT 0 NOT NULL,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  color_theme TEXT DEFAULT '#10B981'
);

-- 3. COLLAB MEMBERS TABLE (Contributors to each Shared Goal)
CREATE TABLE IF NOT EXISTS public.collab_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID REFERENCES public.collab_goals(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  deposited_amount BIGINT DEFAULT 0 NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(goal_id, username)
);

-- 4. COLLAB INVITES TABLE (Direct Username-to-Username Invitations)
CREATE TABLE IF NOT EXISTS public.collab_invites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID REFERENCES public.collab_goals(id) ON DELETE CASCADE,
  from_username TEXT NOT NULL,
  to_username TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 5. COLLAB DEPOSITS TABLE (Audit Ledger of Shared Deposits)
CREATE TABLE IF NOT EXISTS public.collab_deposits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID REFERENCES public.collab_goals(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  full_name TEXT NOT NULL,
  amount BIGINT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- INDEXES FOR FAST PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_collab_goals_invite_code ON public.collab_goals(invite_code);
CREATE INDEX IF NOT EXISTS idx_collab_members_username ON public.collab_members(username);
CREATE INDEX IF NOT EXISTS idx_collab_invites_to_username ON public.collab_invites(to_username);
CREATE INDEX IF NOT EXISTS idx_collab_deposits_goal_id ON public.collab_deposits(goal_id);

-- ROW LEVEL SECURITY (RLS) POLICIES
-- For student squads, enable read/write access with public anon key
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collab_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collab_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collab_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collab_deposits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read/insert on profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/insert/update on collab_goals" ON public.collab_goals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/insert/update on collab_members" ON public.collab_members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/insert/update on collab_invites" ON public.collab_invites FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/insert on collab_deposits" ON public.collab_deposits FOR ALL USING (true) WITH CHECK (true);
