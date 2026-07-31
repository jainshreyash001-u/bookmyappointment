-- ==========================================
-- Migration & Schema Reset for Multi-Clinic Support
-- Paste and run this script in your Supabase SQL Editor.
-- WARNING: This will drop old tables and create the new schema.
-- ==========================================

-- Drop legacy tables if they exist
drop table if exists appointments cascade;
drop table if exists patients cascade;
drop table if exists dentist_knowledge cascade;
drop table if exists dentists cascade;
drop table if exists dentist_users cascade;

-- 1. Enable pgvector extension
create extension if not exists vector;

-- 2. DENTIST USERS Table (Auth and Doctor Profile)
create table dentist_users (
    id uuid default gen_random_uuid() primary key,
    email text unique not null,
    password_hash text not null,
    name text, -- Doctor's professional name
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. DENTISTS (CLINICS) Table (Each location/bot configuration)
create table dentists (
    id uuid default gen_random_uuid() primary key,
    dentist_id text unique not null, -- Unique clinic code (e.g. DT_A1B2C3D4)
    owner_id uuid references dentist_users(id) on delete cascade, -- Link to user account
    name text, -- Clinic name
    clinic_name text, -- Clinic name (legacy duplicate)
    email text, -- Contact email (not unique)
    whatsapp_number text, -- WhatsApp number
    working_hours jsonb default '{}'::jsonb,
    subscription_status text default 'trial',
    trial_ends_at timestamp with time zone,
    slack_notification_mode text default 'none',
    slack_webhook text,
    google_calendar_token jsonb default '{}'::jsonb,
    google_calendar_id text default 'primary',
    clinic_address text, -- Clinic address (the primary differentiator)
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. PATIENTS Table
create table patients (
    id uuid default gen_random_uuid() primary key,
    dentist_id text references dentists(dentist_id) on delete cascade,
    phone_number text not null,
    name text,
    email text,
    conversation_history jsonb default '[]'::jsonb,
    last_contact timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(dentist_id, phone_number)
);

-- 5. APPOINTMENTS Table
create table appointments (
    id uuid default gen_random_uuid() primary key,
    dentist_id text references dentists(dentist_id) on delete cascade,
    patient_name text,
    patient_phone text,
    service text,
    date_time timestamp with time zone,
    duration integer default 60,
    status text default 'pending_confirmation',
    reminder_sent boolean default false,
    notes text,
    event_id text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. DENTIST KNOWLEDGE Table
create table dentist_knowledge (
    id uuid default gen_random_uuid() primary key,
    dentist_id text references dentists(dentist_id) on delete cascade,
    type text default 'general',
    title text,
    content text,
    embedding vector(384),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Create RAG Search Matching Function
create or replace function match_knowledge (
  query_embedding vector(384),
  match_threshold float,
  match_count int,
  filter_dentist_id text
)
returns table (
  id uuid,
  dentist_id text,
  type text,
  title text,
  content text,
  similarity float
)
language plpgsql stable
as $$
begin
  return query
  select
    dk.id,
    dk.dentist_id,
    dk.type,
    dk.title,
    dk.content,
    1 - (dk.embedding <=> query_embedding) as similarity
  from dentist_knowledge dk
  where dk.dentist_id = filter_dentist_id
    and 1 - (dk.embedding <=> query_embedding) > match_threshold
  order by dk.embedding <=> query_embedding
  limit match_count;
end;
$$;
