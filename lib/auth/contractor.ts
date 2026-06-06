import { ensureUserRecord, ForbiddenError } from "@/lib/auth/clerk";
import {
  getContractorProfile,
  type UpsertContractorProfileInput,
  upsertContractorProfile,
} from "@/lib/contractor/profile";
import type { ContractorProfile, User } from "@/types";

export async function requireContractorProfile(): Promise<{
  user: User;
  profile: ContractorProfile;
}> {
  const user = await ensureUserRecord();
  const profile = await getContractorProfile(user.id);

  if (!profile) {
    throw new ForbiddenError("Contractor profile not found.");
  }

  return { user, profile };
}

export async function ensureContractorProfile(
  input: UpsertContractorProfileInput
): Promise<{ user: User; profile: ContractorProfile }> {
  const user = await ensureUserRecord();
  const profile = await upsertContractorProfile(user, input);
  return { user, profile };
}
