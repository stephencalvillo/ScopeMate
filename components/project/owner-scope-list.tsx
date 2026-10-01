"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { IconActionButton } from "@/components/review/icon-action-button";
import { ScopeItemAddField } from "@/components/scope/scope-item-add-field";
import {
  ScopeItemBullet,
  ScopeListTextIndent,
} from "@/components/scope/scope-item-content";
import { useScopeItemMutations } from "@/components/scope/use-scope-item-mutations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScopeCategoryGroup } from "@/components/scope/scope-category-group";
import type { ScopeCategoryGroup as ScopeCategoryGroupData } from "@/lib/scope/group-by-category";
import type { ScopeItem } from "@/types";

function QuietScopeItem({
  item,
  projectId,
  persist,
  onUpdated,
  onRemoved,
  onRestore,
}: {
  item: ScopeItem;
  projectId: string;
  persist: boolean;
  onUpdated: (item: ScopeItem) => void;
  onRemoved: (itemId: string) => void;
  onRestore: (item: ScopeItem) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(item.text);
  const { saveItem, removeItem, saving } = useScopeItemMutations({
    projectId,
    persist,
    onUpdated,
    onRemoved,
    onRestore,
  });

  async function saveChanges() {
    const saved = await saveItem(item, { text, priority: item.priority });
    if (saved) {
      setEditing(false);
    }
  }

  if (editing) {
    return (
      <div className="space-y-3">
        <Input value={text} onChange={(event) => setText(event.target.value)} />
        <div className="flex gap-2">
          <Button size="sm" onClick={() => void saveChanges()} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setText(item.text);
              setEditing(false);
            }}
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="group flex items-start gap-3">
      <div className="flex min-w-0 flex-1 items-start gap-2">
        <ScopeItemBullet />
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-sm leading-6 text-neutral-900">{item.text}</p>
          {item.needs_verification ? (
            <p className="text-sm text-[var(--muted)]">Contractor must verify</p>
          ) : null}
        </div>
      </div>
      <div className="flex shrink-0 items-center">
        <IconActionButton label="Edit" onClick={() => setEditing(true)}>
          <Pencil className="h-4 w-4" />
        </IconActionButton>
        <IconActionButton label="Remove" onClick={() => void removeItem(item)}>
          <Trash2 className="h-4 w-4" />
        </IconActionButton>
      </div>
    </div>
  );
}

export function OwnerScopeList({
  projectId,
  groups,
  persist = true,
  onCreated,
  onUpdated,
  onRemoved,
  onRestore,
}: {
  projectId: string;
  groups: ScopeCategoryGroupData[];
  persist?: boolean;
  onCreated: (item: ScopeItem) => void;
  onUpdated: (item: ScopeItem) => void;
  onRemoved: (itemId: string) => void;
  onRestore: (item: ScopeItem) => void;
}) {
  const [addingCategory, setAddingCategory] = useState<string | null>(null);

  return (
    <section className="space-y-3">
      <h2 className="font-display text-lg text-neutral-900">Scope list</h2>

      {groups.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">No scope items yet.</p>
      ) : (
        <div className="space-y-3">
          {groups.map((group) => (
            <ScopeCategoryGroup
              key={group.category}
              category={group.category}
              itemCount={group.items.length}
              onAddItem={() => setAddingCategory(group.category)}
            >
              {group.items.map((item) => (
                <QuietScopeItem
                  key={item.id}
                  item={item}
                  projectId={projectId}
                  persist={persist}
                  onUpdated={onUpdated}
                  onRemoved={onRemoved}
                  onRestore={onRestore}
                />
              ))}
              {addingCategory === group.category ? (
                <ScopeListTextIndent>
                  <ScopeItemAddField
                    projectId={projectId}
                    category={group.category}
                    persist={persist}
                    onCreated={onCreated}
                    onCancel={() => setAddingCategory(null)}
                  />
                </ScopeListTextIndent>
              ) : null}
            </ScopeCategoryGroup>
          ))}
        </div>
      )}
    </section>
  );
}
