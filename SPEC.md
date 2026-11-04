# SPEC.md - The Immutable Blueprint
**System:** SurgClear API & Patient Pass Engine  
**Version:** 2.0.0 (Core Production Schema Baseline)  
**Status:** IMMUTABLE BASELINE  
**Notice:** Neither Claude nor Antigravity may alter or deviate from this database schema, API signatures, business logic, or currency rules without an explicit written user directive.

---

## 1. System Vision & Architecture

SurgClear is a B2B2C South African Healthcare Pre-Authorisation, Financial Clearance, and Hospital Pre-Admission Aggregator API & Patient Pass PWA. It bridges specialist practices, South African healthcare switching houses (MediSwitch, Healthbridge, SpesNet), payment gateways, and hospital admissions.

```
+------------------------------------+       +------------------------------------+
|  Specialist Practice Trigger UI   |       |   4-Step Patient Surgical Pass PWA |
| (/src/app/portal/specialist/*)    |       |  (/src/app/pass/[episode_id]/*)    |
| (Clinical coding: ICD-10 & RPL)   |       |  (Halal/Soft Meals, QR Check-in)   |
+-----------------+------------------+       +-----------------+------------------+
                  |                                            |
                  v                                            v
+---------------------------------------------------------------------------------+
|                       SurgClear Core B2B & Pre-Admission Engine                 |
|                             (/src/app/api/v1/*)                                 |
|   - Cost Engine (/src/lib/cost-engine.ts): DSP rules, 100-500% RPL, Gap Cover   |
|   - FHIR Engine (/src/lib/fhir-engine.ts): HL7 FHIR R4 Patient/Coverage/Claim   |
+--------------------+-------------------------------------+----------------------+
                     |                                     |
                     v                                     v
+------------------------------------+       +------------------------------------+
| SA Switching Houses (EDI Adapters) |       | Payments & Medical Financing       |
| - MediSwitch                       |       | - Stitch / PayFast Instant EFT     |
| - Healthbridge                     |       | - 6-Month Medical Co-Pay Financing |
| - SpesNet                          |       | (All in integer ZAR cents bigint)  |
+------------------------------------+       +------------------------------------+
```

### Core Architecture Pillars:
- **Framework:** Next.js 15 (App Router, Server Actions, Route Handlers, TypeScript, Tailwind CSS, Lucide Icons).
- **Database & Auth:** Supabase (PostgreSQL 15+, `pgcrypto`, POPIA-compliant encryption, RLS policies, all currency stored in integer ZAR cents `bigint`).
- **Interoperability:** HL7 FHIR R4 (`Patient`, `Coverage`, `Claim`, `Appointment`) + SA Switching House adapters (MediSwitch / Healthbridge / SpesNet).
- **Payments & Financing:** PayFast / Stitch Instant EFT & 6-Month Medical Co-Pay Financing adapters.
- **Client Portals & UI:**
  - `/src/app/portal/specialist/*` - Specialist Practice Trigger UI.
  - `/src/app/pass/[episode_id]/*` - 4-Step Patient Surgical Pass PWA (Halal/Soft Meal Selector, QR Check-in).
  - `/src/app/developer/*` - Live B2B API & Revenue Inspector UI.

---

## 2. Core Production Database Schema (PostgreSQL / Supabase)

All monetary amounts are strictly stored as integer **ZAR cents** (`bigint`).

```sql
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

-- Indexes
create index idx_episodes_patient on public.surgical_episodes(patient_id);
create index idx_episodes_ref on public.surgical_episodes(episode_ref);
create index idx_preauth_episode on public.pre_authorisations(episode_id);
create index idx_admissions_qr on public.hospital_admissions(qr_checkin_token);
create index idx_ledger_episode on public.episode_ledger_items(episode_id);
```

---

## 3. Core Engine Specifications

### 3.1 Cost Engine (`/src/lib/cost-engine.ts`)
- **Zero Floating-Point Math:** All arithmetic in integer ZAR cents (`bigint`).
- **Specialist Shortfall Calculation:**
  $$\text{specialist\_charged} = \text{tariff\_cents} \times \left(\frac{\text{specialist\_rate\_pct}}{100}\right)$$
  $$\text{specialist\_shortfall} = \text{specialist\_charged} - \text{scheme\_covered}$$
