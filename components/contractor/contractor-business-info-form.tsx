"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { ServiceAreaCombobox } from "@/components/contractor/service-area-combobox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authenticatedFetch } from "@/lib/auth/authenticated-fetch-client";
import {
  isKnownServiceArea,
  normalizeServiceArea,
} from "@/lib/location/service-areas";

export function ContractorBusinessInfoForm({
  defaultCompanyName,
  defaultContactName,
  defaultServiceArea,
}: {
  defaultCompanyName: string;
  defaultContactName: string;
  defaultServiceArea: string;
}) {
  const router = useRouter();
  const { getToken } = useAuth();
  const [companyName, setCompanyName] = useState(defaultCompanyName);
  const [contactName, setContactName] = useState(defaultContactName);
  const [serviceArea, setServiceArea] = useState(defaultServiceArea);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const canonicalServiceArea = normalizeServiceArea(serviceArea);
    if (!canonicalServiceArea) {
      setError("Choose your service area from the list.");
      setLoading(false);
      return;
    }

    try {
      const response = await authenticatedFetch(getToken, "/api/contractor/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: companyName,
          contact_name: contactName,
          service_area: canonicalServiceArea,
          complete_onboarding: false,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Could not save your business info.");
      }

      setCompanyName(data.profile.company_name);
      setContactName(data.profile.contact_name);
      setServiceArea(data.profile.service_area ?? canonicalServiceArea);
      setMessage("Business info saved.");
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not save your business info."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="business_company_name">Company name</Label>
        <Input
          id="business_company_name"
          value={companyName}
          onChange={(event) => setCompanyName(event.target.value)}
          placeholder="Your company"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="business_contact_name">Your name</Label>
        <Input
          id="business_contact_name"
          value={contactName}
          onChange={(event) => setContactName(event.target.value)}
          placeholder="How homeowners should address you"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="business_service_area">Service area</Label>
        <ServiceAreaCombobox
          id="business_service_area"
          value={serviceArea}
          onChange={setServiceArea}
          required
        />
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {message ? <p className="text-sm text-neutral-700">{message}</p> : null}

      <Button
        type="submit"
        disabled={
          loading ||
          !companyName.trim() ||
          !contactName.trim() ||
          !isKnownServiceArea(serviceArea)
        }
      >
        {loading ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}
