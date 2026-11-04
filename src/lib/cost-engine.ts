// src/lib/cost-engine.ts
// Precision ZAR-cent calculation & HL7 FHIR R4 Claim generator for SurgClear API

export interface SurgicalEpisodeInput {
  episodeRef: string;
  patientId: string;
  patientName: string;
  schemeName: string;
  memberNumber: string;
  hasActiveGapCover: boolean;
  gapProviderName?: string;
  gapCoversDspCopay: boolean;
  practiceBhf: string;
  surgeonName: string;
  anaesthetistName: string;
  hospitalId: string;
  hospitalName: string;
  isDspNetwork: boolean;
  nonDspCopayCents: number; // e.g., 485000 = R4,850.00
  icd10Codes: string[];
  rplTariffCodes: string[];
  specialistRatePct: number; // e.g., 250 = 250% of scheme rate
  hospitalBaseCents?: number;
  hospitalBaseEstimateCents?: number;
  surgeonSchemeTariffCents: number;
  anaesthetistSchemeTariffCents: number;
  pathologyEstimateCents: number;
  wardUpgradeCents?: number;
  estimatedStayDays?: number;
}

export interface FinancialClearanceResult {
  hospitalTotalCents: number;
  hospitalSchemePaidCents: number;
  hospitalDspPenaltyCents: number;
  surgeonBilledCents: number;
  surgeonSchemePaidCents: number;
  surgeonShortfallCents: number;
  anaesthetistBilledCents: number;
  anaesthetistSchemePaidCents: number;
  anaesthetistShortfallCents: number;
  pathologyTotalCents: number;
  totalEstimatedOperationCents: number;
  totalSchemePaidCents: number;
  totalSpecialistShortfallCents: number;
  gapCoverShortfallPayoutCents: number;
  gapCoverDspCopayRefundCents: number;
  totalGapCoverPayoutCents: number;
  wardUpgradeCents: number;
  netPatientOutOfPocketCents: number;
  sixMonthFinancingMonthlyCents: number;
  b2bPlatformRevenueCents: {
    hospitalSaaSFeeCents: number;
    gapAutomationFeeCents: number;
    fintechProcessingFeeCents: number;
    totalEpisodeRevenueCents: number;
  };
}

