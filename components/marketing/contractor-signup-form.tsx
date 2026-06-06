"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { tradeTypes } from "@/lib/marketing/copy";

const STORAGE_KEY = "scopemate-contractor-signup";

export function ContractorSignupForm() {
  const router = useRouter();
  const [tradeType, setTradeType] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const data = {
      companyName: String(formData.get("company_name") ?? "").trim(),
      contactName: String(formData.get("contact_name") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      phone: String(formData.get("phone") ?? "").trim(),
      licenseNumber: String(formData.get("license_number") ?? "").trim(),
      serviceArea: String(formData.get("service_area") ?? "").trim(),
      tradeType,
      website: String(formData.get("website") ?? "").trim(),
      yearsInBusiness: String(formData.get("years_in_business") ?? "").trim(),
      insuranceInfo: String(formData.get("insurance_info") ?? "").trim(),
      portfolioNotes: String(formData.get("portfolio_notes") ?? "").trim(),
      yelpUrl: String(formData.get("yelp_url") ?? "").trim(),
      googleUrl: String(formData.get("google_url") ?? "").trim(),
    };

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    router.push("/sign-up?redirect_url=/projects");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <fieldset className="space-y-6">
        <legend className="font-display text-lg text-neutral-900">
          Company details
        </legend>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="company_name">Company name</Label>
            <Input
              id="company_name"
              name="company_name"
              placeholder="Your company name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact_name">Contact name</Label>
            <Input
              id="contact_name"
              name="contact_name"
              placeholder="Primary contact"
              required
            />
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="contact@company.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="(555) 123-4567"
              required
            />
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="license_number">License number</Label>
            <Input
              id="license_number"
              name="license_number"
              placeholder="State license #"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="years_in_business">Years in business</Label>
            <Input
              id="years_in_business"
              name="years_in_business"
              type="number"
              min="0"
              placeholder="e.g. 10"
              required
            />
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="service_area">Service area</Label>
            <Input
              id="service_area"
              name="service_area"
              placeholder="Cities or ZIP codes you serve"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="trade_type">Trade type</Label>
            <Select value={tradeType} onValueChange={setTradeType} required>
              <SelectTrigger id="trade_type">
                <SelectValue placeholder="Select your trade" />
              </SelectTrigger>
              <SelectContent>
                {tradeTypes.map((trade) => (
                  <SelectItem key={trade} value={trade}>
                    {trade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              name="website"
              type="url"
              placeholder="https://yourcompany.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company_logo">Company logo</Label>
            <Input
              id="company_logo"
              name="company_logo"
              type="file"
              accept="image/*"
              className="h-auto py-2.5 file:mr-3 file:rounded-[4px] file:border-0 file:bg-neutral-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-neutral-700"
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-6 border-t border-[var(--border)] pt-8">
        <legend className="font-display text-lg text-neutral-900">
          Optional details
        </legend>

        <div className="space-y-2">
          <Label htmlFor="insurance_info">Insurance info</Label>
          <Textarea
            id="insurance_info"
            name="insurance_info"
            placeholder="Carrier, policy type, coverage limits (optional)"
            className="min-h-24"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="portfolio_notes">Portfolio photos</Label>
          <Input
            id="portfolio_photos"
            name="portfolio_photos"
            type="file"
            accept="image/*"
            multiple
            className="h-auto py-2.5 file:mr-3 file:rounded-[4px] file:border-0 file:bg-neutral-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-neutral-700"
          />
          <Textarea
            id="portfolio_notes"
            name="portfolio_notes"
            placeholder="Brief notes about featured projects (optional)"
            className="min-h-20"
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="yelp_url">Yelp profile</Label>
            <Input
              id="yelp_url"
              name="yelp_url"
              type="url"
              placeholder="https://yelp.com/biz/..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="google_url">Google profile</Label>
            <Input
              id="google_url"
              name="google_url"
              type="url"
              placeholder="https://g.page/..."
            />
          </div>
        </div>
      </fieldset>

      <Button type="submit" size="lg" disabled={loading || !tradeType}>
        {loading ? "Continuing..." : "Continue to create account"}
      </Button>
    </form>
  );
}

export { STORAGE_KEY as CONTRACTOR_SIGNUP_STORAGE_KEY };
