"use client";

// src/app/pass/[episode_id]/page.tsx
// 4-Step Patient Surgical Pass PWA (Halal/Soft Meals, ZAR Cents Financial Clearance, QR Check-in)

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Utensils,
  CreditCard,
  QrCode,
  ArrowRight,
  ArrowLeft,
  Building2,
  User,
  HeartPulse,
  Clock,
  Sparkles,
  Lock,
  Receipt,
  FileCheck,
} from "lucide-react";
import QRCode from "qrcode";

export default function PatientPassPage() {
  const params = useParams();
  const episodeId = (params?.episode_id as string) ?? "ep-88492-za";

  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [episodeData, setEpisodeData] = useState<any>(null);

  // Step 2 Hospitality selections
  const [wardType, setWardType] = useState<"General_Ward" | "Private_Suite">("General_Ward");
  const [wardUpgradeCents, setWardUpgradeCents] = useState(0);
  const [dietaryTag, setDietaryTag] = useState("Soft_Halal");
  const [selectedMealCode, setSelectedMealCode] = useState("HALAL-SOFT-CHICKEN");
  const [popiaConsent, setPopiaConsent] = useState(true);

  // Step 3 Payment selections
  const [paymentOption, setPaymentOption] = useState<"INSTANT_EFT" | "6M_FINANCING">("INSTANT_EFT");
  const [paying, setPaying] = useState(false);

  // Step 4 QR Code data URL
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [checkedInSuccess, setCheckedInSuccess] = useState(false);

  // Fetch episode details
  useEffect(() => {
    async function loadEpisode() {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/episodes/estimate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            episodeRef: episodeId.toUpperCase(),
            hospitalBaseCents: 3840000,
            surgeonSchemeTariffCents: 685000,
            anaesthetistSchemeTariffCents: 312000,
            pathologyEstimateCents: 145000,
            specialistRatePct: 250,
            isDspNetwork: true,
            nonDspCopayCents: 0,
            hasActiveGapCover: true,
            gapCoversDspCopay: true,
            icd10Codes: ["M23.2"],
            rplTariffCodes: ["2443"],
            patientId: "pat-001-za",
            patientName: "Tariq Abrahams",
            schemeName: "Discovery Health Medical Scheme",
            memberNumber: "88492011",
            practiceBhf: "0284910",
            surgeonName: "Dr. T. Mokoena (Orthopaedic Surgeon)",
            anaesthetistName: "Dr. R. van der Merwe (Anaesthesiologist)",
            hospitalId: "hosp-netcare-linksfield",
            hospitalName: "Netcare Linksfield Hospital",
          }),
        });
        const data = await res.json();
        if (data.success && data.estimate) {
          setEpisodeData({
            ...data,
            episodeRef: episodeId.toUpperCase(),
            procedureTitle: "Arthroscopic Meniscectomy & Chondroplasty (Right Knee)",
            hospital: { name: "Netcare Linksfield Hospital" },
            specialist: { surgeon: "Dr. T. Mokoena (Orthopaedic Surgeon)" },
            financialClearance: data.estimate,
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadEpisode();
  }, [episodeId]);

  // Generate QR code when entering Step 4
  useEffect(() => {
    if (step === 4 || episodeData?.status === "CHECKED_IN") {
      const qrPayload = JSON.stringify({
        token: episodeData?.episodeRef ?? "EP-88492-ZA",
        patient: episodeData?.patientName ?? "Sipho Dlamini",
        facility: episodeData?.hospital?.name ?? "Netcare Milpark Hospital",
        status: "CLEARED_FOR_ADMISSION",
        meal: dietaryTag,
        ward: wardType,
      });

      QRCode.toDataURL(qrPayload, {
        width: 256,
        margin: 2,
        color: { dark: "#064e3b", light: "#ffffff" },
      })
        .then((url) => setQrDataUrl(url))
        .catch(console.error);
    }
  }, [step, episodeData, dietaryTag, wardType]);

  // Submit Pre-Authorisation & Payment
  async function handleCompleteClearance() {
    setPaying(true);
    try {
      // 1. Authorise Pre-Auth
      const preauthPayload = {
        episodeRef: episodeId.toUpperCase(),
        hospitalBaseCents: 3840000,
        surgeonSchemeTariffCents: 685000,
        anaesthetistSchemeTariffCents: 312000,
        pathologyEstimateCents: 145000,
        specialistRatePct: 250,
        isDspNetwork: true,
        nonDspCopayCents: 0,
        hasActiveGapCover: true,
        gapCoversDspCopay: true,
        icd10Codes: ["M23.2"],
        rplTariffCodes: ["2443"],
        patientId: "pat-001-za",
        patientName: "Tariq Abrahams",
        schemeName: "Discovery Health Medical Scheme",
        memberNumber: "88492011",
        practiceBhf: "0284910",
        surgeonName: "Dr. T. Mokoena (Orthopaedic Surgeon)",
        anaesthetistName: "Dr. R. van der Merwe (Anaesthesiologist)",
        hospitalId: "hosp-netcare-linksfield",
        hospitalName: "Netcare Linksfield Hospital",
      };

      await fetch(`/api/v1/episodes/${episodeId}/preauth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ episodeData: preauthPayload }),
      });

      // 2. Perform Check-in and Payment Settlement
      const checkinRes = await fetch(`/api/v1/episodes/${episodeId}/checkin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wardType,
          wardUpgradeCents,
          dietaryTag,
          mealSelectionCode: selectedMealCode,
          selectedMealCode,
          consentSigned: popiaConsent,
          paymentMethod: paymentOption,
        }),
      });
      const checkinData = await checkinRes.json();

      if (checkinData.success) {
        setCheckedInSuccess(true);
        setStep(4);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPaying(false);
    }
  }

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-slate-500 font-medium">Loading Surgical Pass...</p>
      </div>
    );
  }

  const clearance = episodeData?.financialClearance;
  const netDueCents = (clearance?.netPatientOutOfPocketCents ?? 0) + wardUpgradeCents;
  const netDueZar = `R${(netDueCents / 100).toLocaleString()}`;
  const monthly6mZar = `R${Math.round((netDueCents * 1.06) / 600).toLocaleString()}/mo`;

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-16">
      {/* Top Mobile Pass Header */}
      <div className="text-center space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
          SurgClear Patient Pass
        </span>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Surgical Boarding Pass</h1>
        <p className="text-xs text-slate-500 font-mono">{episodeData?.episodeRef ?? episodeId.toUpperCase()}</p>
      </div>

      {/* 4-Step Progress Indicator */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { num: 1, label: "Verification" },
          { num: 2, label: "Hospitality" },
          { num: 3, label: "Clearance" },
          { num: 4, label: "Boarding Pass" },
        ].map((s) => (
          <div
            key={s.num}
            className={`p-2 rounded-xl text-center border transition-all ${
              step === s.num
                ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                : step > s.num
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-white text-slate-400 border-slate-200"
            }`}
          >
            <div className="text-[10px] uppercase font-bold tracking-wider">Step {s.num}</div>
            <div className="text-[11px] font-semibold truncate">{s.label}</div>
          </div>
        ))}
      </div>

      {/* STEP 1: Identity & Scheme Verification */}
      {step === 1 && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5 animate-fadeIn">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Patient & Scheme Verification</h2>
              <p className="text-xs text-slate-500">Confirm your details and medical scheme pre-authorisation</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <span className="text-[10px] uppercase font-semibold text-slate-400">Scheduled Procedure</span>
              <div className="font-bold text-slate-900 text-sm">{episodeData?.procedureTitle}</div>
              <div className="text-slate-500 flex items-center gap-2">
                <span>{episodeData?.hospital?.name}</span>
                <span>•</span>
                <span>{episodeData?.specialist?.surgeon}</span>
              </div>
            </div>

            <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-950 text-xs">Active Scheme Coverage</span>
                <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded font-mono font-bold">
                  VERIFIED
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700">
                <div>
                  <span className="text-slate-400 block text-[10px]">Scheme</span>
                  <span className="font-semibold">Discovery Health</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Plan</span>
                  <span className="font-semibold">Classic Smart Comprehensive</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Gap Cover Provider</span>
                  <span className="font-semibold text-blue-700">Sirago (Up to 500% RPL)</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">DSP Network</span>
                  <span className="font-semibold text-emerald-700">In-Network (Zero Penalty)</span>
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setStep(2)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors shadow-lg shadow-emerald-600/20"
          >
            <span>Confirm & Select Ward Hospitality</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 2: Pre-Admission Questionnaire & Ward Hospitality */}
      {step === 2 && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5 animate-fadeIn">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Hospital Ward & Dietary Choices</h2>
              <p className="text-xs text-slate-500">Customise your post-op recovery stay and meal preference</p>
            </div>
          </div>

          {/* Ward Type Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              1. Ward Accommodation
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setWardType("General_Ward");
                  setWardUpgradeCents(0);
                }}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  wardType === "General_Ward"
                    ? "border-emerald-600 bg-emerald-50/50 shadow-sm"
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                <div className="font-bold text-xs text-slate-900">General Ward</div>
                <div className="text-[11px] text-slate-500 mt-1">Full medical scheme cover</div>
                <div className="text-xs font-semibold text-emerald-700 mt-2">Included (R0.00)</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setWardType("Private_Suite");
                  setWardUpgradeCents(185000); // R1,850.00
                }}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  wardType === "Private_Suite"
                    ? "border-emerald-600 bg-emerald-50/50 shadow-sm"
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                <div className="font-bold text-xs text-slate-900">Private Suite</div>
                <div className="text-[11px] text-slate-500 mt-1">En-suite, TV & guest recliner</div>
                <div className="text-xs font-semibold text-blue-700 mt-2">+R1,850.00 Upgrade</div>
              </button>
            </div>
          </div>

          {/* Halal & Soft Recovery Meal Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              2. Pre-Op & Recovery Meal Selector
            </label>
            <div className="space-y-2">
              {[
                {
                  tag: "Soft_Halal",
                  code: "MEAL-HL-SOFT-01",
                  title: "Halal Steamed Linefish & Butternut Veloute",
                  desc: "Dietitian-approved post-anaesthetic light protein meal (SANHA certified). Netcare & Life approved.",
                },
                {
                  tag: "Halal",
                  code: "MEAL-HL-STD-02",
                  title: "Halal Grilled Chicken Breast & Basmati Rice",
                  desc: "Low-sodium grilled fillet with steamed seasonal greens and rosemary infusion.",
                },
                {
                  tag: "Kosher",
                  code: "MEAL-LF-KS-02",
                  title: "Kosher Poached Kingklip & Steamed Courgettes",
                  desc: "Beth Din certified sealed post-operative recovery meal prepared in strictly certified kitchens.",
                },
                {
                  tag: "Vegetarian",
                  code: "MEAL-VEG-SOFT-03",
                  title: "Clear Vegetable Broth & Oats Porridge",
                  desc: "Stage-1 post-laparoscopic clear & soft digestive recovery option.",
                },
              ].map((m) => (
                <div
                  key={m.code}
                  onClick={() => {
                    setDietaryTag(m.tag);
                    setSelectedMealCode(m.code);
                  }}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedMealCode === m.code
                      ? "border-emerald-600 bg-emerald-50/60 shadow-sm"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">{m.title}</span>
                    {selectedMealCode === m.code && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">{m.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* POPIA & Consent Checkbox */}
          <div className="pt-2">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={popiaConsent}
                onChange={(e) => setPopiaConsent(e.target.checked)}
                className="mt-1 w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
              />
              <span className="text-xs text-slate-600 leading-snug">
                I hereby grant consent in terms of the <strong>Protection of Personal Information Act (POPIA)</strong>{" "}
                for SurgClear to process clinical pre-admission and pre-authorisation data with my medical scheme and
                hospital.
              </span>
            </label>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              disabled={!popiaConsent}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors shadow-lg shadow-emerald-600/20 disabled:opacity-50"
            >
              <span>Continue to Financial Clearance</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Financial Clearance & Payment */}
      {step === 3 && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5 animate-fadeIn">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Financial Clearance Breakdown</h2>
              <p className="text-xs text-slate-500">Transparent tariff calculation and settlement</p>
            </div>
          </div>

          {/* Tariff Breakdown Table */}
          <div className="p-4 bg-slate-50 rounded-xl space-y-2.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Total Estimated Procedure Cost</span>
              <span className="font-semibold text-slate-800">
                R{(((clearance?.totalEstimatedOperationCents ?? 0) + wardUpgradeCents) / 100).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-emerald-700">
              <span>Medical Scheme Covered (100% RPL)</span>
              <span className="font-semibold">-R{((clearance?.totalSchemePaidCents ?? 0) / 100).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-amber-700">
              <span>Specialist Shortfall (250% Rate Multiplier)</span>
              <span className="font-semibold">
                +R{((clearance?.totalSpecialistShortfallCents ?? 0) / 100).toLocaleString()}
              </span>
            </div>

            {clearance?.totalGapCoverPayoutCents > 0 && (
              <div className="flex justify-between text-blue-700 bg-blue-50/80 p-2 rounded-lg font-medium">
                <span>Gap Cover Payout ({episodeData?.hasActiveGapCover ? "Sirago" : "Active"})</span>
                <span>-R{((clearance.totalGapCoverPayoutCents ?? 0) / 100).toLocaleString()}</span>
              </div>
            )}

            {wardUpgradeCents > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Private Suite Ward Upgrade</span>
                <span className="font-semibold">+R{(wardUpgradeCents / 100).toLocaleString()}</span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm">
              <span className="font-bold text-slate-900">Net Patient Out-Of-Pocket:</span>
              <span className="font-extrabold text-emerald-700 text-lg font-mono">{netDueZar}</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              Select Settlement Option
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentOption("INSTANT_EFT")}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  paymentOption === "INSTANT_EFT"
                    ? "border-emerald-600 bg-emerald-50/60 shadow-sm"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="font-bold text-xs text-slate-900">Instant EFT / Card</div>
                <div className="text-[11px] text-slate-500 mt-1">Stitch & PayFast (ZAR Cents)</div>
                <div className="text-xs font-semibold text-emerald-700 mt-2">Pay {netDueZar}</div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentOption("6M_FINANCING")}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  paymentOption === "6M_FINANCING"
                    ? "border-emerald-600 bg-emerald-50/60 shadow-sm"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="font-bold text-xs text-slate-900">6-Month Medical Finance</div>
                <div className="text-[11px] text-slate-500 mt-1">Prime + 1% interest</div>
                <div className="text-xs font-semibold text-blue-700 mt-2">{monthly6mZar}</div>
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={handleCompleteClearance}
              disabled={paying}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors shadow-lg shadow-emerald-600/20 disabled:opacity-50"
            >
              {paying ? (
                <span>Switching with Scheme...</span>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Settle & Issue Surgical Boarding Pass</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Surgical Boarding Pass (Live QR Check-in) */}
      {step === 4 && (
        <div className="space-y-4 animate-fadeIn">
          {/* Boarding Pass Card */}
          <div className="bg-white rounded-3xl border-2 border-emerald-600 shadow-xl overflow-hidden">
            {/* Pass Top Banner */}
            <div className="bg-emerald-600 text-white p-5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-widest bg-emerald-700/80 px-2 py-0.5 rounded">
                  Official Admission Pass
                </span>
                <span className="text-xs font-mono font-bold bg-white text-emerald-950 px-2 py-0.5 rounded">
                  {checkedInSuccess ? "CHECKED_IN" : "AUTHORISED"}
                </span>
              </div>
              <h2 className="text-xl font-black tracking-tight">{episodeData?.procedureTitle}</h2>
              <div className="text-xs text-emerald-100 flex items-center gap-2">
                <span>{episodeData?.hospital?.name}</span>
                <span>•</span>
                <span>Adm: 04 Nov 2026</span>
              </div>
            </div>

            {/* Pass Mid Section: Patient & Codes */}
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4 text-xs border-b border-slate-100 pb-4">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Patient Name</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {episodeData?.patientName ?? "Sipho Dlamini"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Pre-Auth Number</span>
                  <span className="font-mono font-bold text-emerald-700 text-sm">PA-884920-ZA</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Ward & Stay</span>
                  <span className="font-semibold text-slate-800">
                    {wardType === "Private_Suite" ? "Private Suite" : "General Ward"} (1 Night)
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Dietary Order</span>
                  <span className="font-semibold text-emerald-800">{dietaryTag.replace("_", " ")}</span>
                </div>
              </div>

              {/* QR Code Section */}
              <div className="text-center space-y-2 py-2">
                <div className="inline-block p-3 bg-white border-2 border-emerald-500 rounded-2xl shadow-inner">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="Surgical Check-in QR Token"
                      className="w-48 h-48 mx-auto object-contain"
                    />
                  ) : (
                    <div className="w-48 h-48 flex items-center justify-center bg-slate-100 rounded-xl">
                      <QrCode className="w-12 h-12 text-slate-400" />
                    </div>
                  )}
                </div>
                <div className="text-[11px] font-mono text-slate-500">Token: ADM-8849-JHB</div>
                <p className="text-xs text-slate-600 max-w-xs mx-auto">
                  Present this QR code at hospital reception desk for instant biometric check-in without paper forms.
                </p>
              </div>

              {/* Fasting Instructions */}
              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-900">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Anaesthetic Fasting Protocol</span>
                </div>
                <p className="text-[11px] text-amber-900/90">
                  Nil by mouth (no solids, milk, or juices) from <strong>22:00 the evening prior</strong>. Clear water
                  permitted up to 2 hours before admission.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Link
              href="/portal/specialist"
              className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl text-center transition-colors"
            >
              Specialist Portal
            </Link>
            <Link
              href="/developer/inspector"
              className="flex-1 py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl text-center transition-colors"
            >
              Inspect B2B API Ledger
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
