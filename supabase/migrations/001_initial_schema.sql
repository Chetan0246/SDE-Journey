-- ============================================================
-- SDE Journey — Full Database Schema
-- Run this in Supabase SQL Editor or via CLI
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  placement_target_date date default '2027-05-01',
  dsa_target integer default 150,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- ============================================================
-- SKILLS
-- ============================================================
create table if not exists public.skills (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  current_level integer default 0 check (current_level between 0 and 100),
  target_level integer default 100 check (target_level between 0 and 100),
  category text default 'Technical',
  sort_order integer default 0,
  created_at timestamptz default now()
);

alter table public.skills enable row level security;
create policy "Users manage own skills" on public.skills using (auth.uid() = user_id);

-- ============================================================
-- GOALS
-- ============================================================
create table if not exists public.goals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  target_date date,
  is_active boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now()
);

alter table public.goals enable row level security;
create policy "Users manage own goals" on public.goals using (auth.uid() = user_id);

-- ============================================================
-- DAILY PLANS
-- ============================================================
create table if not exists public.daily_plans (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  date date not null,
  planned_hours numeric(4,2) default 0,
  actual_hours numeric(4,2),
  status text default 'not_logged' check (status in ('excellent','good','average','poor','not_logged')),
  created_at timestamptz default now(),
  unique(user_id, date)
);

alter table public.daily_plans enable row level security;
create policy "Users manage own daily plans" on public.daily_plans using (auth.uid() = user_id);

