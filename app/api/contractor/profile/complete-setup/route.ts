import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/response";
import { ensureUserRecord } from "@/lib/auth/clerk";
import { completeContractorSetupIfReady } from "@/lib/contractor/profile";

export async function POST(request: Request) {
  try {
    const user = await ensureUserRecord();
    const body = await request.json().catch(() => ({}));
    const prefill =
      body.prefill && typeof body.prefill === "object"
        ? {
            contactName:
              typeof body.prefill.contactName === "string"
                ? body.prefill.contactName
                : undefined,
            companyName:
              typeof body.prefill.companyName === "string"
                ? body.prefill.companyName
                : undefined,
          }
        : undefined;

    const result = await completeContractorSetupIfReady(user, { prefill });

    return NextResponse.json(result);
  } catch (error) {
    return jsonError(error);
  }
}
