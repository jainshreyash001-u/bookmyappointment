-- 1. Enable pgvector extension
create extension if not exists vector;

-- 2. DENTISTS Table
create table if not exists dentists (
    id uuid default gen_random_uuid() primary key,
    dentist_id text unique not null,
    name text,
    clinic_name text,
    email text unique not null,
    whatsapp_number text,
    working_hours jsonb default '{}'::jsonb,
    subscription_status text default 'trial',
    trial_ends_at timestamp with time zone,
    slack_notification_mode text default 'none',
    slack_webhook text,
    google_calendar_token jsonb default '{}'::jsonb,
    google_calendar_id text default 'primary',
    clinic_address text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. PATIENTS Table
create table if not exists patients (
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

-- 4. APPOINTMENTS Table
create table if not exists appointments (
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

-- 5. DENTIST KNOWLEDGE Table (Replacing Pinecone, using 384 dimensions for MiniLM)
create table if not exists dentist_knowledge (
    id uuid default gen_random_uuid() primary key,
    dentist_id text references dentists(dentist_id) on delete cascade,
    type text default 'general',
    title text,
    content text,
    embedding vector(384), -- 384 dimensions for all-MiniLM-L6-v2
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Create RAG Search Matching Function
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
