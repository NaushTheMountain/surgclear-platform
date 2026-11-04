// src/app/api/v1/episodes/[id]/preauth/route.ts
import { NextRequest, NextResponse } from "next/server";
import { calculateSurgicalClearance, buildFhirPreAuthPayload, SurgicalEpisodeInput } from "@/lib/cost-engine";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: { episodeData: SurgicalEpisodeInput; clinicalNotes?: string } = await req.json();

    if (!body.episodeData) {
      return NextResponse.json(
        { error: "Validation Error", message: "episodeData payload is required." },
        { status: 400 }
      );
    }

    const clearance = calculateSurgicalClearance(body.episodeData);
    const fhirPayload = buildFhirPreAuthPayload(body.episodeData, clearance);

    // Generate mock authoritative pre-auth number (e.g. #PA-884920-ZA)
    const randomAuthNum = `PA-${Math.floor(100000 + Math.random() * 900000)}-ZA`;

    return NextResponse.json({
      success: true,
      episodeId: id,
      authNumber: randomAuthNum,
      status: "AUTHORISED",
      approvedDays: body.episodeData.estimatedStayDays || 2,
      approvedWardType: "General_Ward",
      financialSummary: {
        totalClaimedCents: clearance.totalEstimatedOperationCents,
        schemeCoveredCents: clearance.totalSchemePaidCents,
        gapCoveredCents: clearance.totalGapCoverPayoutCents,
        netPatientLiabilityCents: clearance.netPatientOutOfPocketCents,
      },
      fhirPayload,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Pre-Authorisation Failed", message: err.message },
      { status: 500 }
    );
  }
}
