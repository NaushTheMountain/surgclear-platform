// src/lib/mock-sa-healthcare.ts
// Authentic 2026 South African Private Healthcare Seed Dataset for SurgClear API
// All monetary values are stored in integer ZAR cents (e.g., R12,650.00 = 1265000)

export interface SaMedicalSchemePlan {
  id: string;
  schemeName: string;
  planName: string;
  administrator: "Discovery Health" | "Medscheme" | "Momentum Health" | "Universal";
  switchRoute: "Healthbridge_EDI" | "MediSwitch_Altron" | "SwitchOn";
  inHospitalSpecialistRatePct: number; // 100% or 200% of scheme rate
  dspHospitalIds: string[];
  nonDspHospitalCopayCents: number;    // 2026 non-network deductible/co-payment
  dayClinicScopeCopayCents: number;
  acuteHospitalScopeCopayCents: number;
  defaultMsaBalanceCents: number;
}

export interface SaGapCoverPolicy {
  id: string;
  providerName: "Sirago" | "Turnberry" | "Zestlife" | "Strider";
  productName: string;
  maxTariffCoverPct: number;           // e.g., 500% or 600% of scheme rate
  overallAnnualLimitCents: number;     // 2026 statutory OAL: R223,000 (22300000 cents)
  coversDspCopayments: boolean;
  maxNonDspPenaltyCapCents: number;    // e.g., R16,000 sub-limit on voluntary non-DSP
  privateWardUpgradeSublimitCents: number;
  roboticSurgerySublimitCents: number;
  apiWebhookEndpoint: string;
}

export interface SaHospitalFacility {
  id: string;
  name: string;
  group: "Netcare" | "Life Healthcare" | "Mediclinic" | "Cure Day Hospitals" | "NHN Independent";
  facilityType: "ACUTE_HOSPITAL" | "DAY_HOSPITAL";
  province: "Gauteng" | "Western Cape" | "KwaZulu-Natal";
  city: string;
  bhfPracticeNumber: string;
  pasSystem: "SAP_ISH_Med" | "CareOn_EMR" | "Meditech" | "GoodX_Web";
  privateWardUpgradeDailyCents: number;
  cateringMenu: {
    code: string;
    title: string;
    dietaryTags: ("Standard" | "Halal" | "Kosher" | "Soft_PostOp" | "Vegetarian" | "Nil_Per_Os")[];
    description: string;
  }[];
}

export interface SaSurgicalPackageTemplate {
  id: string;
  procedureTitle: string;
  specialty: "Orthopaedics" | "General Surgery" | "Ophthalmology" | "Gastroenterology" | "ENT";
  icd10Codes: { code: string; description: string; isPmb: boolean }[];
  rplTariffCodes: { code: string; description: string; units: number }[];
  defaultSurgeonName: string;
  defaultSurgeonBhf: string;
  defaultAnaesthetistName: string;
  defaultAnaesthetistBhf: string;
  defaultSpecialistRatePct: number;    // Typical private specialist billing rate (e.g., 250%)
  estimatedStayDays: number;
  hospitalBaseEstimateCents: number;   // Theatre + ward + consumables
  surgeonSchemeTariffCents: number;    // 100% scheme tariff baseline
  anaesthetistSchemeTariffCents: number;
  pathologyEstimateCents: number;      // Ampath / Lancet / Vermaak pre/post-op labs
  recommendedFacilityType: "ACUTE_HOSPITAL" | "DAY_HOSPITAL";
}

