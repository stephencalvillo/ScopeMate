"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TimelineStartChoices } from "@/components/project/timeline-start-choices";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { persistContractorProjectReturn } from "@/lib/contractor/contractor-project-onboarding";

export function ContractorClientProjectForm({
  mode = "marketing",
}: {
  mode?: "marketing" | "portal";
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [targetStart, setTargetStart] = useState<string | null>(null);
  const isPortal = mode === "portal";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const original_description = String(
      formData.get("project_description") ?? ""
    ).trim();
    const zip = String(formData.get("zip") ?? "").trim();

    const response = await fetch(
      isPortal ? "/api/projects/contractor-client" : "/api/projects/guest",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          original_description,
          zip,
          ...(isPortal ? {} : { creator_role: "contractor" }),
          ...(targetStart ? { target_start: targetStart } : {}),
        }),
      }
    );

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      const message =
        typeof data.details === "object" && data.details
          ? Object.values(data.details as Record<string, string[]>)
              .flat()
              .join(" ")
          : null;
      setError(message || data.error || "Could not start this project.");
      return;
    }

    if (!isPortal) {
      persistContractorProjectReturn(data.id);
    }

    router.push(
      isPortal
        ? `/contractor/projects/${data.id}?generate=1`
        : `/projects/${data.id}?generate=1&intent=contractor`
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Textarea
        id="client_project_description"
        name="project_description"
        className="min-h-48 text-base"
        placeholder="For example: My client wants to remodel their kitchen, replace cabinets and countertops, update lighting, and refinish the hardwood floors in the adjoining dining room."
        aria-label="Client project description"
        required
      />

      <TimelineStartChoices
        value={targetStart}
        onChange={setTargetStart}
        label="When does your client want to start?"
      />

      <div className="space-y-2">
        <Label htmlFor="client_zip">Client ZIP code</Label>
        <Input
          id="client_zip"
          name="zip"
          inputMode="numeric"
          autoComplete="postal-code"
          placeholder="e.g. 78701"
          pattern="\d{5}(-\d{4})?"
          maxLength={10}
          required
        />
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <Button type="submit" size="lg" disabled={loading}>
        {loading ? "Building project scope..." : "Build client scope"}
      </Button>
    </form>
  );
}
