"use client";

// src/app/developer/inspector/page.tsx
// Live B2B API & Revenue Inspector UI — Real-time endpoint testing, FHIR Claim inspection & revenue ledger

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Terminal,
  Play,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  FileCode,
  DollarSign,
  ArrowRight,
  RefreshCw,
  Send,
  Building,
  Shield,
  Coins,
} from "lucide-react";

export default function DeveloperInspectorPage() {
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [selectedEpisode, setSelectedEpisode] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"api" | "ledger" | "fhir">("api");
  const [loading, setLoading] = useState(false);

  // API Console State
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>("/api/v1/episodes/estimate");
  const [apiMethod, setApiMethod] = useState<string>("POST");
  const [apiPayload, setApiPayload] = useState<string>(
    JSON.stringify(
      {
        patientIdNumber: "8506125023088",
        procedureCode: "2443",
        hospitalId: "HOSP-NET-01",
        specialistRatePct: 250,
      },
      null,
      2
    )
  );
  const [apiResponse, setApiResponse] = useState<any>(null);

  // Load episodes
  async function loadEpisodes() {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/episodes/estimate");
      const data = await res.json();
      if (data.episodes) {
        setEpisodes(data.episodes);
        if (!selectedEpisode && data.episodes.length > 0) {
          setSelectedEpisode(data.episodes[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEpisodes();
  }, []);

  // Execute API Request
  async function handleSendApiRequest() {
    setLoading(true);
    try {
      const options: RequestInit = {
        method: apiMethod,
        headers: { "Content-Type": "application/json" },
      };
      if (apiMethod === "POST") {
        options.body = apiPayload;
      }
      const res = await fetch(selectedEndpoint, options);
      const data = await res.json();
      setApiResponse({ status: res.status, data });
      loadEpisodes();
    } catch (err: any) {
      setApiResponse({ error: err.message });
    } finally {
      setLoading(false);
    }
  }

  // Trigger Pre-Auth
  async function handleTriggerPreauth(epId: string) {
    const ep = episodes.find((e) => e.id === epId);
    const episodeData = {
      episodeRef: ep?.episodeRef ?? epId.toUpperCase(),
      hospitalBaseCents: ep?.hospitalBaseCents ?? 3840000,
      surgeonSchemeTariffCents: ep?.surgeonSchemeTariffCents ?? 685000,
      anaesthetistSchemeTariffCents: ep?.anaesthetistSchemeTariffCents ?? 312000,
      pathologyEstimateCents: ep?.pathologyEstimateCents ?? 145000,
      specialistRatePct: ep?.specialistRatePct ?? 250,
      isDspNetwork: ep?.isDspNetwork ?? true,
      nonDspCopayCents: ep?.nonDspCopayCents ?? 0,
      hasActiveGapCover: ep?.hasActiveGapCover ?? true,
      gapCoversDspCopay: ep?.gapCoversDspCopay ?? true,
      icd10Codes: ep?.icd10Codes ?? ["M23.2"],
      rplTariffCodes: ep?.rplTariffCodes ?? ["2443"],
      patientId: ep?.patientId ?? "pat-001-za",
      patientName: ep?.patientName ?? "Tariq Abrahams",
      schemeName: ep?.schemeName ?? "Discovery Health Medical Scheme",
      memberNumber: ep?.memberNumber ?? "88492011",
      practiceBhf: ep?.practiceBhf ?? "0284910",
      surgeonName: ep?.surgeonName ?? "Dr. T. Mokoena",
      anaesthetistName: ep?.anaesthetistName ?? "Dr. R. van der Merwe",
      hospitalId: ep?.hospitalId ?? "hosp-netcare-linksfield",
      hospitalName: ep?.hospitalName ?? "Netcare Linksfield Hospital",
    };

    await fetch(`/api/v1/episodes/${epId}/preauth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ episodeData }),
    });
    loadEpisodes();
  }

  // Trigger Gap Claim
  async function handleTriggerGapClaim(epId: string) {
    const ep = episodes.find((e) => e.id === epId);
    await fetch(`/api/v1/episodes/${epId}/gap-claim`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gapProviderName: ep?.gapProviderName || "Sirago",
        shortfallAmountCents: ep?.financialClearance?.totalSpecialistShortfallCents || 1495500,
        policyNumber: "SRG-2026-99412",
      }),
    });
    loadEpisodes();
  }

  // Compute aggregate platform revenue across all episodes
  const totalHospitalSaaSCents = episodes.length * 9500;
  const totalGapPackagingCents = episodes.filter((e) => e.gapClaimFiled).length * 14500;
  const totalFintechClipsCents = episodes.reduce(
    (acc, e) => acc + (e.financialClearance?.b2bPlatformRevenueCents?.fintechProcessingFeeCents ?? 0),
    0
  );
  const totalPlatformRevenueCents =
    totalHospitalSaaSCents + totalGapPackagingCents + totalFintechClipsCents;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-mono">
              SurgClear Core v1.0
            </span>
            <span className="text-xs text-slate-500 font-medium">B2B API & Revenue Engine</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">Live B2B & Revenue Inspector</h1>
        </div>

        <button
          onClick={loadEpisodes}
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* 3 Metric Cards for Platform B2B Monetisation */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400">Total B2B Revenue</span>
          <div className="text-xl font-extrabold text-purple-950 font-mono">
            R{(totalPlatformRevenueCents / 100).toLocaleString()}
          </div>
          <div className="text-[10px] text-emerald-600 font-medium">From {episodes.length} active episodes</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400">Hospital Pre-Admission SaaS</span>
          <div className="text-xl font-extrabold text-slate-900 font-mono">
            R{(totalHospitalSaaSCents / 100).toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500">Fixed R95.00 / episode</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400">Gap Auto-Filing Fees</span>
          <div className="text-xl font-extrabold text-blue-700 font-mono">
            R{(totalGapPackagingCents / 100).toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500">R145.00 / auto-filed claim</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400">Fintech 2.85% Processing</span>
          <div className="text-xl font-extrabold text-emerald-700 font-mono">
            R{(totalFintechClipsCents / 100).toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500">2.85% on co-pay settlement</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        {[
          { id: "api", label: "Live API Console", icon: Terminal },
          { id: "ledger", label: "Episode Ledger & Revenue", icon: TrendingUp },
          { id: "fhir", label: "HL7 FHIR R4 Claim Inspector", icon: FileCode },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
                activeTab === t.id
                  ? "border-purple-600 text-purple-700 bg-purple-50/50"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Live API Console */}
      {activeTab === "api" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn">
          {/* Request Form */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">HTTP Request Builder</h2>

            <div className="grid grid-cols-4 gap-2">
              <select
                value={apiMethod}
                onChange={(e) => setApiMethod(e.target.value)}
                className="col-span-1 text-xs font-bold px-2 py-2 bg-slate-50 border border-slate-300 rounded-xl"
              >
                <option value="POST">POST</option>
                <option value="GET">GET</option>
              </select>

              <select
                value={selectedEndpoint}
                onChange={(e) => {
                  setSelectedEndpoint(e.target.value);
                  if (e.target.value === "/api/v1/member/verify") {
                    setApiPayload(JSON.stringify({ idNumber: "8506125023088" }, null, 2));
                  } else if (e.target.value === "/api/v1/episodes/estimate") {
                    setApiPayload(
                      JSON.stringify(
                        {
                          patientIdNumber: "8506125023088",
                          procedureCode: "2443",
                          hospitalId: "HOSP-NET-01",
                          specialistRatePct: 250,
                        },
                        null,
                        2
                      )
                    );
                  } else if (e.target.value.includes("preauth")) {
                    setApiPayload(
                      JSON.stringify(
                        {
                          episodeData: {
                            episodeRef: "EP-88492-ZA",
                            patientId: "pat-001-za",
                            patientName: "Tariq Abrahams",
                            schemeName: "Discovery Health Medical Scheme",
                            memberNumber: "88492011",
                            hasActiveGapCover: true,
                            gapProviderName: "Sirago",
                            gapCoversDspCopay: true,
                            practiceBhf: "0284910",
                            surgeonName: "Dr. T. Mokoena (Orthopaedic Surgeon)",
                            anaesthetistName: "Dr. R. van der Merwe (Anaesthesiologist)",
                            hospitalId: "hosp-netcare-linksfield",
                            hospitalName: "Netcare Linksfield Hospital",
                            isDspNetwork: true,
                            nonDspCopayCents: 0,
                            icd10Codes: ["M23.2"],
                            rplTariffCodes: ["2443"],
                            specialistRatePct: 250,
                            hospitalBaseCents: 3840000,
                            surgeonSchemeTariffCents: 685000,
                            anaesthetistSchemeTariffCents: 312000,
                            pathologyEstimateCents: 145000,
                            wardUpgradeCents: 0,
                          },
                        },
                        null,
                        2
                      )
                    );
                  }
                }}
                className="col-span-3 text-xs font-mono font-medium px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
              >
                <option value="/api/v1/episodes/estimate">/api/v1/episodes/estimate</option>
                <option value="/api/v1/member/verify">/api/v1/member/verify</option>
                <option value="/api/v1/episodes/ep-88492-za/preauth">/api/v1/episodes/ep-88492-za/preauth</option>
                <option value="/api/v1/episodes/ep-88492-za/checkin">/api/v1/episodes/ep-88492-za/checkin</option>
                <option value="/api/v1/episodes/ep-88492-za/gap-claim">/api/v1/episodes/ep-88492-za/gap-claim</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-500 uppercase">JSON Request Body</label>
              <textarea
                value={apiPayload}
                onChange={(e) => setApiPayload(e.target.value)}
                rows={8}
                className="w-full font-mono text-xs p-3 bg-slate-900 text-emerald-400 rounded-xl focus:outline-none"
              />
            </div>

            <button
              onClick={handleSendApiRequest}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/20 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Execute Request</span>
            </button>
          </div>

          {/* Response Console */}
          <div className="bg-slate-900 rounded-2xl p-6 shadow-sm space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
                <span className="font-mono text-emerald-400 font-bold">Live API Output</span>
                {apiResponse && (
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-mono text-[10px]">
                    STATUS {apiResponse.status ?? 200} OK
                  </span>
                )}
              </div>

              <pre className="font-mono text-xs text-slate-300 overflow-x-auto max-h-[360px] p-2 leading-relaxed">
                {apiResponse ? JSON.stringify(apiResponse.data ?? apiResponse, null, 2) : "// Awaiting execution..."}
              </pre>
            </div>

            <div className="text-[10px] text-slate-500 font-mono pt-2 border-t border-slate-800 flex justify-between">
              <span>All amounts rendered in ZAR Cents</span>
              <span>POPIA & FHIR R4 Ready</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Episode Ledger & Platform Revenue */}
      {activeTab === "ledger" && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm animate-fadeIn">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Active Surgical Episodes ({episodes.length})
            </h2>
            <span className="text-[11px] text-slate-500">Real-time status transitions</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="p-3">Episode Ref</th>
                  <th className="p-3">Patient & Scheme</th>
                  <th className="p-3">Procedure</th>
                  <th className="p-3">Hospital</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">B2B Revenue</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {episodes.map((ep) => {
                  const b2bRevCents =
                    ep.financialClearance?.b2bPlatformRevenueCents?.totalEpisodeRevenueCents ?? 9500;
                  return (
                    <tr key={ep.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-mono font-bold text-slate-900">{ep.episodeRef}</td>
                      <td className="p-3">
                        <div className="font-bold text-slate-800">{ep.patientName}</div>
                        <div className="text-[10px] text-slate-400">{ep.schemeName}</div>
                      </td>
                      <td className="p-3 max-w-xs truncate">{ep.procedureTitle}</td>
                      <td className="p-3">{ep.hospitalName}</td>
                      <td className="p-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                            ep.status === "CHECKED_IN"
                              ? "bg-emerald-100 text-emerald-800"
                              : ep.status === "AUTHORISED"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {ep.status}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-bold text-purple-900">
                        R{(b2bRevCents / 100).toLocaleString()}
                      </td>
                      <td className="p-3 text-right space-x-1">
                        {ep.status !== "AUTHORISED" && ep.status !== "CHECKED_IN" && (
                          <button
                            onClick={() => handleTriggerPreauth(ep.id)}
                            className="px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-[10px] font-semibold"
                          >
                            Pre-Auth
                          </button>
                        )}
                        {!ep.gapClaimFiled && ep.hasActiveGapCover && (
                          <button
                            onClick={() => handleTriggerGapClaim(ep.id)}
                            className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded text-[10px] font-semibold"
                          >
                            Auto Gap
                          </button>
                        )}
                        <Link
                          href={`/pass/${ep.episodeRef.toLowerCase()}`}
                          className="px-2 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded text-[10px] font-semibold inline-block"
                        >
                          Pass
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: HL7 FHIR R4 Claim Inspector */}
      {activeTab === "fhir" && (
        <div className="bg-slate-900 rounded-2xl p-6 text-slate-300 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-400 font-mono tracking-wider">
                HL7 FHIR R4 Institutional Claim Resource
              </span>
              <h3 className="text-base font-bold text-white">Pre-Authorisation Switch Payload</h3>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              URN: urn:oid:2.16.710.1 (South Africa Health Standard)
            </div>
          </div>

          <pre className="font-mono text-xs overflow-x-auto max-h-[460px] p-3 leading-relaxed text-emerald-300">
            {JSON.stringify(episodes[0]?.preauthPayload ?? {}, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
