import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/response";
import { requireContractorProfile } from "@/lib/auth/contractor";
import { listContractorReviews } from "@/lib/contractor/profile";

export async function GET() {
  try {
    const { user } = await requireContractorProfile();
    const reviews = await listContractorReviews(user.id);

    return NextResponse.json({ reviews });
  } catch (error) {
    return jsonError(error);
  }
}
