// src/app/api/v1/episodes/estimate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { calculateSurgicalClearance, SurgicalEpisodeInput } from "@/lib/cost-engine";

export async function POST(req: NextRequest) {
  try {
    const body: SurgicalEpisodeInput = await req.json();

    if (!body.hospitalBaseCents || !body.surgeonSchemeTariffCents) {
      return NextResponse.json(
        { error: "Validation Error", message: "Missing required billing baselines in ZAR cents." },
        { status: 400 }
      );
    }

    const clearanceResult = calculateSurgicalClearance(body);

    return NextResponse.json({
      success: true,
      calculatedAt: new Date().toISOString(),
      currency: "ZAR_CENTS",
      estimate: clearanceResult,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Estimation Failed", message: err.message },
      { status: 500 }
    );
  }
}