export function calculateSurgicalClearance(input: SurgicalEpisodeInput): FinancialClearanceResult {
  const rateMultiplier = input.specialistRatePct / 100;
  const wardUpgradeCents = input.wardUpgradeCents ?? 0;
  const hospitalBaseCents = input.hospitalBaseCents ?? input.hospitalBaseEstimateCents ?? 0;

  // 1. Hospital & DSP Network Calculation
  const hospitalDspPenaltyCents = input.isDspNetwork ? 0 : input.nonDspCopayCents;
  const hospitalSchemePaidCents = Math.max(0, hospitalBaseCents - hospitalDspPenaltyCents);

  // 2. Surgeon & Anaesthetist Calculations (100% Scheme vs Billed Rate %)
  const surgeonBilledCents = Math.round(input.surgeonSchemeTariffCents * rateMultiplier);
  const surgeonSchemePaidCents = input.surgeonSchemeTariffCents;
  const surgeonShortfallCents = Math.max(0, surgeonBilledCents - surgeonSchemePaidCents);

  const anaesthetistBilledCents = Math.round(input.anaesthetistSchemeTariffCents * rateMultiplier);
  const anaesthetistSchemePaidCents = input.anaesthetistSchemeTariffCents;
  const anaesthetistShortfallCents = Math.max(0, anaesthetistBilledCents - anaesthetistSchemePaidCents);

  const totalSpecialistShortfallCents = surgeonShortfallCents + anaesthetistShortfallCents;

  // 3. Gap Cover Offsets (Covers up to 500% specialist shortfall + optional DSP co-pay)
  const gapCoverShortfallPayoutCents = input.hasActiveGapCover ? totalSpecialistShortfallCents : 0;
  const gapCoverDspCopayRefundCents =
    input.hasActiveGapCover && input.gapCoversDspCopay ? hospitalDspPenaltyCents : 0;
  const totalGapCoverPayoutCents = gapCoverShortfallPayoutCents + gapCoverDspCopayRefundCents;

  // 4. Totals & Net Patient Liability
  const totalEstimatedOperationCents =
    hospitalBaseCents +
    surgeonBilledCents +
    anaesthetistBilledCents +
    input.pathologyEstimateCents +
    wardUpgradeCents;

  const totalSchemePaidCents =
    hospitalSchemePaidCents +
    surgeonSchemePaidCents +
    anaesthetistSchemePaidCents +
    input.pathologyEstimateCents;

  const uncoveredShortfallCents = totalSpecialistShortfallCents - gapCoverShortfallPayoutCents;
  const uncoveredDspPenaltyCents = hospitalDspPenaltyCents - gapCoverDspCopayRefundCents;

  const netPatientOutOfPocketCents =
    uncoveredShortfallCents + uncoveredDspPenaltyCents + wardUpgradeCents;

  // 6-Month Medical Financing (Prime + margin ~ 1% per month simple illustration)
  const sixMonthFinancingMonthlyCents =
    netPatientOutOfPocketCents > 0 ? Math.round((netPatientOutOfPocketCents * 1.06) / 6) : 0;

  // 5. B2B Aggregator Revenue Model (in ZAR Cents)
  const hospitalSaaSFeeCents = 9500; // R95.00 per automated digital pre-admission
  const gapAutomationFeeCents = input.hasActiveGapCover ? 14500 : 0; // R145.00 per auto-packaged Gap claim
  const fintechProcessingFeeCents = Math.round(netPatientOutOfPocketCents * 0.0285); // 2.85% co-pay/financing clip

  return {
    hospitalTotalCents: hospitalBaseCents,
    hospitalSchemePaidCents,
    hospitalDspPenaltyCents,
    surgeonBilledCents,
    surgeonSchemePaidCents,
    surgeonShortfallCents,
    anaesthetistBilledCents,
    anaesthetistSchemePaidCents,
    anaesthetistShortfallCents,
    pathologyTotalCents: input.pathologyEstimateCents,
    totalEstimatedOperationCents,
    totalSchemePaidCents,
    totalSpecialistShortfallCents,
    gapCoverShortfallPayoutCents,
    gapCoverDspCopayRefundCents,
    totalGapCoverPayoutCents,
    wardUpgradeCents,
    netPatientOutOfPocketCents,
    sixMonthFinancingMonthlyCents,
    b2bPlatformRevenueCents: {
      hospitalSaaSFeeCents,
      gapAutomationFeeCents,
      fintechProcessingFeeCents,
      totalEpisodeRevenueCents:
        hospitalSaaSFeeCents + gapAutomationFeeCents + fintechProcessingFeeCents,
    },
  };
}

export function buildFhirPreAuthPayload(
  input: SurgicalEpisodeInput,
  clearance: FinancialClearanceResult
) {
  const episodeRef = input.episodeRef || "EP-DEFAULT";
  const icd10 = input.icd10Codes && input.icd10Codes.length > 0 ? input.icd10Codes : ["Z01.8"];
  const rpl = input.rplTariffCodes && input.rplTariffCodes.length > 0 ? input.rplTariffCodes : ["2443"];

  return {
    resourceType: "Claim",
    id: `preauth-${episodeRef.toLowerCase()}`,
    status: "active",
    type: {
      coding: [
        {
          system: "http://terminology.hl7.org/CodeSystem/claim-type",
          code: "institutional",
          display: "Hospital & Specialist Surgical Pre-Authorisation",
        },
      ],
    },
    use: "preauthorization",
    patient: {
      reference: `Patient/${input.patientId || "unknown"}`,
      display: input.patientName || "Patient",
    },
    provider: {
      identifier: { system: "https://pcns.co.za/bhf", value: input.practiceBhf || "0420000" },
      display: input.surgeonName || "Specialist Surgeon",
    },
    facility: {
      identifier: { system: "https://surgclear.co.za/facility", value: input.hospitalId || "HOSP-001" },
      display: input.hospitalName || "Hospital Facility",
    },
    diagnosis: icd10.map((code, idx) => ({
      sequence: idx + 1,
      diagnosisCodeableConcept: {
        coding: [{ system: "http://hl7.org/fhir/sid/icd-10", code }],
      },
    })),
    item: rpl.map((tariff, idx) => ({
      sequence: idx + 1,
      productOrService: {
        coding: [{ system: "https://health.gov.za/rpl", code: tariff }],
      },
      net: {
        value: Number((clearance.totalEstimatedOperationCents / 100).toFixed(2)),
        currency: "ZAR",
      },
    })),
    total: {
      value: Number((clearance.totalEstimatedOperationCents / 100).toFixed(2)),
      currency: "ZAR",
    },
  };
}
