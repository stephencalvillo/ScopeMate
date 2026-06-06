"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { completeContractorSignup } from "@/lib/contractor/complete-signup";
import {
  clearContractorSignupPrefill,
  readContractorSignupPrefill,
} from "@/lib/contractor/signup-prefill";

export function ContractorOnboardingForm({
  defaultCompanyName = "",
  defaultContactName = "",
}: {
  defaultCompanyName?: string;
  defaultContactName?: string;
}) {
  const router = useRouter();
  const prefill = readContractorSignupPrefill();
  const [companyName, setCompanyName] = useState(
    defaultCompanyName || prefill?.companyName || ""
  );
  const [contactName, setContactName] = useState(
    defaultContactName || prefill?.contactName || ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await completeContractorSignup({
        company_name: companyName,
        contact_name: contactName,
        complete_onboarding: true,
      });
      clearContractorSignupPrefill();
      router.push("/contractor");
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not finish setup."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="company_name">Company name</Label>
        <Input
          id="company_name"
          value={companyName}
          onChange={(event) => setCompanyName(event.target.value)}
          placeholder="Your company"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact_name">Your name</Label>
        <Input
          id="contact_name"
          value={contactName}
          onChange={(event) => setContactName(event.target.value)}
          placeholder="How homeowners should address you"
          required
        />
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <Button
        type="submit"
        className="w-full"
        disabled={loading || !companyName.trim() || !contactName.trim()}
      >
        {loading ? "Saving..." : "Continue to dashboard"}
      </Button>
    </form>
  );
}
