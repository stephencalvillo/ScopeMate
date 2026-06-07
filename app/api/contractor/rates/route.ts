import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/response";
import { requireContractorProfile } from "@/lib/auth/contractor";
import {
  listContractorRates,
  replaceContractorRates,
} from "@/lib/contractor/rates";
import { saveContractorRatesSchema } from "@/lib/validators/contractor-rates";

export async function GET() {
  try {
    const { user } = await requireContractorProfile();
    const rates = await listContractorRates(user.id);
    return NextResponse.json({ rates });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const { user } = await requireContractorProfile();
    const body = await request.json();
    const parsed = saveContractorRatesSchema.parse(body);
    const rates = await replaceContractorRates(user.id, parsed.rates);

    return NextResponse.json({ rates });
  } catch (error) {
    return jsonError(error);
  }
}
