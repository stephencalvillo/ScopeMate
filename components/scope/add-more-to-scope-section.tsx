"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function AddMoreToScopeSection({
  onSubmit,
  disabled = false,
}: {
  onSubmit: (notes: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = notes.trim();

    if (!trimmed) {
      setError("Describe what you want to add to your scope.");
      return;
    }

    setError(null);
    onSubmit(trimmed);
    setNotes("");
    setOpen(false);
  }

  if (!open) {
    return (
      <Button
        type="button"
        variant="secondary"
        disabled={disabled}
        onClick={() => setOpen(true)}
      >
        <Sparkles className="h-4 w-4" />
        Add more to scope
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <p className="text-sm font-medium text-neutral-900">
          Add more to your scope
        </p>
        <p className="text-sm text-[var(--muted)]">
          Describe anything new — ScopeBuddy will update your list and summary.
        </p>
      </div>
      <Textarea
        value={notes}
        onChange={(event) => {
          setNotes(event.target.value);
          if (error) setError(null);
        }}
        placeholder="For example: We also want to replace the backsplash tile and add a pantry closet."
        className="min-h-28 text-base"
        disabled={disabled}
        autoFocus
      />

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={disabled || !notes.trim()}>
          Add to scope
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={disabled}
          onClick={() => {
            setOpen(false);
            setNotes("");
            setError(null);
          }}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
