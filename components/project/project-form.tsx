"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HOMEOWNER_SIGNUP_STORAGE_KEY } from "@/components/marketing/homeowner-signup-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ProjectForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prefill, setPrefill] = useState({
    title: "",
    description: "",
  });

  useEffect(() => {
    const raw = sessionStorage.getItem(HOMEOWNER_SIGNUP_STORAGE_KEY);
    if (!raw) return;

    try {
      const data = JSON.parse(raw) as {
        projectType?: string;
        projectDescription?: string;
      };
      setPrefill({
        title: data.projectType ?? "",
        description: data.projectDescription ?? "",
      });
      sessionStorage.removeItem(HOMEOWNER_SIGNUP_STORAGE_KEY);
    } catch {
      sessionStorage.removeItem(HOMEOWNER_SIGNUP_STORAGE_KEY);
    }
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const title = String(formData.get("title") ?? "").trim();
    const payload = {
      title: title || undefined,
      location: String(formData.get("location") ?? ""),
      original_description: String(formData.get("original_description") ?? ""),
    };

    const response = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
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
      setError(message || data.error || "Could not create project.");
      return;
    }

    router.push(`/projects/${data.id}?generate=1`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-3">
        <Textarea
          id="original_description"
          name="original_description"
          className="min-h-48 text-base"
          placeholder="For example: We want to replace our aging roof, add a covered patio off the back of the house, and update the exterior paint. The kitchen feels cramped and we would love more counter space."
          aria-label="Project description"
          defaultValue={prefill.description}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Project name (optional)</Label>
        <Input
          id="title"
          name="title"
          placeholder="We will suggest one if you leave this blank"
          defaultValue={prefill.title}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Where is the project?</Label>
        <Input
          id="location"
          name="location"
          placeholder="ZIP code or city, e.g. 78701 or Austin, TX"
          required
        />
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <Button type="submit" size="lg" disabled={loading}>
        {loading ? "Creating..." : "Continue"}
      </Button>
    </form>
  );
}
