"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authenticatedFetch } from "@/lib/auth/authenticated-fetch-client";
import { completeContractorSignup } from "@/lib/contractor/complete-signup";
import {
  clearContractorSignupPrefill,
  readContractorSignupPrefill,
} from "@/lib/contractor/signup-prefill";
import {
  clearContractorProjectReturn,
  readContractorProjectReturn,
} from "@/lib/contractor/contractor-project-onboarding";
import {
  clearShareLinkReturn,
  readShareLinkReturn,
} from "@/lib/contractor/share-link-onboarding";

export function ContractorOnboardingForm({
  defaultCompanyName = "",
  defaultContactName = "",
  defaultServiceArea = "",
}: {
  defaultCompanyName?: string;
  defaultContactName?: string;
  defaultServiceArea?: string;
}) {
  const router = useRouter();
  const { getToken } = useAuth();
  const [companyName, setCompanyName] = useState(defaultCompanyName);
  const [contactName, setContactName] = useState(defaultContactName);
  const [serviceArea, setServiceArea] = useState(defaultServiceArea);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const prefill = readContractorSignupPrefill();
    if (!prefill) return;

    setCompanyName((current) => current || prefill.companyName || "");
    setContactName((current) => current || prefill.contactName || "");
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await completeContractorSignup(
        {
          company_name: companyName,
          contact_name: contactName,
          service_area: serviceArea,
          complete_onboarding: true,
        },
        getToken
      );
      clearContractorSignupPrefill();

      const shareLinkReturn = readShareLinkReturn();
      if (shareLinkReturn?.startsWith("/review/")) {
        const token = shareLinkReturn.replace("/review/", "");
        await authenticatedFetch(getToken, `/api/review/${token}/claim`, {
          method: "POST",
        });
        clearShareLinkReturn();
        router.push(shareLinkReturn);
        router.refresh();
        return;
      }

      const projectReturn = readContractorProjectReturn();
      if (projectReturn?.startsWith("/projects/")) {
        const projectId = projectReturn.replace("/projects/", "").split("?")[0];
        await fetch(`/api/projects/${projectId}/claim`, { method: "POST" });
        clearContractorProjectReturn();
        router.push(projectReturn);
        router.refresh();
        return;
      }

      router.push("/contractor");
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

      <div className="space-y-2">
        <Label htmlFor="service_area">Service area</Label>
        <Input
          id="service_area"
          value={serviceArea}
          onChange={(event) => setServiceArea(event.target.value)}
          placeholder="e.g. Los Angeles area"
          required
        />
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <Button
        type="submit"
        className="w-full"
        disabled={
          loading ||
          !companyName.trim() ||
          !contactName.trim() ||
          !serviceArea.trim()
        }
      >
        {loading ? "Saving..." : "Continue to dashboard"}
      </Button>
    </form>
  );
}
