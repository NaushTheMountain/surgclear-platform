"use client";

// src/app/portal/specialist/page.tsx
// Specialist Practice Trigger UI — Episode creation, SA clinical coding, and tariff multiplier

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Stethoscope,
  Building2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Calculator,
  Search,
  Sparkles,
  Copy,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
import {
  MOCK_DOCTORS,
  MOCK_HOSPITALS,
  MOCK_PROCEDURES,
} from "@/lib/mock-sa-healthcare";
import { SurgicalEpisodeInput } from "@/lib/cost-engine";

export default function SpecialistPortalPage() {
  const [selectedDoctor, setSelectedDoctor] = useState(MOCK_DOCTORS[0]);
  const [saIdNumber, setSaIdNumber] = useState("8406125023081");
  const [selectedProcedure, setSelectedProcedure] = useState(MOCK_PROCEDURES[0]);
  const [selectedHospital, setSelectedHospital] = useState(MOCK_HOSPITALS[0]);
  const [specialistRatePct, setSpecialistRatePct] = useState(250);
  const [admissionDate, setAdmissionDate] = useState("2026-11-04");

  // State for member verification
  const [verifyingMember, setVerifyingMember] = useState(false);
  const [memberData, setMemberData] = useState<any>(null);

  // State for estimate result
  const [calculating, setCalculating] = useState(false);
  const [estimateResult, setEstimateResult] = useState<any>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Auto-verify member on SA ID change or mount
  useEffect(() => {
    async function verify() {
      if (!saIdNumber || saIdNumber.length < 10) return;
      setVerifyingMember(true);
      try {
        const memberNo =
          saIdNumber === "8406125023081"
            ? "88492011"
            : saIdNumber === "7911040129084"
            ? "44109283"
            : "88492011";

        const res = await fetch("/api/v1/member/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idNumber: saIdNumber, memberNumber: memberNo }),
        });
        const data = await res.json();
        if (data.success && data.member) {
          setMemberData(data);
        } else {
          setMemberData(null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setVerifyingMember(false);
      }
    }
    verify();
  }, [saIdNumber]);

  // Trigger episode calculation
  async function handleCreateEpisode() {
    setCalculating(true);
    try {
      const epRef = `EP-${Math.floor(10000 + Math.random() * 90000)}-ZA`;
      const payload: SurgicalEpisodeInput = {
        episodeRef: epRef,
        patientId: memberData?.member?.patientId ?? "pat-001-za",
        patientName: memberData?.member?.fullName ?? "Tariq Abrahams",
        schemeName: schemeName,
        memberNumber: memberData?.member?.memberNumber ?? "88492011",
        hasActiveGapCover: true,
        gapProviderName: "Sirago",
        gapCoversDspCopay: true,
        practiceBhf: selectedDoctor.bhfNumber,
        surgeonName: selectedDoctor.fullName,
        anaesthetistName: "Dr. R. van der Merwe (Anaesthesiologist)",
        hospitalId: selectedHospital.id,
        hospitalName: selectedHospital.name,
        isDspNetwork: isDsp,
        nonDspCopayCents: isDsp ? 0 : selectedHospital.nonDspPenaltyCents,
        icd10Codes: [selectedProcedure.defaultIcd10],
        rplTariffCodes: [selectedProcedure.code],
        specialistRatePct,
        hospitalBaseCents: selectedHospital.theatreBaseFeeCents,
        surgeonSchemeTariffCents: selectedProcedure.schemeBaseTariffCents,
        anaesthetistSchemeTariffCents: selectedProcedure.anaesthesiaBaseTariffCents,
        pathologyEstimateCents: 145000,
        wardUpgradeCents: 0,
      };

      const res = await fetch("/api/v1/episodes/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success && data.estimate) {
        setEstimateResult({
          ...data,
          episodeRef: epRef,
          patientPassUrl: `/pass/${epRef.toLowerCase()}`,
          financialClearance: {
            ...data.estimate,
            displayZar: {
              netPatientOutOfPocket: `R${(data.estimate.netPatientOutOfPocketCents / 100).toLocaleString()}`,
            },
          },
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCalculating(false);
    }
  }

  // Determine if chosen hospital is DSP for the patient's verified scheme
  const schemeName =
    memberData?.member?.schemeName ??
    memberData?.policy?.schemeName ??
    "Discovery Health Medical Scheme";
  const isDsp = selectedHospital.isDspForSchemes.includes(schemeName);

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Top Banner / Practice Identity */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
              Specialist Practice Trigger
            </div>
            <h1 className="text-xl font-bold text-slate-900">{selectedDoctor.fullName}</h1>
            <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
              <span>{selectedDoctor.specialty}</span>
              <span>•</span>
              <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[11px] font-semibold text-slate-700">
                {selectedDoctor.bhfNumber}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedDoctor.bhfNumber}
            onChange={(e) => {
              const doc = MOCK_DOCTORS.find((d) => d.bhfNumber === e.target.value);
              if (doc) setSelectedDoctor(doc);
            }}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 font-medium"
          >
            {MOCK_DOCTORS.map((d) => (
              <option key={d.bhfNumber} value={d.bhfNumber}>
                {d.fullName} ({d.specialty.split(" ")[0]})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Form Inputs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Patient SA ID & Medical Scheme */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <span>1. Patient & Medical Scheme Verification</span>
              </h2>
              {verifyingMember && (
                <span className="text-xs text-blue-600 animate-pulse">Switching with MediSwitch...</span>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600">South African ID Number (13 Digits)</label>
              <div className="relative">
                <input
                  type="text"
                  value={saIdNumber}
                  onChange={(e) => setSaIdNumber(e.target.value)}
                  className="w-full text-sm font-mono px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. 8506125023088"
                />
                <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
              </div>
              <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-slate-500">
                <span className="font-semibold text-slate-700">2026 Demo Patients:</span>
                <button
                  type="button"
                  onClick={() => setSaIdNumber("8406125023081")}
                  className="text-blue-600 hover:underline font-mono font-medium"
                >
                  840612 (Tariq - Discovery Classic Smart + Sirago Gap)
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setSaIdNumber("7911040129084")}
                  className="text-blue-600 hover:underline font-mono font-medium"
                >
                  791104 (Nomsa - Bonitas BonPrime + Turnberry Gap)
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setSaIdNumber("8506125023088")}
                  className="text-blue-600 hover:underline font-mono"
                >
                  850612 (Sipho)
                </button>
              </div>
            </div>

            {/* Verified Scheme Card */}
            {(memberData?.member || memberData?.verified) && (
              <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{memberData.member?.fullName ?? memberData.patient?.fullName}</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 font-mono">
                    {memberData.member?.membershipStatus ?? memberData.policy?.status ?? "ACTIVE"}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-slate-700 pt-1">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Medical Scheme</span>
                    <span className="font-semibold">{memberData.member?.schemeName ?? memberData.policy?.schemeName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Plan Option</span>
                    <span className="font-semibold">{memberData.member?.planName ?? memberData.policy?.planName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Member #</span>
                    <span className="font-mono">{memberData.member?.memberNumber ?? memberData.policy?.memberNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">MSA Balance</span>
                    <span className="font-semibold text-emerald-700">
                      R{(((memberData.member?.msaBalanceCents ?? memberData.policy?.msaBalanceCents) ?? 0) / 100).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">In-Hospital Specialist Cover</span>
                    <span className="font-semibold text-blue-700">
                      {memberData.member?.inHospitalSpecialistRatePct ?? 200}% Scheme Rate
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Non-DSP Deductible</span>
                    <span className="font-mono text-slate-600">
                      R{(((memberData.member?.nonDspHospitalCopayCents ?? 1265000) ?? 0) / 100).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Clinical Procedure & RPL Coding */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              2. Procedure & South African Clinical Coding
            </h2>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600">Surgical Procedure & RPL Tariff</label>
              <select
                value={selectedProcedure.code}
                onChange={(e) => {
                  const proc = MOCK_PROCEDURES.find((p) => p.code === e.target.value);
                  if (proc) setSelectedProcedure(proc);
                }}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-800"
              >
                {MOCK_PROCEDURES.map((p) => (
                  <option key={p.code} value={p.code}>
                    RPL {p.code} — {p.description} (ICD-10: {p.defaultIcd10})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">ICD-10 Diagnosis</span>
                <div className="font-mono font-bold text-slate-800 text-sm mt-0.5">
                  {selectedProcedure.defaultIcd10}
                </div>
                <div className="text-[11px] text-slate-500 truncate">{selectedProcedure.icd10Description}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Scheme 100% Tariff</span>
                <div className="font-semibold text-slate-800 text-sm mt-0.5">
                  R{(selectedProcedure.schemeBaseTariffCents / 100).toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-500">
                  Anaesthesia: R{(selectedProcedure.anaesthesiaBaseTariffCents / 100).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Specialist Rate Multiplier */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-slate-700">Specialist Rate Tariff Multiplier</label>
                <span className="font-bold text-blue-600 text-sm">{specialistRatePct}% of Scheme Rate</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[100, 200, 250, 300].map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => setSpecialistRatePct(rate)}
                    className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                      specialistRatePct === rate
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {rate}%
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-500">
                At {specialistRatePct}%, surgeon shortfall is{" "}
                <span className="font-semibold text-slate-700">
                  R
                  {(
                    (selectedProcedure.schemeBaseTariffCents * (specialistRatePct / 100 - 1)) /
                    100
                  ).toLocaleString()}
                </span>
                .
              </p>
            </div>
          </div>

          {/* Section 3: Hospital & Admission Date */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              3. Hospital Selection & DSP Network Status
            </h2>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600">Admitting Facility / Theatre</label>
              <select
                value={selectedHospital.id}
                onChange={(e) => {
                  const hosp = MOCK_HOSPITALS.find((h) => h.id === e.target.value);
                  if (hosp) setSelectedHospital(hosp);
                }}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-800"
              >
                {MOCK_HOSPITALS.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name} — {h.city} ({h.networkGroup})
                  </option>
                ))}
              </select>
            </div>

            {/* DSP Network Banner */}
            {isDsp ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>
                  <strong>Designated Service Provider (DSP):</strong> {selectedHospital.name} is in-network for{" "}
                  {schemeName}. No co-payment penalty will be charged by the medical scheme.
                </span>
              </div>
            ) : (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-xs text-amber-900">
                <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>
                  <strong>Non-DSP Facility Warning:</strong> {selectedHospital.name} is outside {schemeName}&apos;s
                  designated network. Scheme co-payment penalty:{" "}
                  <strong>R{(selectedHospital.nonDspPenaltyCents / 100).toLocaleString()}</strong>.
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-1">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Scheduled Admission Date</label>
                <input
                  type="date"
                  value={admissionDate}
                  onChange={(e) => setAdmissionDate(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-slate-800"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Estimated Hospital Stay</label>
                <div className="px-3.5 py-2 bg-slate-100 rounded-xl text-xs sm:text-sm font-semibold text-slate-700">
                  {selectedProcedure.typicalStayDays === 0
                    ? "Day Surgery (0 Nights)"
                    : `${selectedProcedure.typicalStayDays} Night(s)`}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Instant Calculation & Action Trigger */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border-2 border-blue-500 shadow-md space-y-5 sticky top-20">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                <Calculator className="w-4 h-4 text-blue-600" />
                <span>Clearance Quote Preview</span>
              </h3>
              <span className="text-[10px] uppercase font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                Live Math
              </span>
            </div>

            {/* Quick Live Preview Math */}
            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Hospital Theatre & Ward</span>
                <span className="font-semibold text-slate-800">
                  R{(selectedHospital.theatreBaseFeeCents / 100).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Surgeon ({specialistRatePct}%)</span>
                <span className="font-semibold text-slate-800">
                  R{((selectedProcedure.schemeBaseTariffCents * (specialistRatePct / 100)) / 100).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Anaesthetist ({specialistRatePct}%)</span>
                <span className="font-semibold text-slate-800">
                  R{((selectedProcedure.anaesthesiaBaseTariffCents * (specialistRatePct / 100)) / 100).toLocaleString()}
                </span>
              </div>

              {!isDsp && (
                <div className="flex justify-between text-amber-700 bg-amber-50 p-2 rounded-lg font-medium">
                  <span>Non-DSP Co-Payment</span>
                  <span>+R{(selectedHospital.nonDspPenaltyCents / 100).toLocaleString()}</span>
                </div>
              )}

              {memberData?.policy?.gapCover?.hasActiveGapCover && (
                <div className="flex justify-between text-emerald-700 bg-emerald-50 p-2 rounded-lg font-medium">
                  <span>Gap Cover Payout ({memberData.policy.gapCover.provider})</span>
                  <span>-Offsets Shortfall</span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleCreateEpisode}
              disabled={calculating}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors shadow-lg shadow-blue-600/20 disabled:opacity-50"
            >
              {calculating ? (
                <span>Generating Episode...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Trigger Episode & Patient Pass</span>
                </>
              )}
            </button>

            {/* Result Box */}
            {estimateResult && (
              <div className="pt-4 border-t border-slate-100 space-y-3 animate-fadeIn">
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                    Episode Generated!
                  </div>
                  <div className="text-base font-extrabold text-emerald-950 font-mono">
                    {estimateResult.episodeRef}
                  </div>
                  <div className="text-[11px] text-emerald-700 mt-1">
                    Net Patient Out-of-Pocket:{" "}
                    <strong>{estimateResult.financialClearance?.displayZar?.netPatientOutOfPocket}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={estimateResult.patientPassUrl}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors"
                  >
                    <span>Launch Patient Pass</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${window.location.origin}${estimateResult.patientPassUrl}`
                      );
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2000);
                    }}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedLink ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
