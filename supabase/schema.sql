-- ==============================================================================
-- CivicPulse — Database Schema & Storage Setup
-- Hyperlocal civic issue reporting + community support + government escalation
-- ==============================================================================

-- Enable extensions
create extension if not exists "uuid-ossp";
-- Note: PostGIS extension (for GEOGRAPHY types) requires manual setup on Supabase
-- create extension if not exists "postgis";

-- ==============================================================================
-- 1. USERS / PROFILES TABLE
-- ==============================================================================
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  phone text,
  email text,
  role text not null default 'citizen'
    check (role in ('citizen', 'moderator', 'super_admin')),
  assigned_locality_id text,  -- only used for moderator role
  locality_id text default 'kothrud',
  avatar_url text,
  impact_score integer default 0,
  is_verified boolean default false,
  created_at timestamptz default now()
);

-- ==============================================================================
-- 2. LOCALITIES TABLE
-- ==============================================================================
create table if not exists public.localities (
  id text primary key,
  name text not null,
  ward_number text,
  city text not null default 'Pune',
  pincode text,
  center_lat double precision,
  center_lng double precision,
  -- boundary GEOGRAPHY(POLYGON) -- requires PostGIS
  created_at timestamptz default now()
);

-- ==============================================================================
-- 3. PROBLEMS TABLE (was "issues")
-- ==============================================================================
create table if not exists public.problems (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete set null,
  title text not null,
  description text not null,
  category text not null
    check (category in (
      'pothole', 'garbage', 'water_leakage', 'electricity',
      'safety', 'drainage', 'stray_animals', 'streetlight', 'other'
    )),
  media_urls text[] default '{}',
  location_lat double precision not null,
  location_lng double precision not null,
  location_address text,
  locality_id text references public.localities(id),
  status text not null default 'reported'
    check (status in (
      'reported', 'verified', 'escalated', 'in_progress', 'resolved', 'rejected'
    )),
  support_count integer default 0,
  comment_count integer default 0,
  duplicate_of_id uuid references public.problems(id),
  flag_count integer default 0,
  is_hidden boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ==============================================================================
-- 4. PROBLEM SUPPORT TABLE (prevents double-support)
-- ==============================================================================
create table if not exists public.problem_support (
  id uuid primary key default uuid_generate_v4(),
  problem_id uuid references public.problems(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(problem_id, user_id)  -- prevents double-support
);

-- ==============================================================================
-- 5. COMMENTS TABLE
-- ==============================================================================
create table if not exists public.comments (
  id uuid primary key default uuid_generate_v4(),
  problem_id uuid references public.problems(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  text text not null,
  media_url text,
  created_at timestamptz default now()
);

-- ==============================================================================
-- 6. DEPARTMENTS TABLE
-- ==============================================================================
create table if not exists public.departments (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  category text not null,
  contact_email text,
  webhook_url text,
  api_key text,
  created_at timestamptz default now()
);

-- ==============================================================================
-- 7. ESCALATIONS TABLE
-- ==============================================================================
create table if not exists public.escalations (
  id uuid primary key default uuid_generate_v4(),
  problem_id uuid references public.problems(id) on delete cascade not null,
  department_id uuid references public.departments(id),
  escalated_by uuid references public.users(id),
  escalation_payload jsonb not null default '{}',
  status text not null default 'sent'
    check (status in ('sent', 'acknowledged', 'in_progress', 'resolved')),
  sent_at timestamptz default now(),
  resolved_at timestamptz
);

-- ==============================================================================
-- 8. STATUS HISTORY TABLE (audit trail)
-- ==============================================================================
create table if not exists public.status_history (
  id uuid primary key default uuid_generate_v4(),
  problem_id uuid references public.problems(id) on delete cascade not null,
  old_status text,
  new_status text not null,
  changed_by uuid references public.users(id),
  note text,
  created_at timestamptz default now()
);

-- ==============================================================================
-- 9. NOTIFICATIONS TABLE
-- ==============================================================================
create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade not null,
  type text not null
    check (type in (
      'status_change', 'support_milestone', 'comment',
      'escalated', 'verified', 'resolved', 'flagged'
    )),
  message text not null,
  related_problem_id uuid references public.problems(id),
  is_read boolean default false,
  created_at timestamptz default now()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
alter table public.users enable row level security;
alter table public.problems enable row level security;
alter table public.problem_support enable row level security;
alter table public.comments enable row level security;
alter table public.departments enable row level security;
alter table public.escalations enable row level security;
alter table public.status_history enable row level security;
alter table public.notifications enable row level security;
alter table public.localities enable row level security;

-- Users policies
create policy "Public read users" on public.users for select using (true);
create policy "Users update own profile" on public.users for update using (auth.uid() = id);

-- Localities policies
create policy "Public read localities" on public.localities for select using (true);

-- Problems policies
create policy "Anyone can read problems" on public.problems for select using (true);
create policy "Auth users can create problems" on public.problems
  for insert with check (auth.role() = 'authenticated');
create policy "Reporters or staff can update problems" on public.problems
  for update using (
    auth.uid() = user_id
    or exists (
      select 1 from public.users
      where id = auth.uid()
      and role in ('moderator', 'super_admin')
    )
  );

-- Problem support policies
create policy "Anyone can read support" on public.problem_support for select using (true);
create policy "Auth users can support" on public.problem_support
  for insert with check (auth.role() = 'authenticated');
create policy "Users can remove own support" on public.problem_support
  for delete using (auth.uid() = user_id);

-- Comments policies
create policy "Anyone can read comments" on public.comments for select using (true);
create policy "Auth users can comment" on public.comments
  for insert with check (auth.role() = 'authenticated');
create policy "Users can delete own comment" on public.comments
  for delete using (auth.uid() = user_id);

-- Departments policies
create policy "Anyone can read departments" on public.departments for select using (true);
create policy "Super admins manage departments" on public.departments
  for all using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'super_admin'
    )
  );

-- Escalations policies
create policy "Staff can read escalations" on public.escalations
  for select using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role in ('moderator', 'super_admin')
    )
  );
create policy "Staff can create escalations" on public.escalations
  for insert with check (
    exists (
      select 1 from public.users
      where id = auth.uid() and role in ('moderator', 'super_admin')
    )
  );

-- Status history policies
create policy "Anyone can read status history" on public.status_history
  for select using (true);

-- Notifications policies
create policy "Users read own notifications" on public.notifications
  for select using (auth.uid() = user_id);
create policy "System can create notifications" on public.notifications
  for insert with check (auth.role() = 'authenticated');
create policy "Users update own notifications" on public.notifications
  for update using (auth.uid() = user_id);

-- ==============================================================================
-- STORAGE BUCKETS SETUP
-- ==============================================================================
insert into storage.buckets (id, name, public)
values ('evidence', 'evidence', true)
on conflict do nothing;

create policy "Public Evidence Read" on storage.objects
  for select using (bucket_id = 'evidence');
create policy "Auth Evidence Upload" on storage.objects
  for insert with check (bucket_id = 'evidence' and auth.role() = 'authenticated');
