# SurgClear API & Patient Pass PWA 🇿🇦

> **B2B2C South African Healthcare Pre-Authorisation, Financial Clearance & Hospital Pre-Admission Aggregator**

[![Vercel Deployment](https://img.shields.io/badge/Live_Demo-surgclear--platform.vercel.app-000000?style=for-the-badge&logo=vercel)](https://surgclear-platform.vercel.app)
[![GitHub Repository](https://img.shields.io/badge/GitHub-NaushTheMountain%2Fsurgclear--platform-181717?style=for-the-badge&logo=github)](https://github.com/NaushTheMountain/surgclear-platform)

---

## 🌐 Live Interactive Demonstration

The full SurgClear demo is deployed live on Vercel:

- **Launchpad & Ecosystem Overview:** [https://surgclear-platform.vercel.app](https://surgclear-platform.vercel.app)
- **Specialist Booking Cockpit:** [https://surgclear-platform.vercel.app/portal/specialist](https://surgclear-platform.vercel.app/portal/specialist)
- **4-Step Patient Surgical Pass PWA:** [https://surgclear-platform.vercel.app/pass/EP-9941-ZA](https://surgclear-platform.vercel.app/pass/EP-9941-ZA)
- **B2B Gateway Telemetry & Revenue Dashboard:** [https://surgclear-platform.vercel.app/developer/inspector](https://surgclear-platform.vercel.app/developer/inspector)

---

## ⚡ The Problem Solved

- **RPL Specialist Shortfalls:** Surgeons and anaesthetists routinely bill at 200% to 300% of National Health Reference Price List (RPL) tariffs, leaving patients with unexpected theatre bills.
- **DSP Penalties:** Patients entering non-Designated Service Provider (non-DSP) hospitals face unexpected deductibles (R8,000 – R15,000).
- **Admission Bottlenecks:** Manual clipboards, paper indemnities, and dietary confusion at 06:00 AM hospital check-in desks.
- **Delayed Gap Cover Claims:** Patients wait 30–90 days for post-operative paper claims to be adjudicated.

---

## 🚀 Key Features

1. **Specialist Practice Booking Cockpit (`/portal/specialist`)**
   - 30-second surgical episode creation.
   - Clinical coding auto-complete with ICD-10 diagnosis (`M23.2`, `K80.2`, `H25.1`) and SA RPL tariff codes (`2443`, `1807`, `3047`).
   - Dynamic specialist tariff multiplier (100% – 300%).
   - Instant SMS / WhatsApp Patient Pass dispatch.

2. **Zero Floating-Point Financial Clearance Engine (`/src/lib/cost-engine.ts`)**
   - All currency strictly computed in integer ZAR cents (`bigint`/integer).
   - Real-time DSP network validation against scheme hospital networks.
   - Automatic Gap Cover offset against the 2026 statutory Overall Annual Limit (R223,000.00 OAL).
   - 6-Month Medical Financing calculator with monthly installment projections.

3. **4-Step Mobile Patient Surgical Pass PWA (`/pass/[episode_id]`)**
   - **Step 1:** Real-time medical scheme & Gap Cover verification.
   - **Step 2:** Ward selection (`General_Ward` vs. `Private_Suite` upgrade) & pre-op dietary recovery meal selection (**SANHA-certified Halal, Beth Din Kosher, Diabetic, Soft Gastric**).
   - **Step 3:** Transparent financial clearance breakdown & Instant EFT / 6-Month financing selection.
   - **Step 4:** Live digital boarding pass with high-contrast QR code (`ADM-xxxx-JHB`) and anaesthetic fasting countdown timer.

4. **B2B Telemetry & Revenue Inspector (`/developer/inspector`)**
   - Real-time API console testing all 5 core B2B endpoints.
   - HL7 FHIR R4 Institutional Claim generator (`Claim` resource).
   - Live revenue ledger tracking Hospital SaaS fees (R95), Auto Gap Filing fees (R145), and Fintech transaction clips (2.85%).

---

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router, React 19, TypeScript)
- **Styling:** Tailwind CSS & Lucide Icons
- **Interoperability:** HL7 FHIR R4 (`Patient`, `Coverage`, `Claim`, `Appointment`)
- **Database Schema:** PostgreSQL / Supabase with `pgcrypto` field-level encryption for POPIA compliance
- **QR Engine:** Client-side high-contrast QR generator

---

## 🏃 Quick Start (Local Development)

```bash
# Clone the repository
git clone https://github.com/NaushTheMountain/surgclear-platform.git
cd surgclear-platform

# Install dependencies
npm install

# Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Core Route Sitemap

| Route | Description |
| :--- | :--- |
| `/` | SurgClear Platform Ecosystem Launchpad |
| `/portal/specialist` | Specialist Practice Booking Trigger Cockpit |
| `/pass/EP-9941-ZA` | 4-Step Patient Surgical Pass PWA & QR Boarding Pass |
| `/developer/inspector` | B2B EDI Gateway Telemetry & ARR Revenue Dashboard |
| `/api/v1/member/verify` | Real-time Medical Aid Switch Verification Endpoint |
| `/api/v1/episodes/estimate` | B2B Financial Clearance & Tariff Calculation Endpoint |
| `/api/v1/episodes/[id]/preauth` | Authoritative Switching Pre-Authorisation Endpoint |
| `/api/v1/episodes/[id]/checkin` | Pre-Admission Check-in & Dietary Catering Endpoint |
| `/api/v1/episodes/[id]/gap-claim` | Automated Post-Op Gap Claim Adjudication Endpoint |

---

## 📄 Executive Dossier & Strategic Memoranda (PDFs)

1. [**Volume 1: Operational & Technical Architecture (PDF)**](./SurgClear_1_Operational_Architecture.pdf) — System data flow, multi-stakeholder integration, HL7 FHIR R4 schema, POPIA compliance & QR check-in.
2. [**Volume 2: Monetisation & Financial Model (PDF)**](./SurgClear_2_Monetisation_and_Financial_Model.pdf) — Multi-sided revenue streams, unit economics across specialties, and 3-year ARR pro-forma.
3. [**Volume 3: Market Gap & Competitive Moat (PDF)**](./SurgClear_3_Market_Gap_and_Competitive_Moat.pdf) — SA healthcare crisis, competitor matrix vs Healthbridge/MediSwitch, and the blue ocean moat.
4. [**Volume 4: Startup Funding & Capital Strategy (PDF)**](./SurgClear_4_Startup_Funding_and_Capital_Strategy.pdf) — Seed round ask (R7.5M ZAR), 18-month runway, line-item budget, and investor exit returns.
5. [**Complete Master Commercialisation Blueprint (PDF)**](./SurgClear_Commercialisation_Blueprint.pdf) — Comprehensive omnibus strategic document.

---

## 📄 Documentation
- [System Architecture Specification (SPEC.md)](./SPEC.md)
- [Agent & Engineering Guidelines (AGENTS.md)](./AGENTS.md)
- [Database Schema (001_surgclear_schema.sql)](./supabase/migrations/001_surgclear_schema.sql)
