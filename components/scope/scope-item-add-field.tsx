"use client";

import { useEffect, useRef, useState } from "react";
import { useScopeItemMutations } from "@/components/scope/use-scope-item-mutations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ScopeItem } from "@/types";

export function ScopeItemAddField({
  projectId,
  category,
  persist = true,
  onCreated,
  onCancel,
}: {
  projectId: string;
  category: string;
  persist?: boolean;
  onCreated: (item: ScopeItem) => void;
  onCancel: () => void;
}) {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { createItem, saving } = useScopeItemMutations({
    projectId,
    persist,
    onCreated,
    onUpdated: () => undefined,
    onRemoved: () => undefined,
    onRestore: () => undefined,
  });

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const saved = await createItem({ category, text });
    if (saved) {
      onCancel();
    }
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="space-y-3">
      <Input
        ref={inputRef}
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Add a line item"
        aria-label="New scope item"
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            onCancel();
          }
        }}
      />
      <div className="flex gap-2">
        <Button size="sm" type="submit" disabled={saving || !text.trim()}>
          {saving ? "Adding..." : "Add item"}
        </Button>
        <Button
          size="sm"
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={saving}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
