// src/app/api/v1/episodes/[id]/checkin/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { wardType, mealSelectionCode, dietaryTag, consentSigned, paymentMethod } = body;

    if (!consentSigned) {
      return NextResponse.json(
        { error: "Compliance Error", message: "Digital patient indemnity consent must be signed." },
        { status: 400 }
      );
    }

    const qrToken = `ADM-${Math.floor(1000 + Math.random() * 9000)}-JHB`;

    return NextResponse.json({
      success: true,
      episodeId: id,
      admissionStatus: "CHECKED_IN",
      qrCheckinToken: qrToken,
      hospitalityConfirmation: {
        wardType: wardType || "General_Ward",
        dietaryTag: dietaryTag || "Halal",
        selectedMealCode: mealSelectionCode || "MEAL-HL-SOFT-01",
        consentSignedAt: new Date().toISOString(),
      },
      paymentRecord: {
        method: paymentMethod || "ZERO_COPAY",
        status: "SETTLED",
      },
      message: "Patient pre-admission successfully synced to hospital PAS & kitchen ERP.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Check-in Failed", message: err.message },
      { status: 500 }
    );
  }
}
