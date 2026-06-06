import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/response";
import { ensureContractorProfile } from "@/lib/auth/contractor";
import { ensureUserRecord } from "@/lib/auth/clerk";
import { getContractorProfile } from "@/lib/contractor/profile";

export async function GET() {
  try {
    const user = await ensureUserRecord();
    const profile = await getContractorProfile(user.id);

    return NextResponse.json({ profile, user });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const companyName =
      typeof body.company_name === "string" ? body.company_name : "";
    const contactName =
      typeof body.contact_name === "string" ? body.contact_name : "";
    const phone = typeof body.phone === "string" ? body.phone : null;
    const completeOnboarding = body.complete_onboarding !== false;

    const { profile, user } = await ensureContractorProfile({
      company_name: companyName,
      contact_name: contactName,
      phone,
      complete_onboarding: completeOnboarding,
    });

    return NextResponse.json({ profile, user });
  } catch (error) {
    return jsonError(error);
  }
}
