-- ============================================================
--  AMORAI · Supabase schema
--  Run this in: Supabase Dashboard → SQL Editor → New query → Run
--  Safe to re-run (uses IF NOT EXISTS / CREATE OR REPLACE).
-- ============================================================

-- ---------- 1. PROFILES  (your "users" table) --------------
-- Supabase reserves auth.users for credentials/passwords, so app
-- data lives in public.profiles, keyed 1:1 to the auth user.
create table if not exists public.profiles (
    id            uuid primary key references auth.users(id) on delete cascade,
    email         text,
    display_name  text,
    language      text    not null default 'en',
    mood          text    not null default 'flirty',
    voice_enabled boolean not null default true,
    free_images   int     not null default 10,
    is_premium    boolean not null default false,
    created_at    timestamptz not null default now(),
    updated_at    timestamptz not null default now()
);

-- ---------- 2. CHATS  (one row per message) ----------------
create table if not exists public.chats (
    id         bigint generated always as identity primary key,
    user_id    uuid not null references auth.users(id) on delete cascade,
    role       text not null check (role in ('user','assistant')),
    content    text not null,
    image_url  text,
    created_at timestamptz not null default now()
);
create index if not exists chats_user_created_idx
    on public.chats (user_id, created_at);

-- ---------- 3. PHOTOS  (generated images) ------------------
create table if not exists public.photos (
    id         bigint generated always as identity primary key,
    user_id    uuid not null references auth.users(id) on delete cascade,
    prompt     text,
    url        text not null,          -- public URL in Supabase Storage
    provider   text default 'fal.ai',
    created_at timestamptz not null default now()
);
create index if not exists photos_user_created_idx
    on public.photos (user_id, created_at);

-- ============================================================
--  ROW LEVEL SECURITY  — every row is private to its owner.
--  The publishable (anon) key is exposed in the browser, so RLS
--  is what actually keeps user A from reading user B's data.
--  The secret key (server only) bypasses all of this.
-- ============================================================
alter table public.profiles enable row level security;
alter table public.chats    enable row level security;
alter table public.photos   enable row level security;

-- profiles: owner can read/update own row
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
    for select using (auth.uid() = id);
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
    for update using (auth.uid() = id);

-- chats: owner can read/insert own rows
drop policy if exists "chats_select_own" on public.chats;
create policy "chats_select_own" on public.chats
    for select using (auth.uid() = user_id);
drop policy if exists "chats_insert_own" on public.chats;
create policy "chats_insert_own" on public.chats
    for insert with check (auth.uid() = user_id);
drop policy if exists "chats_delete_own" on public.chats;
create policy "chats_delete_own" on public.chats
    for delete using (auth.uid() = user_id);

-- photos: owner can read/insert own rows
drop policy if exists "photos_select_own" on public.photos;
create policy "photos_select_own" on public.photos
    for select using (auth.uid() = user_id);
drop policy if exists "photos_insert_own" on public.photos;
create policy "photos_insert_own" on public.photos
    for insert with check (auth.uid() = user_id);

-- ============================================================
--  AUTO-CREATE a profile whenever someone signs up.
--  Fires on every new auth.users row (SECURITY DEFINER so it
--  can write to profiles regardless of the caller's role).
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
    insert into public.profiles (id, email, display_name)
    values (
        new.id,
        new.email,
        coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1))
    )
    on conflict (id) do nothing;
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();

-- ============================================================
--  STORAGE bucket for generated photos (public read).
-- ============================================================
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

-- Allow anyone to READ objects in the public 'photos' bucket.
drop policy if exists "photos_public_read" on storage.objects;
create policy "photos_public_read" on storage.objects
    for select using (bucket_id = 'photos');
-- Writes happen only from the server (secret key), which bypasses
-- these policies, so no INSERT policy is needed here.
