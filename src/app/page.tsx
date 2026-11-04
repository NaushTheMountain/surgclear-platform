// src/app/page.tsx
// SurgClear Central Launchpad & Ecosystem Overview

import Link from "next/link";
import {
  Stethoscope,
  Smartphone,
  Terminal,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  FileSpreadsheet,
  QrCode,
  Building2,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-10 py-4">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>South Africa Pre-Authorisation & Patient Pass Aggregator</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Eliminate Theatre Shortfalls & Hospital Waiting Times
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
          SurgClear aggregates specialist surgical triggers, real-time medical scheme switching
          (MediSwitch / Healthbridge / SpesNet), DSP tariff calculations, and Gap Cover payouts into a frictionless
          4-step Patient Surgical Pass PWA.
        </p>
      </div>

      {/* The 3 Core Portal Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pillar 1: Specialist Practice Trigger */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Specialist Cockpit</span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">Practice Episode Trigger</h2>
              <p className="text-xs text-slate-500 mt-2">
                Surgeons & practice managers input ICD-10 & RPL codes, pick specialist rate multipliers (100% - 300%),
                and generate instant pre-op quote estimates.
              </p>
            </div>
            <ul className="text-xs space-y-2 text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Luhn-verified SA ID auto-fills scheme & Gap Cover</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Automatic DSP penalty calculation for hospital networks</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Dispatches instant SMS/WhatsApp Patient Pass link</span>
              </li>
            </ul>
          </div>
          <Link
            href="/portal/specialist"
            className="mt-6 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors"
          >
            <span>Open Specialist Portal</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Pillar 2: Patient Pass PWA */}
        <div className="bg-white rounded-2xl p-6 border-2 border-emerald-500 shadow-md flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-3 right-3 bg-emerald-100 text-emerald-800 text-[10px] uppercase font-bold px-2 py-0.5 rounded-md">
            Patient Facing
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Mobile PWA</span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">4-Step Surgical Pass</h2>
              <p className="text-xs text-slate-500 mt-2">
                Patients verify medical scheme details, pick Halal/Soft pre-op recovery meals, clear shortfall with
                Instant EFT or 6-Month financing, and get their QR boarding pass.
              </p>
            </div>
            <ul className="text-xs space-y-2 text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Halal, Kosher, Diabetic & Soft pre-op meal selector</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Zero surprise bills: Gap Cover offsets calculated upfront</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>High-contrast QR code for instant hospital check-in</span>
              </li>
            </ul>
          </div>
          <Link
            href="/pass/ep-88492-za"
            className="mt-6 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition-colors shadow-lg shadow-emerald-600/20"
          >
            <span>Launch Patient Pass PWA</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Pillar 3: B2B API & Revenue Inspector */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Terminal className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-600">Developer Cockpit</span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">B2B API & Revenue Ledger</h2>
              <p className="text-xs text-slate-500 mt-2">
                Real-time inspection of B2B switching endpoints, HL7 FHIR R4 Claim payloads, and platform revenue
                per episode (SaaS fees, Gap packaging, Fintech clips).
              </p>
            </div>
            <ul className="text-xs space-y-2 text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Test live EDI pre-authorisation simulations</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Auto Gap Claim packaging fee tracking (R145.00/claim)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>HL7 FHIR R4 Institutional Claim validation</span>
              </li>
            </ul>
          </div>
          <Link
            href="/developer/inspector"
            className="mt-6 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium text-sm transition-colors"
          >
            <span>Inspect B2B Endpoints</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* South African Ecosystem Badges */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 text-center">
          Connected South African Healthcare Switching & Financing Network
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4 text-center">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-xs font-semibold text-slate-800">MediSwitch</div>
            <div className="text-[10px] text-slate-400">Discovery & Schemes</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-xs font-semibold text-slate-800">Healthbridge</div>
            <div className="text-[10px] text-slate-400">Bonitas & Medshield</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-xs font-semibold text-slate-800">SpesNet</div>
            <div className="text-[10px] text-slate-400">Momentum & Specialists</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-xs font-semibold text-slate-800">Sirago & Turnberry</div>
            <div className="text-[10px] text-slate-400">500% Gap Cover</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-xs font-semibold text-slate-800">Stitch & PayFast</div>
            <div className="text-[10px] text-slate-400">Instant EFT ZAR</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-xs font-semibold text-slate-800">6M Medical Finance</div>
            <div className="text-[10px] text-slate-400">Prime + 1% Installments</div>
          </div>
        </div>
      </div>
    </div>
  );
}
