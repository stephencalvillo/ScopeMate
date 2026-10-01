"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import {
  deleteScopeItemClient,
  updateScopeItemClient,
} from "@/lib/scope/scope-item-client";
import type { ScopeItem, ScopeItemPriority } from "@/types";

export function useScopeItemMutations({
  projectId,
  persist = true,
  onUpdated,
  onRemoved,
  onRestore,
}: {
  projectId: string;
  persist?: boolean;
  onUpdated: (item: ScopeItem) => void;
  onRemoved: (itemId: string) => void;
  onRestore: (item: ScopeItem) => void;
}) {
  const { getToken, isSignedIn } = useAuth();
  const [saving, setSaving] = useState(false);
  const tokenGetter = isSignedIn ? getToken : undefined;

  async function saveItem(
    item: ScopeItem,
    payload: { text: string; priority: ScopeItemPriority }
  ) {
    if (!persist) {
      onUpdated({
        ...item,
        ...payload,
        source: "homeowner",
        updated_at: new Date().toISOString(),
      });
      return true;
    }

    setSaving(true);
    try {
      const updated = await updateScopeItemClient(
        projectId,
        item.id,
        payload,
        tokenGetter
      );
      onUpdated(updated);
      return true;
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Couldn't save that change. Try again."
      );
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function removeItem(item: ScopeItem) {
    onRemoved(item.id);
    if (!persist) return;

    try {
      await deleteScopeItemClient(projectId, item.id, tokenGetter);
    } catch (error) {
      onRestore(item);
      toast.error(
        error instanceof Error
          ? error.message
          : "Couldn't remove that item. Try again."
      );
    }
  }

  return { saveItem, removeItem, saving };
}