- **DSP Co-Pay Penalty:** If `is_dsp_network == false`, add `non_dsp_copay_cents`.
- **Gap Cover Math:** If patient policy has gap coverage:
  - Covers up to `gap_max_tariff_pct` (e.g. 500%).
  - If `gap_covers_dsp_copay == true`, covers `non_dsp_copay_cents`.
  - Calculate `gap_covered_cents` and deduct from shortfall.
- **Net Patient Liability:**
  $$\text{net\_patient\_liability\_cents} = \max(0, \text{specialist\_shortfall} + \text{non\_dsp\_copay} - \text{gap\_covered})$$
- **6-Month Financing Calculator:**
  $$\text{monthly\_cents} = \lfloor \text{net\_patient\_liability\_cents} / 6 \rfloor$$

### 3.2 FHIR R4 Engine (`/src/lib/fhir-engine.ts`)
- **South African Clinical Coding:**
  - Validate ICD-10 diagnosis codes (e.g., `M23.2`, `K80.2`, `H25.1`).
  - Validate SA RPL/NHRPL procedure codes (`2443`, `1807`, `3047`).
  - Validate BHF practice numbers (format `BHF-xxxxxxx`).
- **FHIR R4 Serializers:**
  - `toFhirPatient(patient: Patient): FHIRPatient` (with SA ID system `urn:oid:2.16.710.1`).
  - `toFhirCoverage(policy: MedicalPolicy): FHIRCoverage`
  - `toFhirClaim(episode: SurgicalEpisode, preAuth: PreAuthorisation): FHIRClaim`
  - `toFhirAppointment(episode: SurgicalEpisode): FHIRAppointment`

---

## 4. UI & Portal Specifications

### 4.1 Specialist Practice Trigger UI (`/src/app/portal/specialist/*`)
- Patient ID lookup & encryption.
- Episode creator (ICD-10, RPL codes, specialist rate %, hospital selection).
- Triggers creation of `surgical_episodes` with `QUOTE_READY` status.
- Generates `episode_ref` (e.g. `EP-88492-ZA`) and sends Patient Pass PWA link.

### 4.2 4-Step Patient Surgical Pass PWA (`/src/app/pass/[episode_id]/*`)
- **Step 1: Patient & Medical Scheme Verification:** Confirms details and policy.
- **Step 2: Pre-Admission Questionnaire & Ward Hospitality:**
  - Ward selection (`General_Ward` vs. `Private_Suite` with `ward_upgrade_cents`).
  - Dietary selector (`Soft_Halal`, `Standard`, `Kosher`, `Diabetic`, `Nil_by_Mouth`).
  - POPIA consent toggle and digital signature.
- **Step 3: Financial Clearance & Payment:**
  - Transparent breakdown of Scheme, Shortfall, Gap Cover, and Net Liability.
  - Payment options: Stitch / PayFast Instant EFT or 6-Month Medical Financing.
- **Step 4: Surgical Boarding Pass:**
  - Displays `AUTHORISED` / `CHECKED_IN` status.
  - Generates high-contrast QR Check-in token (`qr_checkin_token`).

### 4.3 Developer & Revenue Inspector UI (`/src/app/developer/*`)
- Real-time inspector for B2B API endpoints (`/api/v1/*`).
- Switch simulation console (trigger mock MediSwitch, Healthbridge, SpesNet responses).
- Live ledger inspector (`episode_ledger_items`).

---

## 5. Model Routing Rules
- **Gemini 4 Argon (High):** `/supabase/migrations/*`, `/src/lib/cost-engine.ts`, `/src/lib/fhir-engine.ts`, `/src/app/api/v1/*`.
- **Gemini 3.8 Flash (High):** `/src/app/portal/specialist/*`, `/src/app/pass/[episode_id]/*`, `/src/app/developer/*`, Antigravity Browser Agent.