-- ============================================================
-- TASKS
-- ============================================================
create table if not exists public.tasks (
  id uuid default uuid_generate_v4() primary key,
  daily_plan_id uuid references public.daily_plans(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  category text not null,
  priority integer default 2 check (priority in (1,2,3)),
  estimated_duration integer default 60, -- minutes
  planned_start time,
  planned_end time,
  sort_order integer default 0,
  created_at timestamptz default now()
);

alter table public.tasks enable row level security;
create policy "Users manage own tasks" on public.tasks using (auth.uid() = user_id);

-- ============================================================
-- TASK LOGS
-- ============================================================
create table if not exists public.task_logs (
  id uuid default uuid_generate_v4() primary key,
  task_id uuid references public.tasks(id) on delete set null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  date date not null,
  status text not null check (status in ('completed','partial','skipped','rescheduled')),
  actual_duration integer, -- minutes
  completion_percent integer check (completion_percent between 0 and 100),
  is_unplanned boolean default false,
  name text, -- for unplanned tasks
  category text,
  notes text,
  created_at timestamptz default now()
);

alter table public.task_logs enable row level security;
create policy "Users manage own task logs" on public.task_logs using (auth.uid() = user_id);

-- ============================================================
-- TIME LOGS
-- ============================================================
create table if not exists public.time_logs (
  id uuid default uuid_generate_v4() primary key,
  daily_plan_id uuid references public.daily_plans(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  date date not null,
  category text not null,
  minutes integer not null,
  is_productive boolean default true,
  created_at timestamptz default now()
);

alter table public.time_logs enable row level security;
create policy "Users manage own time logs" on public.time_logs using (auth.uid() = user_id);

-- ============================================================
-- DAILY REVIEWS
-- ============================================================
create table if not exists public.daily_reviews (
  id uuid default uuid_generate_v4() primary key,
  daily_plan_id uuid references public.daily_plans(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  date date not null,
  most_valuable text,
  failed_task text,
  failure_reasons text[] default '{}',
  learnings text,
  mistake_to_avoid text,
  tomorrow_one_thing text,
  score_focus integer check (score_focus between 1 and 10),
  score_discipline integer check (score_discipline between 1 and 10),
  score_learning integer check (score_learning between 1 and 10),
  score_productivity integer check (score_productivity between 1 and 10),
  score_technical integer check (score_technical between 1 and 10),
  score_energy integer check (score_energy between 1 and 10),
  overall_score numeric(4,2),
  ai_review jsonb,
  ai_tomorrow_plan jsonb,
  created_at timestamptz default now(),
  unique(user_id, date)
);

alter table public.daily_reviews enable row level security;
create policy "Users manage own reviews" on public.daily_reviews using (auth.uid() = user_id);

-- ============================================================
-- DSA PROBLEMS
-- ============================================================
create table if not exists public.dsa_problems (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  platform text not null,
  topic text not null,
  difficulty text not null check (difficulty in ('easy','medium','hard')),
  url text,
  date_solved date not null,
  time_taken integer, -- minutes
  solved_independently boolean default true,
  needed_hint boolean default false,
  needed_solution boolean default false,
  reattempt_date date,
  confidence integer default 3 check (confidence between 1 and 5),
  is_mastered boolean default false,
  notes text,
  created_at timestamptz default now()
);

alter table public.dsa_problems enable row level security;
create policy "Users manage own DSA problems" on public.dsa_problems using (auth.uid() = user_id);

-- ============================================================
-- PROJECTS
-- ============================================================
create table if not exists public.projects (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  goal text,
  architecture text,
  technologies text[] default '{}',
  deployment_status text,
  github_url text,
  is_active boolean default true,
  created_at timestamptz default now()
);

alter table public.projects enable row level security;
create policy "Users manage own projects" on public.projects using (auth.uid() = user_id);

-- ============================================================
-- PROJECT TASKS
-- ============================================================
create table if not exists public.project_tasks (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  status text default 'todo' check (status in ('todo','in_progress','completed')),
  sort_order integer default 0,
  created_at timestamptz default now()
);

alter table public.project_tasks enable row level security;
create policy "Users manage own project tasks" on public.project_tasks using (auth.uid() = user_id);

-- ============================================================
-- PROJECT BUGS
-- ============================================================
create table if not exists public.project_bugs (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  is_resolved boolean default false,
  created_at timestamptz default now()
);

alter table public.project_bugs enable row level security;
create policy "Users manage own project bugs" on public.project_bugs using (auth.uid() = user_id);

-- ============================================================
-- DISTRACTION LOGS
-- ============================================================
create table if not exists public.distraction_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  date date not null,
  category text not null,
  duration integer not null, -- minutes
  is_intentional boolean default false,
  created_at timestamptz default now()
);

alter table public.distraction_logs enable row level security;
create policy "Users manage own distraction logs" on public.distraction_logs using (auth.uid() = user_id);

-- ============================================================
-- WEEKLY REVIEWS
-- ============================================================
create table if not exists public.weekly_reviews (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  week_start date not null,
  week_end date not null,
  planned_hours numeric(6,2),
  actual_hours numeric(6,2),
  completion_percent numeric(5,2),
  avg_daily_hours numeric(4,2),
  most_productive_day text,
  least_productive_day text,
  most_common_distraction text,
  most_skipped_category text,
  most_consistent_habit text,
  category_breakdown jsonb default '{}',
  ai_assessment jsonb,
  created_at timestamptz default now(),
  unique(user_id, week_start)
);

alter table public.weekly_reviews enable row level security;
create policy "Users manage own weekly reviews" on public.weekly_reviews using (auth.uid() = user_id);

-- ============================================================
-- FUNCTION: auto-create profile on signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);

  -- Pre-populate skills
  insert into public.skills (user_id, name, current_level, sort_order) values
    (new.id, 'Java', 0, 1),
    (new.id, 'DSA', 0, 2),
    (new.id, 'SQL', 0, 3),
    (new.id, 'Spring Boot', 0, 4),
    (new.id, 'PostgreSQL', 0, 5),
    (new.id, 'Backend Engineering', 0, 6),
    (new.id, 'System Design', 0, 7),
    (new.id, 'CS Fundamentals', 0, 8),
    (new.id, 'Docker/Cloud', 0, 9),
    (new.id, 'AI-assisted Engineering', 0, 10);

  -- Pre-populate goals (roadmap)
  insert into public.goals (user_id, title, sort_order) values
    (new.id, 'Java + DSA', 1),
    (new.id, 'SQL + DBMS', 2),
    (new.id, 'Spring Boot', 3),
    (new.id, 'PostgreSQL', 4),
    (new.id, 'Redis', 5),
    (new.id, 'Kafka', 6),
    (new.id, 'Docker', 7),
    (new.id, 'AWS', 8),
    (new.id, 'System Design', 9),
    (new.id, 'AI-assisted Software Engineering', 10);

  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
