"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { generateScopeClient } from "@/lib/scope/generate-scope-client";
import type { ScopeItem } from "@/types";

export function GenerateScopeButton({
  projectId,
  onGenerated,
  variant = "default",
  label = "Generate scope with AI",
  loadingLabel = "Generating scope...",
  showSparkle = false,
}: {
  projectId: string;
  onGenerated: (payload: {
    ai_summary: string;
    scope_items: ScopeItem[];
  }) => void;
  variant?: ButtonProps["variant"];
  label?: string;
  loadingLabel?: string;
  showSparkle?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);

    try {
      const data = await generateScopeClient(projectId);
      onGenerated(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not generate scope."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button variant={variant} onClick={handleGenerate} disabled={loading}>
        {!loading && showSparkle ? <Sparkles className="h-4 w-4" /> : null}
        {loading ? loadingLabel : label}
      </Button>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
