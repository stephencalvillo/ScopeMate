"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ProjectTitleEditor({
  projectId,
  title,
  canEdit,
}: {
  projectId: string;
  title: string;
  canEdit: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(title);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setValue(title);
  }, [title]);

  async function save(nextValue = value) {
    const trimmed = nextValue.trim();

    if (!trimmed) {
      setError("Project name cannot be empty.");
      setValue(title);
      setEditing(false);
      return;
    }

    if (trimmed === title) {
      setEditing(false);
      setError(null);
      return;
    }

    setSaving(true);
    setError(null);

    const response = await fetch(`/api/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: trimmed }),
    });

    setSaving(false);

    if (!response.ok) {
      const data = await response.json();
      setError(data.error ?? "Could not update project name.");
      return;
    }

    setEditing(false);
    router.refresh();
  }

  function cancel() {
    setValue(title);
    setError(null);
    setEditing(false);
  }

  if (!canEdit) {
    return (
      <h1 className="font-display text-4xl tracking-tight text-neutral-900">
        {title}
      </h1>
    );
  }

  if (editing) {
    return (
      <div className="space-y-2">
        <Input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onBlur={() => void save()}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void save();
            }
            if (event.key === "Escape") {
              event.preventDefault();
              cancel();
            }
          }}
          disabled={saving}
          autoFocus
          aria-label="Project name"
          className="h-auto border-none bg-transparent px-0 font-display text-4xl tracking-tight text-neutral-900 shadow-none focus-visible:ring-0"
        />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="font-display text-4xl tracking-tight text-neutral-900">
          {title}
        </h1>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-[var(--muted)]"
          onClick={() => setEditing(true)}
          aria-label="Edit project name"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
