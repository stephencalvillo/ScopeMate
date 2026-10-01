"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { IconActionButton } from "@/components/review/icon-action-button";
import { ScopeItemContent } from "@/components/scope/scope-item-content";
import { ScopeItemShell } from "@/components/scope/scope-item-shell";
import { useScopeItemMutations } from "@/components/scope/use-scope-item-mutations";
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
  persist = true,
  onUpdated,
  onRemoved,
  onRestore,
}: {
  item: ScopeItem;
  projectId: string;
  persist?: boolean;
  onUpdated: (item: ScopeItem) => void;
  onRemoved: (itemId: string) => void;
  onRestore: (item: ScopeItem) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(item.text);
  const [priority, setPriority] = useState<ScopeItemPriority>(item.priority);
  const { saveItem, removeItem, saving } = useScopeItemMutations({
    projectId,
    persist,
    onUpdated,
    onRemoved,
    onRestore,
  });

  async function saveChanges() {
    const saved = await saveItem(item, { text, priority });
    if (saved) {
      setEditing(false);
    }
  }

  return (
    <ScopeItemShell interactive={!editing} className={editing ? undefined : "pl-0"}>
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
            <Button size="sm" onClick={() => void saveChanges()} disabled={saving}>
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
          showBullet
          actions={
            <>
              <IconActionButton label="Edit" onClick={() => setEditing(true)}>
                <Pencil className="h-4 w-4" />
              </IconActionButton>
              <IconActionButton
                label="Remove"
                onClick={() => void removeItem(item)}
              >
                <Trash2 className="h-4 w-4" />
              </IconActionButton>
            </>
          }
        />
      )}
    </ScopeItemShell>
  );
}
