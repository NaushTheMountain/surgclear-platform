-- SurgClear API: Core Production Schema (PostgreSQL / Supabase)
-- All monetary amounts are stored in integer ZAR cents (bigint)

create extension if not exists "pgcrypto";

-- 1. Patients Table (POPIA Compliant)
create table public.users_patients (
  id uuid primary key default gen_random_uuid(),
  id_number_encrypted text not null,
  full_name text not null,
  phone text not null,
  email text,
  emergency_contact jsonb default '{}'::jsonb,
  dietary_preferences jsonb default '["Standard"]'::jsonb,
  popia_consent_timestamp timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- 2. Medical Scheme & Gap Cover Policies
create table public.medical_policies (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.users_patients(id) on delete cascade,
  scheme_name text not null,           -- e.g., 'Discovery Health', 'Bonitas', 'Momentum'
  plan_name text not null,             -- e.g., 'Classic Smart Comprehensive'
  member_number text not null,
  dependent_code text not null default '00',
  gap_provider text,                   -- e.g., 'Sirago', 'Turnberry', 'Zestlife'
  gap_policy_number text,
  gap_max_tariff_pct int default 500,  -- Covers up to 500% of scheme rate
  gap_covers_dsp_copay boolean default true,
  msa_balance_cents bigint not null default 0,
  last_verified_at timestamptz default now(),
  created_at timestamptz not null default now()
);

-- 3. Master Surgical Episodes (Created by Specialist Practice Trigger)
create table public.surgical_episodes (
  id uuid primary key default gen_random_uuid(),
  episode_ref text unique not null,    -- e.g., 'EP-88492-ZA'
  patient_id uuid not null references public.users_patients(id),
  policy_id uuid not null references public.medical_policies(id),
  practice_bhf text not null,          -- e.g., 'BHF-0449218'
  surgeon_name text not null,
  anaesthetist_name text not null,
  hospital_id text not null,
  hospital_name text not null,
  is_dsp_network boolean not null default true,
  non_dsp_copay_cents bigint not null default 0,
  admission_date date not null,
  estimated_stay_days int not null default 2,
  procedure_title text not null,
  icd10_codes text[] not null,         -- e.g., ARRAY['M23.2', 'M17.1']
  rpl_tariff_codes text[] not null,    -- e.g., ARRAY['2443', '0023']
  specialist_rate_pct int not null default 250, -- e.g., 250% of scheme tariff
  hospital_base_cents bigint not null,
  surgeon_scheme_tariff_cents bigint not null,
  anaesthetist_scheme_tariff_cents bigint not null,
  pathology_estimate_cents bigint not null default 0,
  status text not null default 'QUOTE_READY'
    check (status in ('DRAFT', 'QUOTE_READY', 'AUTH_PENDING', 'AUTHORISED', 'CHECKED_IN', 'ADMITTED', 'DISCHARGED', 'SETTLED')),
  created_at timestamptz not null default now()
);

-- 4. Pre-Authorisations & Financial Clearance Snapshots
create table public.pre_authorisations (
  id uuid primary key default gen_random_uuid(),
  episode_id uuid not null references public.surgical_episodes(id) on delete cascade,
  auth_number text unique,             -- e.g., 'PA-884920-ZA'
  switch_provider text not null default 'MediSwitch_EDI',
  total_claimed_cents bigint not null,
  scheme_covered_cents bigint not null,
  specialist_shortfall_cents bigint not null,
  gap_covered_cents bigint not null,
  net_patient_liability_cents bigint not null,
  fhir_claim_payload jsonb not null,
  approved_at timestamptz,
  created_at timestamptz not null default now()
);

-- 5. Hospital Pre-Admissions & Ward Hospitality
create table public.hospital_admissions (
  id uuid primary key default gen_random_uuid(),
  episode_id uuid unique not null references public.surgical_episodes(id) on delete cascade,
  ward_type text not null default 'General_Ward', -- 'General_Ward' or 'Private_Suite'
  ward_upgrade_cents bigint not null default 0,
  dietary_tag text not null default 'Soft_Halal',
  selected_meal_code text not null,
  consent_signed boolean not null default false,
  consent_signed_at timestamptz,
  payment_method text,                 -- 'INSTANT_EFT', '6M_FINANCING', 'ZERO_COPAY'
  payment_reference text,
  qr_checkin_token text unique,        -- e.g., 'ADM-9941-JHB'
  created_at timestamptz not null default now()
);

-- 6. Post-Op Live Billing Ledger & Auto Gap Claims
create table public.episode_ledger_items (
  id uuid primary key default gen_random_uuid(),
  episode_id uuid not null references public.surgical_episodes(id) on delete cascade,
  provider_category text not null
    check (provider_category in ('HOSPITAL', 'SURGEON', 'ANAESTHETIST', 'PATHOLOGY', 'RADIOLOGY', 'PHARMACY')),
  provider_name text not null,
  bhf_number text not null,
  claimed_cents bigint not null,
  scheme_paid_cents bigint not null,
  gap_paid_cents bigint not null default 0,
  patient_liable_cents bigint not null default 0,
  gap_claim_reference text,
  claim_status text not null default 'APPROVED_PREAUTH'
    check (claim_status in ('APPROVED_PREAUTH', 'SHORTFALL_FLAGGED', 'GAP_AUTO_FILED', 'SETTLED')),
  created_at timestamptz not null default now()
);

-- Indexes for Fast Querying & Switching
create index idx_episodes_patient on public.surgical_episodes(patient_id);
create index idx_episodes_ref on public.surgical_episodes(episode_ref);
create index idx_preauth_episode on public.pre_authorisations(episode_id);
create index idx_admissions_qr on public.hospital_admissions(qr_checkin_token);
create index idx_ledger_episode on public.episode_ledger_items(episode_id);