// ---------------------------------------------------------------------------
// 1. 2026 SOUTH AFRICAN MEDICAL SCHEMES & PLANS
// ---------------------------------------------------------------------------
export const SA_MEDICAL_SCHEME_PLANS: SaMedicalSchemePlan[] = [
  {
    id: "disc-classic-smart-comp-2026",
    schemeName: "Discovery Health Medical Scheme",
    planName: "Classic Smart Comprehensive",
    administrator: "Discovery Health",
    switchRoute: "Healthbridge_EDI",
    inHospitalSpecialistRatePct: 200,
    dspHospitalIds: ["hosp-life-fourways", "hosp-cure-midstream", "hosp-mediclinic-sandton", "hosp-netcare-linksfield", "HOSP-NET-01"],
    nonDspHospitalCopayCents: 1265000, // R12,650.00 non-network hospital deductible (2026)
    dayClinicScopeCopayCents: 465000,  // R4,650.00 Day Surgery Network scope co-pay
    acuteHospitalScopeCopayCents: 680000,
    defaultMsaBalanceCents: 1845000,   // R18,450.00 MSA available
  },
  {
    id: "disc-classic-saver-2026",
    schemeName: "Discovery Health Medical Scheme",
    planName: "Classic Saver",
    administrator: "Discovery Health",
    switchRoute: "Healthbridge_EDI",
    inHospitalSpecialistRatePct: 100,
    dspHospitalIds: ["hosp-life-fourways", "hosp-netcare-linksfield", "hosp-cure-midstream", "HOSP-NET-01"],
    nonDspHospitalCopayCents: 1110000, // R11,100.00 Delta/Network penalty
    dayClinicScopeCopayCents: 465000,
    acuteHospitalScopeCopayCents: 800000,
    defaultMsaBalanceCents: 1120000,   // R11,200.00 MSA available
  },
  {
    id: "bonitas-bonprime-2026",
    schemeName: "Bonitas Medical Fund",
    planName: "BonPrime Network",
    administrator: "Medscheme",
    switchRoute: "MediSwitch_Altron",
    inHospitalSpecialistRatePct: 100,
    dspHospitalIds: ["hosp-life-fourways", "hosp-cure-midstream", "HOSP-LIFE-03"],
    nonDspHospitalCopayCents: 1268000, // R12,680.00 non-DSP hospital co-payment (2026)
    dayClinicScopeCopayCents: 202000,  // R2,020.00 scope co-payment
    acuteHospitalScopeCopayCents: 489200,
    defaultMsaBalanceCents: 695000,
  },
  {
    id: "momentum-incentive-2026",
    schemeName: "Momentum Medical Scheme",
    planName: "Incentive Associated Network",
    administrator: "Momentum Health",
    switchRoute: "SwitchOn",
    inHospitalSpecialistRatePct: 100,
    dspHospitalIds: ["hosp-netcare-linksfield", "hosp-mediclinic-sandton", "hosp-cure-midstream", "HOSP-MED-02"],
    nonDspHospitalCopayCents: 980000,  // R9,800.00 voluntary non-associated hospital co-pay
    dayClinicScopeCopayCents: 250000,
    acuteHospitalScopeCopayCents: 520000,
    defaultMsaBalanceCents: 940000,
  },
];

// ---------------------------------------------------------------------------
// 2. 2026 SOUTH AFRICAN GAP COVER POLICIES (OAL = R223,000)
// ---------------------------------------------------------------------------
export const SA_GAP_COVER_POLICIES: SaGapCoverPolicy[] = [
  {
    id: "gap-sirago-liberal-2026",
    providerName: "Sirago",
    productName: "Gap Liberal 500",
    maxTariffCoverPct: 500,
    overallAnnualLimitCents: 22300000,     // R223,000.00 statutory 2026 OAL
    coversDspCopayments: true,
    maxNonDspPenaltyCapCents: 1600000,     // R16,000.00 max non-DSP hospital penalty cover
    privateWardUpgradeSublimitCents: 120000, // R1,200.00 private room upgrade sub-limit
    roboticSurgerySublimitCents: 1500000,
    apiWebhookEndpoint: "https://api.sirago.co.za/v2/claims/auto-adjudicate",
  },
  {
    id: "gap-turnberry-premier-2026",
    providerName: "Turnberry",
    productName: "PremierMax 600",
    maxTariffCoverPct: 600,
    overallAnnualLimitCents: 22300000,     // R223,000.00 statutory 2026 OAL
    coversDspCopayments: true,
    maxNonDspPenaltyCapCents: 1500000,     // R15,000.00 co-payment cover cap
    privateWardUpgradeSublimitCents: 150000,
    roboticSurgerySublimitCents: 2000000,
    apiWebhookEndpoint: "https://claims-gateway.turnberry.co.za/v1/era-ingest",
  },
  {
    id: "gap-zestlife-universal-2026",
    providerName: "Zestlife",
    productName: "Universal Gap 500",
    maxTariffCoverPct: 500,
    overallAnnualLimitCents: 22300000,
    coversDspCopayments: true,
    maxNonDspPenaltyCapCents: 1350000,
    privateWardUpgradeSublimitCents: 100000,
    roboticSurgerySublimitCents: 1500000,
    apiWebhookEndpoint: "https://api.zestlife.co.za/v1/shortfall-webhook",
  },
];

