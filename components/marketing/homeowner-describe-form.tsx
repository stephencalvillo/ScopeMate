"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TimelineStartChoices } from "@/components/project/timeline-start-choices";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function HomeownerDescribeForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [targetStart, setTargetStart] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const original_description = String(
      formData.get("project_description") ?? ""
    ).trim();
    const zip = String(formData.get("zip") ?? "").trim();

    const response = await fetch("/api/projects/guest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        original_description,
        zip,
        ...(targetStart ? { target_start: targetStart } : {}),
      }),
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      const message =
        typeof data.details === "object" && data.details
          ? Object.values(data.details as Record<string, string[]>)
              .flat()
              .join(" ")
          : null;
      setError(message || data.error || "Could not start your project.");
      return;
    }

    router.push(`/projects/${data.id}?generate=1`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Textarea
        id="project_description"
        name="project_description"
        className="min-h-48 text-base"
        placeholder="For example: We want to replace our aging roof, add a covered patio off the back of the house, and update the exterior paint. The kitchen feels cramped and we would love more counter space."
        aria-label="Project description"
        required
      />

      <TimelineStartChoices value={targetStart} onChange={setTargetStart} />

      <div className="space-y-2">
        <Label htmlFor="zip">ZIP code</Label>
        <Input
          id="zip"
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
        {loading ? "Building your scope..." : "Show me my scope"}
      </Button>
    </form>
  );
}
