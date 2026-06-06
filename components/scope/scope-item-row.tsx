"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { ScopeItemContent } from "@/components/scope/scope-item-content";
import { ScopeItemShell } from "@/components/scope/scope-item-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ScopeItem, ScopeItemPriority } from "@/types";

export function ScopeItemRow({
  item,
  projectId,
  onUpdated,
  onRemoved,
}: {
  item: ScopeItem;
  projectId: string;
  onUpdated: (item: ScopeItem) => void;
  onRemoved: (itemId: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(item.text);
  const [priority, setPriority] = useState<ScopeItemPriority>(item.priority);
  const [saving, setSaving] = useState(false);

  async function saveChanges() {
    setSaving(true);
    const response = await fetch(
      `/api/projects/${projectId}/scope-items/${item.id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, priority }),
      }
    );
    const data = await response.json();
    setSaving(false);

    if (response.ok) {
      onUpdated(data);
      setEditing(false);
    }
  }

  async function removeItem() {
    const response = await fetch(
      `/api/projects/${projectId}/scope-items/${item.id}`,
      { method: "DELETE" }
    );

    if (response.ok) {
      onRemoved(item.id);
    }
  }

  return (
    <ScopeItemShell interactive={!editing}>
      {editing ? (
        <div className="space-y-3">
          <Input value={text} onChange={(event) => setText(event.target.value)} />
          <Select
            value={priority}
            onValueChange={(value) => setPriority(value as ScopeItemPriority)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="required">Required</SelectItem>
              <SelectItem value="recommended">Recommended</SelectItem>
              <SelectItem value="optional">Optional</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button size="sm" onClick={saveChanges} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setText(item.text);
                setPriority(item.priority);
                setEditing(false);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <ScopeItemContent
          item={item}
          actions={
            <>
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
                onClick={() => setEditing(true)}
                aria-label="Edit scope item"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
                onClick={removeItem}
                aria-label="Remove scope item"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          }
        />
      )}
    </ScopeItemShell>
  );
}
