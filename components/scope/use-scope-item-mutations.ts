"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import {
  createScopeItemClient,
  deleteScopeItemClient,
  updateScopeItemClient,
} from "@/lib/scope/scope-item-client";
import type { ScopeItem, ScopeItemPriority } from "@/types";

function localCreatedItem(
  projectId: string,
  payload: { category: string; text: string; priority?: ScopeItemPriority }
): ScopeItem {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    project_id: projectId,
    category: payload.category,
    text: payload.text,
    source: "homeowner",
    priority: payload.priority ?? "recommended",
    status: "active",
    sort_order: Date.now(),
    needs_verification: false,
    created_at: now,
    updated_at: now,
  };
}

export function useScopeItemMutations({
  projectId,
  persist = true,
  onCreated,
  onUpdated,
  onRemoved,
  onRestore,
}: {
  projectId: string;
  persist?: boolean;
  onCreated?: (item: ScopeItem) => void;
  onUpdated: (item: ScopeItem) => void;
  onRemoved: (itemId: string) => void;
  onRestore: (item: ScopeItem) => void;
}) {
  const { getToken, isSignedIn } = useAuth();
  const [saving, setSaving] = useState(false);
  const tokenGetter = isSignedIn ? getToken : undefined;

  async function createItem(payload: {
    category: string;
    text: string;
    priority?: ScopeItemPriority;
  }) {
    const text = payload.text.trim();
    if (!text) return false;

    if (!persist) {
      onCreated?.(localCreatedItem(projectId, { ...payload, text }));
      return true;
    }

    setSaving(true);
    try {
      const created = await createScopeItemClient(
        projectId,
        { ...payload, text },
        tokenGetter
      );
      onCreated?.(created);
      return true;
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Couldn't add that item. Try again."
      );
      return false;
    } finally {
      setSaving(false);
    }
  }

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

  return { createItem, saveItem, removeItem, saving };
}
