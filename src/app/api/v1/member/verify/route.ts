// src/app/api/v1/member/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import { SA_MEDICAL_SCHEME_PLANS, DEMO_PATIENTS } from "@/lib/mock-sa-healthcare";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { schemeName, memberNumber, dependentCode, idNumber } = body;

    if (!memberNumber) {
      return NextResponse.json(
        { error: "Validation Error", message: "memberNumber is required." },
        { status: 400 }
      );
    }

    // Match against mock South African schemes or demo patients
    const matchedPlan = SA_MEDICAL_SCHEME_PLANS.find(
      (p) =>
        !schemeName ||
        p.schemeName.toLowerCase().includes(schemeName.toLowerCase()) ||
        p.id === schemeName
    ) || SA_MEDICAL_SCHEME_PLANS[0];

    const matchedPatient = DEMO_PATIENTS.find(
      (pat) => pat.memberNumber === memberNumber || pat.idNumberMasked.includes(idNumber?.slice(-4))
    ) || DEMO_PATIENTS[0];

    return NextResponse.json({
      success: true,
      verifiedAt: new Date().toISOString(),
      member: {
        patientId: matchedPatient.id,
        fullName: matchedPatient.fullName,
        idNumberMasked: matchedPatient.idNumberMasked,
        schemeName: matchedPlan.schemeName,
        planName: matchedPlan.planName,
        memberNumber,
        dependentCode: dependentCode || "00",
        membershipStatus: "ACTIVE",
        inHospitalSpecialistRatePct: matchedPlan.inHospitalSpecialistRatePct,
        dspHospitalIds: matchedPlan.dspHospitalIds,
        nonDspHospitalCopayCents: matchedPlan.nonDspHospitalCopayCents,
        msaBalanceCents: matchedPlan.defaultMsaBalanceCents,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Internal Server Error", message: err.message },
      { status: 500 }
    );
  }
}
