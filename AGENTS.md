# SurgClear API — Google Antigravity Agent Configuration & Rules of Engagement

## 1. Project Overview
SurgClear is a B2B2C South African Healthcare Pre-Authorisation, Financial Clearance, and Hospital Pre-Admission Aggregator API & Patient Pass PWA.
- **Framework:** Next.js 15 (App Router, TypeScript, Tailwind CSS, Lucide Icons)
- **Database & Auth:** Supabase (PostgreSQL, RLS, all currency stored in integer ZAR cents `bigint`)
- **Interoperability:** HL7 FHIR R4 (`Patient`, `Coverage`, `Claim`, `Appointment`) + SA Switching House adapters (MediSwitch / Healthbridge / SpesNet)
- **Payments:** PayFast / Stitch Instant EFT & 6-Month Medical Co-Pay Financing adapters

## 2. Model Routing Rules ( Gemini 4 Argon vs. Gemini 3.8 Flash High )
- **Use `Gemini 4 Argon (High)` for:**
  - `/supabase/migrations/*` (Schema, POPIA encryption functions, RLS policies)
  - `/src/lib/cost-engine.ts` (ZAR cent math, DSP co-pay rules, 100%-300% RPL tariff shortfall & Gap Cover calculations)
  - `/src/lib/fhir-engine.ts` (ICD-10 & RPL validation + HL7 FHIR R4 JSON generation)
  - `/src/app/api/v1/*` (Core B2B REST API routes and webhook signature verification)
- **Use `Gemini 3.8 Flash (High)` for:**
  - `/src/app/portal/specialist/*` (Specialist Practice Trigger UI)
  - `/src/app/pass/[episode_id]/*` (4-Step Patient Surgical Pass PWA, Halal/Soft Meal Selector, QR Check-in)
  - `/src/app/developer/*` (Live B2B API & Revenue Inspector UI)
  - Running the Antigravity Browser Agent against `http://localhost:3000` for visual and end-to-end verification.

## 3. Non-Negotiable Engineering Standards
1. **Zero Floating-Point Math for Money:** Every tariff, co-payment, MSA balance, and Gap Cover payout MUST be calculated in integer ZAR cents (e.g., `R4,850.00` = `485000`).
2. **South African Clinical Coding:** Always validate ICD-10 diagnosis codes (e.g., `M23.2`, `K80.2`, `H25.1`) paired with SA RPL/NHRPL procedure codes (`2443`, `1807`, `3047`) and BHF practice numbers.
3. **Self-Verifying Builds:** After completing any sprint, run `npm run build` and `npx tsc --noEmit` in the Antigravity terminal to verify zero TypeScript errors before marking the sprint complete.

## 4. Critical Handoff Protocol (Claude <-> Google Antigravity)
1. **Read First:** Before writing any code, always read `SPEC.md` and `HANDOFF.md`.
2. **Atomic Commits:** Build one module/sprint at a time. Never leave half-written files.
3. **Update Baton:** After completing any task or before stopping due to token/credit limits, you MUST update `HANDOFF.md` with:
   - `[x]` Marked completed tasks
   - Exact files created or modified
   - Any TypeScript/build errors remaining
   - The exact next instruction for the incoming agent

## 5. Standard CLI Commands
- `npm run dev` - Start local development server
- `npm run build` - Production build
- `npm run type-check` (or `npx tsc --noEmit`) - Validate TypeScript types
- `npm run lint` - Run ESLint
- `npm test` - Run automated test suite