// ---------------------------------------------------------------------------
// 3. SOUTH AFRICAN PRIVATE HOSPITALS & DAY CLINICS
// ---------------------------------------------------------------------------
export const SA_HOSPITALS: SaHospitalFacility[] = [
  {
    id: "hosp-netcare-linksfield",
    name: "Netcare Linksfield Hospital",
    group: "Netcare",
    facilityType: "ACUTE_HOSPITAL",
    province: "Gauteng",
    city: "Johannesburg",
    bhfPracticeNumber: "0580442",
    pasSystem: "CareOn_EMR",
    privateWardUpgradeDailyCents: 195000, // R1,950.00 per day for private suite upgrade
    cateringMenu: [
      {
        code: "MEAL-HL-SOFT-01",
        title: "Halal Steamed Linefish & Butternut Veloute",
        dietaryTags: ["Halal", "Soft_PostOp"],
        description: "Dietitian-approved post-anaesthetic light protein meal (SANHA certified).",
      },
      {
        code: "MEAL-HL-STD-02",
        title: "Halal Grilled Chicken Breast & Basmati Rice",
        dietaryTags: ["Halal", "Standard"],
        description: "Low-sodium grilled fillet with steamed seasonal greens.",
      },
      {
        code: "MEAL-VEG-SOFT-03",
        title: "Clear Vegetable Broth & Oats Porridge",
        dietaryTags: ["Vegetarian", "Soft_PostOp", "Halal"],
        description: "Stage-1 post-laparoscopic clear & soft digestive recovery option.",
      },
    ],
  },
  {
    id: "hosp-life-fourways",
    name: "Life Fourways Hospital",
    group: "Life Healthcare",
    facilityType: "ACUTE_HOSPITAL",
    province: "Gauteng",
    city: "Sandton / Fourways",
    bhfPracticeNumber: "0581920",
    pasSystem: "SAP_ISH_Med",
    privateWardUpgradeDailyCents: 185000, // R1,850.00 per day
    cateringMenu: [
      {
        code: "MEAL-LF-HL-01",
        title: "Halal Braised Chicken Broth & Mashed Sweet Potato",
        dietaryTags: ["Halal", "Soft_PostOp"],
        description: "High-protein recovery meal cleared for orthopaedic & general wards.",
      },
      {
        code: "MEAL-LF-KS-02",
        title: "Kosher Poached Kingklip & Steamed Courgettes",
        dietaryTags: ["Kosher", "Soft_PostOp"],
        description: "Beth Din certified sealed post-operative recovery meal.",
      },
    ],
  },
  {
    id: "hosp-cure-midstream",
    name: "Cure Day Hospitals Midstream",
    group: "Cure Day Hospitals",
    facilityType: "DAY_HOSPITAL",
    province: "Gauteng",
    city: "Centurion / Midrand",
    bhfPracticeNumber: "0770419",
    pasSystem: "GoodX_Web",
    privateWardUpgradeDailyCents: 65000, // R650.00 private recovery pod upgrade
    cateringMenu: [
      {
        code: "MEAL-CD-HL-01",
        title: "Halal Light Chicken & Herb Soup + Hydration Pack",
        dietaryTags: ["Halal", "Soft_PostOp"],
        description: "Served 60 minutes post-theatre once cleared by recovery sister.",
      },
    ],
  },
  {
    id: "hosp-mediclinic-sandton",
    name: "Mediclinic Sandton",
    group: "Mediclinic",
    facilityType: "ACUTE_HOSPITAL",
    province: "Gauteng",
    city: "Sandton",
    bhfPracticeNumber: "0580115",
    pasSystem: "Meditech",
    privateWardUpgradeDailyCents: 210000,
    cateringMenu: [
      {
        code: "MEAL-MC-HL-01",
        title: "Halal Roast Chicken Supreme & Pumpkin Puree",
        dietaryTags: ["Halal", "Soft_PostOp", "Standard"],
        description: "Balanced post-surgical recovery meal.",
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// 4. SURGICAL EPISODE TEMPLATES (ICD-10 + SA RPL TARIFF PACKAGES)
// ---------------------------------------------------------------------------
export const SA_SURGICAL_TEMPLATES: SaSurgicalPackageTemplate[] = [
  {
    id: "surg-knee-arthroscopy",
    procedureTitle: "Arthroscopic Meniscectomy & Chondroplasty (Right Knee)",
    specialty: "Orthopaedics",
    icd10Codes: [
      { code: "M23.2", description: "Derangement of meniscus due to old tear or injury", isPmb: false },
      { code: "M17.1", description: "Other primary gonarthrosis (unilateral)", isPmb: false },
    ],
    rplTariffCodes: [
      { code: "2443", description: "Knee: Arthroscopic partial meniscectomy", units: 185 },
      { code: "2444", description: "Knee: Arthroscopic chondroplasty / debridement", units: 120 },
      { code: "0023", description: "Anaesthetic modifier: Lower extremity orthopaedic", units: 36 },
    ],
    defaultSurgeonName: "Dr. T. Mokoena (Orthopaedic Surgeon)",
    defaultSurgeonBhf: "0284910",
    defaultAnaesthetistName: "Dr. R. van der Merwe (Anaesthesiologist)",
    defaultAnaesthetistBhf: "0109482",
    defaultSpecialistRatePct: 250,          // Charges 250% of scheme rate
    estimatedStayDays: 1,
    hospitalBaseEstimateCents: 3840000,     // R38,400.00 Theatre + Ward + Consumables
    surgeonSchemeTariffCents: 685000,       // R6,850.00 (100% scheme tariff -> R17,125 at 250%)
    anaesthetistSchemeTariffCents: 312000,  // R3,120.00 (100% scheme tariff -> R7,800 at 250%)
    pathologyEstimateCents: 145000,         // R1,450.00 Pre-op U&E / FBC (Ampath)
    recommendedFacilityType: "DAY_HOSPITAL",
  },
  {
    id: "surg-lap-cholecystectomy",
    procedureTitle: "Laparoscopic Cholecystectomy with Intra-Operative Cholangiogram",
    specialty: "General Surgery",
    icd10Codes: [
      { code: "K80.2", description: "Calculus of gallbladder without cholecystitis", isPmb: false },
      { code: "K82.8", description: "Other specified diseases of gallbladder", isPmb: false },
    ],
    rplTariffCodes: [
      { code: "1807", description: "Laparoscopic cholecystectomy", units: 260 },
      { code: "1809", description: "Intra-operative cholangiography", units: 55 },
      { code: "0025", description: "Intra-abdominal laparoscopic anaesthetic modifier", units: 48 },
    ],
    defaultSurgeonName: "Dr. A. Ebrahim (Specialist General Surgeon)",
    defaultSurgeonBhf: "0421883",
    defaultAnaesthetistName: "Dr. S. Naidoo (Anaesthesiologist)",
    defaultAnaesthetistBhf: "0107731",
    defaultSpecialistRatePct: 300,          // Charges 300% of scheme rate
    estimatedStayDays: 2,
    hospitalBaseEstimateCents: 5490000,     // R54,900.00 Theatre + 2-day High Care/General Ward
    surgeonSchemeTariffCents: 842000,       // R8,420.00 (100% scheme tariff -> R25,260 at 300%)
    anaesthetistSchemeTariffCents: 418000,  // R4,180.00 (100% scheme tariff -> R12,540 at 300%)
    pathologyEstimateCents: 289000,         // R2,890.00 LFT + Histology gallbladder (Lancet)
    recommendedFacilityType: "ACUTE_HOSPITAL",
  },
  {
    id: "surg-cataract-phaco",
    procedureTitle: "Unilateral Phacoemulsification Cataract Extraction + IOL Lens",
    specialty: "Ophthalmology",
    icd10Codes: [
      { code: "H25.1", description: "Senile nuclear cataract", isPmb: true },
    ],
    rplTariffCodes: [
      { code: "3047", description: "Lens extraction (Phacoemulsification) with foldable IOL insertion", units: 210 },
      { code: "0036", description: "Ophthalmic regional/peribulbar anaesthetic block", units: 28 },
    ],
    defaultSurgeonName: "Dr. L. Botha (Ophthalmologist)",
    defaultSurgeonBhf: "0267119",
    defaultAnaesthetistName: "Dr. M. Khumalo (Anaesthesiologist)",
    defaultAnaesthetistBhf: "0108841",
    defaultSpecialistRatePct: 200,          // Charges 200% of scheme rate
    estimatedStayDays: 1,
    hospitalBaseEstimateCents: 2680000,     // R26,800.00 Day Theatre + Alcon Intraocular Lens
    surgeonSchemeTariffCents: 590000,       // R5,900.00 (100% scheme tariff -> R11,800 at 200%)
    anaesthetistSchemeTariffCents: 245000,  // R2,450.00 (100% scheme tariff -> R4,900 at 200%)
    pathologyEstimateCents: 0,
    recommendedFacilityType: "DAY_HOSPITAL",
  },
];

// ---------------------------------------------------------------------------
// 5. DEMO PATIENT PROFILES FOR INSTANT TESTING
// ---------------------------------------------------------------------------
export const DEMO_PATIENTS = [
  {
    id: "pat-001-za",
    fullName: "Tariq Abrahams",
    idNumber: "8406125023081",
    idNumberMasked: "840612****081",
    phone: "+27 82 555 0194",
    email: "tariq.abrahams@example.co.za",
    dietaryPreferences: ["Halal", "Soft_PostOp"],
    defaultSchemePlanId: "disc-classic-smart-comp-2026",
    memberNumber: "88492011",
    dependentCode: "00",
    defaultGapPolicyId: "gap-sirago-liberal-2026",
    gapPolicyNumber: "SRG-2026-99412",
  },
  {
    id: "pat-002-za",
    fullName: "Nomsa Dlamini",
    idNumber: "7911040129084",
    idNumberMasked: "791104****084",
    phone: "+27 83 441 8820",
    email: "nomsa.d@example.co.za",
    dietaryPreferences: ["Standard", "Soft_PostOp"],
    defaultSchemePlanId: "bonitas-bonprime-2026",
    memberNumber: "44109283",
    dependentCode: "00",
    defaultGapPolicyId: "gap-turnberry-premier-2026",
    gapPolicyNumber: "TRN-2026-55108",
  },
];

// ---------------------------------------------------------------------------
// 6. BACKWARD COMPATIBILITY BRIDGE & IN-MEMORY REPOSITORY
// ---------------------------------------------------------------------------
export interface MockPatient {
  id: string;
  idNumber: string;
  fullName: string;
  phone: string;
  email: string;
  dietaryPreference: "Standard" | "Soft_Halal" | "Kosher" | "Diabetic" | "Vegetarian";
}

export interface MockPolicy {
  patientId: string;
  schemeName: string;
  schemeCode: string;
  planName: string;
  memberNumber: string;
  dependentCode: string;
  isMainMember: boolean;
  status: "ACTIVE" | "SUSPENDED" | "ARREARS";
  msaBalanceCents: number;
  gapProvider?: string;
  gapPolicyNumber?: string;
  gapMaxTariffPct: number;
  gapCoversDspCopay: boolean;
}

export interface MockHospital {
  id: string;
  name: string;
  networkGroup: "Netcare" | "Mediclinic" | "Life Healthcare" | "Busamed" | "Advanced Health" | "Cure Day Hospitals" | "NHN Independent";
  bhfNumber: string;
  city: string;
  province: string;
  isDspForSchemes: string[];
  nonDspPenaltyCents: number;
  theatreBaseFeeCents: number;
}

export interface MockDoctor {
  bhfNumber: string;
  fullName: string;
  specialty: string;
  standardRatePct: number;
}

export interface MockClinicalProcedure {
  code: string;
  description: string;
  defaultIcd10: string;
  icd10Description: string;
  schemeBaseTariffCents: number;
  anaesthesiaBaseTariffCents: number;
  typicalStayDays: number;
}

// Map 2026 dataset to legacy structure
export const MOCK_SCHEMES = SA_MEDICAL_SCHEME_PLANS.map((p) => ({
  code: p.id.split("-")[0].toUpperCase(),
  name: p.schemeName,
  switch: p.switchRoute,
  plans: [p.planName],
}));

export const MOCK_GAP_PROVIDERS = SA_GAP_COVER_POLICIES.map((g) => ({
  name: g.providerName,
  maxTariffPct: g.maxTariffCoverPct,
  coversDspCopay: g.coversDspCopayments,
}));

export const MOCK_HOSPITALS: MockHospital[] = [
  ...SA_HOSPITALS.map((h) => ({
    id: h.id,
    name: h.name,
    networkGroup: h.group,
    bhfNumber: h.bhfPracticeNumber,
    city: h.city,
    province: h.province,
    isDspForSchemes: [
      "Discovery Health Medical Scheme",
      "Discovery Health",
      "Bonitas Medical Fund",
      "Bonitas",
      "Momentum Medical Scheme",
      "Momentum Health",
    ],
    nonDspPenaltyCents: 1265000,
    theatreBaseFeeCents: 3840000,
  })),
  // Retain legacy IDs for instant lookup
  {
    id: "HOSP-NET-01",
    name: "Netcare Linksfield Hospital",
    networkGroup: "Netcare",
    bhfNumber: "0580442",
    city: "Johannesburg",
    province: "Gauteng",
    isDspForSchemes: ["Discovery Health Medical Scheme", "Discovery Health", "Bonitas", "Sasolmed"],
    nonDspPenaltyCents: 520000,
    theatreBaseFeeCents: 1850000,
  },
  {
    id: "HOSP-MED-02",
    name: "Mediclinic Sandton",
    networkGroup: "Mediclinic",
    bhfNumber: "0580115",
    city: "Sandton",
    province: "Gauteng",
    isDspForSchemes: ["Discovery Health Medical Scheme", "Discovery Health", "Momentum Medical Scheme", "Momentum Health"],
    nonDspPenaltyCents: 485000,
    theatreBaseFeeCents: 2100000,
  },
  {
    id: "HOSP-LIFE-03",
    name: "Life Fourways Hospital",
    networkGroup: "Life Healthcare",
    bhfNumber: "0581920",
    city: "Fourways",
    province: "Gauteng",
    isDspForSchemes: ["Bonitas Medical Fund", "Bonitas"],
    nonDspPenaltyCents: 460000,
    theatreBaseFeeCents: 1750000,
  },
  {
    id: "HOSP-CURE-04",
    name: "Cure Day Hospitals Midstream",
    networkGroup: "Cure Day Hospitals",
    bhfNumber: "0770419",
    city: "Midrand",
    province: "Gauteng",
    isDspForSchemes: ["Discovery Health Medical Scheme", "Discovery Health", "Bonitas", "Momentum Health"],
    nonDspPenaltyCents: 0,
    theatreBaseFeeCents: 1600000,
  },
];

export const MOCK_DOCTORS: MockDoctor[] = [
  {
    bhfNumber: "0284910",
    fullName: "Dr. T. Mokoena",
    specialty: "Orthopaedic Surgery",
    standardRatePct: 250,
  },
  {
    bhfNumber: "0421883",
    fullName: "Dr. A. Ebrahim",
    specialty: "General Surgery",
    standardRatePct: 300,
  },
  {
    bhfNumber: "0267119",
    fullName: "Dr. L. Botha",
    specialty: "Ophthalmology",
    standardRatePct: 200,
  },
  {
    bhfNumber: "0109482",
    fullName: "Dr. R. van der Merwe",
    specialty: "Anaesthesiology",
    standardRatePct: 250,
  },
  {
    bhfNumber: "0107731",
    fullName: "Dr. S. Naidoo",
    specialty: "Anaesthesiology",
    standardRatePct: 250,
  },
  // Legacy doctor BHF numbers
  {
    bhfNumber: "BHF-0449218",
    fullName: "Dr. Thabo Ndlovu",
    specialty: "Orthopaedic Surgery",
    standardRatePct: 250,
  },
];

export const MOCK_PROCEDURES: MockClinicalProcedure[] = [
  ...SA_SURGICAL_TEMPLATES.map((t) => ({
    code: t.rplTariffCodes[0].code,
    description: t.procedureTitle,
    defaultIcd10: t.icd10Codes[0].code,
    icd10Description: t.icd10Codes[0].description,
    schemeBaseTariffCents: t.surgeonSchemeTariffCents,
    anaesthesiaBaseTariffCents: t.anaesthetistSchemeTariffCents,
    typicalStayDays: t.estimatedStayDays,
  })),
  {
    code: "2391",
    description: "Total Hip Arthroplasty (Replacement)",
    defaultIcd10: "M16.1",
    icd10Description: "Other primary coxarthrosis",
    schemeBaseTariffCents: 1850000,
    anaesthesiaBaseTariffCents: 780000,
    typicalStayDays: 3,
  },
];

export const MOCK_PATIENTS: MockPatient[] = [
  {
    id: "pat-001-za",
    idNumber: "8406125023081",
    fullName: "Tariq Abrahams",
    phone: "+27 82 555 0194",
    email: "tariq.abrahams@example.co.za",
    dietaryPreference: "Soft_Halal",
  },
  {
    id: "pat-002-za",
    idNumber: "7911040129084",
    fullName: "Nomsa Dlamini",
    phone: "+27 83 441 8820",
    email: "nomsa.d@example.co.za",
    dietaryPreference: "Standard",
  },
  // Legacy test patients
  {
    id: "pat-850612",
    idNumber: "8506125023088",
    fullName: "Sipho Dlamini",
    phone: "+27 82 555 1928",
    email: "sipho.dlamini@email.co.za",
    dietaryPreference: "Soft_Halal",
  },
  {
    id: "pat-920314",
    idNumber: "9203140129084",
    fullName: "Sarah Jenkins",
    phone: "+27 71 444 8812",
    email: "sarah.jenkins@workmail.co.za",
    dietaryPreference: "Standard",
  },
];

export const MOCK_POLICIES: Record<string, MockPolicy> = {
  "8406125023081": {
    patientId: "pat-001-za",
    schemeName: "Discovery Health Medical Scheme",
    schemeCode: "DISC",
    planName: "Classic Smart Comprehensive",
    memberNumber: "88492011",
    dependentCode: "00",
    isMainMember: true,
    status: "ACTIVE",
    msaBalanceCents: 1845000, // R18,450.00
    gapProvider: "Sirago",
    gapPolicyNumber: "SRG-2026-99412",
    gapMaxTariffPct: 500,
    gapCoversDspCopay: true,
  },
  "7911040129084": {
    patientId: "pat-002-za",
    schemeName: "Bonitas Medical Fund",
    schemeCode: "BON",
    planName: "BonPrime Network",
    memberNumber: "44109283",
    dependentCode: "00",
    isMainMember: true,
    status: "ACTIVE",
    msaBalanceCents: 695000,
    gapProvider: "Turnberry",
    gapPolicyNumber: "TRN-2026-55108",
    gapMaxTariffPct: 600,
    gapCoversDspCopay: true,
  },
  "8506125023088": {
    patientId: "pat-850612",
    schemeName: "Discovery Health Medical Scheme",
    schemeCode: "DISC",
    planName: "Classic Smart Comprehensive",
    memberNumber: "904812049",
    dependentCode: "00",
    isMainMember: true,
    status: "ACTIVE",
    msaBalanceCents: 1845000,
    gapProvider: "Sirago",
    gapPolicyNumber: "SIR-994821",
    gapMaxTariffPct: 500,
    gapCoversDspCopay: true,
  },
  "9203140129084": {
    patientId: "pat-920314",
    schemeName: "Bonitas Medical Fund",
    schemeCode: "BON",
    planName: "BonPrime Network",
    memberNumber: "774910283",
    dependentCode: "01",
    isMainMember: false,
    status: "ACTIVE",
    msaBalanceCents: 695000,
    gapProvider: "Turnberry",
    gapPolicyNumber: "TB-004921",
    gapMaxTariffPct: 500,
    gapCoversDspCopay: true,
  },
};

// In-Memory Surgical Episode Store
export interface StoredEpisode {
  id: string;
  episodeRef: string;
  patientId: string;
  patientName: string;
  patientIdNumber: string;
  phone: string;
  email: string;
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
  nonDspCopayCents: number;
  icd10Codes: string[];
  rplTariffCodes: string[];
  specialistRatePct: number;
  procedureTitle: string;
  admissionDate: string;
  estimatedStayDays: number;
  hospitalBaseCents: number;
  surgeonSchemeTariffCents: number;
  anaesthetistSchemeTariffCents: number;
  pathologyEstimateCents: number;
  wardType: "General_Ward" | "Private_Suite";
  wardUpgradeCents: number;
  dietaryTag: string;
  selectedMealCode: string;
  status: "DRAFT" | "QUOTE_READY" | "AUTH_PENDING" | "AUTHORISED" | "CHECKED_IN" | "ADMITTED" | "DISCHARGED" | "SETTLED";
  authNumber?: string;
  preauthPayload?: any;
  financialClearance?: any;
  qrCheckinToken?: string;
  consentSigned?: boolean;
  paymentMethod?: string;
  paymentReference?: string;
  gapClaimFiled?: boolean;
  gapClaimReference?: string;
  createdAt: string;
  updatedAt: string;
}

const globalEpisodeStore: Map<string, StoredEpisode> = new Map();

function initSeedEpisodes() {
  if (globalEpisodeStore.size > 0) return;

  const defaultEpisode: StoredEpisode = {
    id: "ep-88492-za",
    episodeRef: "EP-88492-ZA",
    patientId: "pat-001-za",
    patientName: "Tariq Abrahams",
    patientIdNumber: "8406125023081",
    phone: "+27 82 555 0194",
    email: "tariq.abrahams@example.co.za",
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
    icd10Codes: ["M23.2", "M17.1"],
    rplTariffCodes: ["2443", "2444", "0023"],
    specialistRatePct: 250,
    procedureTitle: "Arthroscopic Meniscectomy & Chondroplasty (Right Knee)",
    admissionDate: "2026-11-04",
    estimatedStayDays: 1,
    hospitalBaseCents: 3840000,
    surgeonSchemeTariffCents: 685000,
    anaesthetistSchemeTariffCents: 312000,
    pathologyEstimateCents: 145000,
    wardType: "General_Ward",
    wardUpgradeCents: 0,
    dietaryTag: "Soft_Halal",
    selectedMealCode: "MEAL-HL-SOFT-01",
    status: "QUOTE_READY",
    qrCheckinToken: "ADM-8849-JHB",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  globalEpisodeStore.set(defaultEpisode.id, defaultEpisode);
  globalEpisodeStore.set(defaultEpisode.episodeRef.toLowerCase(), defaultEpisode);
}

initSeedEpisodes();

export const episodeDb = {
  get(idOrRef: string): StoredEpisode | undefined {
    initSeedEpisodes();
    const key = idOrRef.toLowerCase();
    return globalEpisodeStore.get(key) || Array.from(globalEpisodeStore.values()).find(
      (e) => e.id.toLowerCase() === key || e.episodeRef.toLowerCase() === key
    );
  },
  save(episode: StoredEpisode): StoredEpisode {
    initSeedEpisodes();
    globalEpisodeStore.set(episode.id.toLowerCase(), episode);
    globalEpisodeStore.set(episode.episodeRef.toLowerCase(), episode);
    return episode;
  },
  list(): StoredEpisode[] {
    initSeedEpisodes();
    const seen = new Set<string>();
    const result: StoredEpisode[] = [];
    for (const ep of globalEpisodeStore.values()) {
      if (!seen.has(ep.id)) {
        seen.add(ep.id);
        result.push(ep);
      }
    }
    return result;
  },
};
