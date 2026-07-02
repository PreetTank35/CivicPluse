-- ==============================================================================
-- CivicPulse (Civic+) — Authoritative Database Schema & Storage Setup
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES TABLE
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  avatar_url text,
  locality_id text default 'kothrud',
  role text default 'citizen' check (role in ('citizen', 'sub_admin', 'admin')),
  interests text[] default '{}',
  commute_mode text default 'public_transit',
  created_at timestamptz default now()
);

-- 2. ISSUES TABLE
create table if not exists public.issues (
  id uuid primary key default uuid_generate_v4(),
  reporter_id uuid references public.profiles(id) on delete set null,
  title text not null,
  description text not null,
  category text not null,
  severity text default 'medium' check (severity in ('low', 'medium', 'high', 'critical')),
  status text default 'open' check (status in ('open', 'acknowledged', 'in_progress', 'resolved', 'verified', 'escalated')),
  locality_id text not null,
  address text,
  lat double precision not null,
  lng double precision not null,
  evidence_urls text[] default '{}',
  video_url text,
  upvotes integer default 0,
  sla_deadline timestamptz default (now() + interval '48 hours'),
  created_at timestamptz default now()
);

-- 3. COMMENTS TABLE
create table if not exists public.comments (
  id uuid primary key default uuid_generate_v4(),
  issue_id uuid references public.issues(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  is_flagged boolean default false,
  created_at timestamptz default now()
);

-- 4. CHAT CONVERSATIONS & MESSAGES
create table if not exists public.conversations (
  id uuid primary key default uuid_generate_v4(),
  participant_one uuid references public.profiles(id) not null,
  participant_two uuid references public.profiles(id) not null,
  last_message text,
  updated_at timestamptz default now(),
  unique(participant_one, participant_two)
);

create table if not exists public.messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) not null,
  text text not null,
  status text default 'sent' check (status in ('sent', 'delivered', 'read')),
  created_at timestamptz default now()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
alter table public.profiles enable row level security;
alter table public.issues enable row level security;
alter table public.comments enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

-- Profiles policies
create policy "Public read profiles" on public.profiles for select using (true);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);

-- Issues policies
create policy "Anyone can read issues" on public.issues for select using (true);
create policy "Auth users can report issues" on public.issues for insert with check (auth.role() = 'authenticated');
create policy "Reporters or admins can update issues" on public.issues for update using (auth.uid() = reporter_id or exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'sub_admin')));

-- Comments policies
create policy "Anyone can read comments" on public.comments for select using (true);
create policy "Auth users can comment" on public.comments for insert with check (auth.role() = 'authenticated');
create policy "Users can delete own comment" on public.comments for delete using (auth.uid() = user_id);

-- Chat RLS: Only participants can read or send messages
create policy "Users access own conversations" on public.conversations
  for all using (auth.uid() = participant_one or auth.uid() = participant_two);

create policy "Users access messages in own conversations" on public.messages
  for all using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id and (c.participant_one = auth.uid() or c.participant_two = auth.uid())
    )
  );

-- ==============================================================================
-- STORAGE BUCKETS SETUP
-- ==============================================================================
insert into storage.buckets (id, name, public) values ('evidence', 'evidence', true) on conflict do nothing;

create policy "Public Evidence Read" on storage.objects for select using (bucket_id = 'evidence');
create policy "Auth Evidence Upload" on storage.objects for insert with check (bucket_id = 'evidence' and auth.role() = 'authenticated');
