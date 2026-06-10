"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authenticatedFetch } from "@/lib/auth/authenticated-fetch-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { DeleteUsersResult } from "@/lib/admin/delete-users";
import type { AdminAccountType, AdminUserRow } from "@/lib/admin/stats";
import { cn } from "@/lib/utils";

function accountTypeLabel(type: AdminAccountType) {
  switch (type) {
    case "both":
      return "Homeowner + Contractor";
    case "contractor":
      return "Contractor";
    default:
      return "Homeowner";
  }
}

function accountTypeBadgeVariant(type: AdminAccountType) {
  switch (type) {
    case "both":
      return "info" as const;
    case "contractor":
      return "warning" as const;
    default:
      return "secondary" as const;
  }
}

export function AdminUsersTable({
  users,
  currentAdminUserId,
}: {
  users: AdminUserRow[];
  currentAdminUserId: string;
}) {
  const router = useRouter();
  const { getToken } = useAuth();
  const [, startTransition] = useTransition();
  const selectAllRef = useRef<HTMLInputElement>(null);
  const lastSelectedIndexRef = useRef<number | null>(null);
  const [visibleUsers, setVisibleUsers] = useState(users);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setVisibleUsers(users);
  }, [users]);

  const selectableUsers = useMemo(
    () => visibleUsers.filter((user) => user.id !== currentAdminUserId),
    [currentAdminUserId, visibleUsers]
  );

  const selectedUsers = useMemo(
    () => visibleUsers.filter((user) => selectedIds.includes(user.id)),
    [selectedIds, visibleUsers]
  );

  const allSelected =
    selectableUsers.length > 0 &&
    selectableUsers.every((user) => selectedIds.includes(user.id));

  const someSelected = selectedIds.length > 0 && !allSelected;

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  function setSelection(nextIds: string[]) {
    const uniqueIds = [...new Set(nextIds)];
    setSelectedIds(uniqueIds);
  }

  function toggleUser(userId: string, checked: boolean) {
    setSelectedIds((current) =>
      checked
        ? current.includes(userId)
          ? current
          : [...current, userId]
        : current.filter((id) => id !== userId)
    );
  }

  function toggleAll(checked: boolean) {
    setSelection(checked ? selectableUsers.map((user) => user.id) : []);
    lastSelectedIndexRef.current = null;
  }

  function handleRowSelect(
    index: number,
    userId: string,
    checked: boolean,
    shiftKey: boolean
  ) {
    if (shiftKey && lastSelectedIndexRef.current !== null) {
      const start = Math.min(lastSelectedIndexRef.current, index);
      const end = Math.max(lastSelectedIndexRef.current, index);
      const rangeIds = visibleUsers
        .slice(start, end + 1)
        .filter((user) => user.id !== currentAdminUserId)
        .map((user) => user.id);

      setSelection([...selectedIds, ...rangeIds]);
      return;
    }

    toggleUser(userId, checked);
    lastSelectedIndexRef.current = index;
  }

  function clearSelection() {
    setSelectedIds([]);
    lastSelectedIndexRef.current = null;
  }

  async function handleDelete() {
    setIsDeleting(true);

    try {
      const response = await authenticatedFetch(getToken, "/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIds: selectedIds }),
      });

      const payload = (await response.json()) as DeleteUsersResult & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to delete users.");
      }

      const result = payload;
      const deletedCount = result.deleted.length;
      const failedCount = result.failed.length;

      if (deletedCount > 0) {
        setVisibleUsers((current) =>
          current.filter((user) => !result.deleted.includes(user.id))
        );
        toast.success(
          deletedCount === 1
            ? "Deleted 1 user from Clerk and Supabase."
            : `Deleted ${deletedCount} users from Clerk and Supabase.`
        );
      }

      if (failedCount > 0) {
        toast.error(
          failedCount === 1
            ? "1 user could not be deleted."
            : `${failedCount} users could not be deleted.`
        );
      }

      clearSelection();
      setConfirmOpen(false);
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : typeof error === "object" &&
              error !== null &&
              "message" in error &&
              typeof error.message === "string"
            ? error.message
            : "Failed to delete users.";
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  }

  const deleteLabel =
    selectedIds.length === 1 ? "Delete user" : `Delete ${selectedIds.length} users`;

  return (
    <>
      <Card className={cn(selectedIds.length > 0 && "mb-24")}>
        <CardContent className="overflow-x-auto pt-[var(--card-padding)]">
          <p className="mb-3 text-xs text-[var(--muted)]">
            Select multiple users with checkboxes, row clicks, or shift-click.
          </p>
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--muted)]">
                <th className="w-10 px-3 py-3">
                  <label className="sr-only" htmlFor="select-all-users">
                    Select all users
                  </label>
                  <input
                    ref={selectAllRef}
                    id="select-all-users"
                    type="checkbox"
                    checked={allSelected}
                    onChange={(event) => toggleAll(event.target.checked)}
                    disabled={selectableUsers.length === 0}
                    className="h-4 w-4 rounded border-[var(--border)] accent-neutral-900"
                  />
                </th>
                <th className="px-3 py-3 font-medium">Name</th>
                <th className="px-3 py-3 font-medium">Email</th>
                <th className="px-3 py-3 font-medium">Account type</th>
                <th className="px-3 py-3 font-medium">Projects</th>
                <th className="px-3 py-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {visibleUsers.map((user, index) => {
                const isCurrentAdmin = user.id === currentAdminUserId;
                const isSelected = selectedIds.includes(user.id);

                return (
                  <tr
                    key={user.id}
                    onClick={(event) => {
                      if (isCurrentAdmin) return;
                      if (
                        event.target instanceof HTMLElement &&
                        event.target.closest("input[type='checkbox']")
                      ) {
                        return;
                      }

                      handleRowSelect(
                        index,
                        user.id,
                        !isSelected,
                        event.shiftKey
                      );
                    }}
                    className={cn(
                      "border-b border-[var(--border)] last:border-b-0",
                      isSelected && "bg-neutral-50",
                      !isCurrentAdmin && "cursor-pointer hover:bg-neutral-50/80"
                    )}
                  >
                    <td className="px-3 py-3">
                      <label className="sr-only" htmlFor={`select-${user.id}`}>
                        Select {user.email}
                      </label>
                      <input
                        id={`select-${user.id}`}
                        type="checkbox"
                        checked={isSelected}
                        disabled={isCurrentAdmin}
                        onClick={(event) => event.stopPropagation()}
                        onChange={(event) =>
                          handleRowSelect(
                            index,
                            user.id,
                            event.target.checked,
                            (event.nativeEvent as MouseEvent).shiftKey
                          )
                        }
                        className="h-4 w-4 rounded border-[var(--border)] accent-neutral-900 disabled:cursor-not-allowed disabled:opacity-40"
                      />
                    </td>
                    <td className="px-3 py-3 text-neutral-900">
                      {user.name || "—"}
                      {isCurrentAdmin ? (
                        <span className="ml-2 text-xs text-[var(--muted)]">
                          (you)
                        </span>
                      ) : null}
                    </td>
                    <td className="px-3 py-3 text-neutral-700">{user.email}</td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant={accountTypeBadgeVariant(user.accountType)}
                        >
                          {accountTypeLabel(user.accountType)}
                        </Badge>
                        {user.accountType !== "homeowner" ? (
                          <Badge
                            variant={
                              user.contractorOnboarded ? "success" : "pending"
                            }
                          >
                            {user.contractorOnboarded
                              ? "Onboarded"
                              : "Setup incomplete"}
                          </Badge>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-neutral-700">
                      {user.projectCount}
                    </td>
                    <td className="px-3 py-3 text-neutral-700">
                      {user.joinedAt}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {selectedIds.length > 0 ? (
        <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-[var(--page-padding-x)] pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="flex w-full max-w-3xl flex-wrap items-center justify-between gap-4 rounded-[8px] border border-neutral-800 bg-neutral-900 px-4 py-3 text-white shadow-lg">
            <p className="text-sm">
              {selectedIds.length}{" "}
              {selectedIds.length === 1 ? "user" : "users"} selected
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="border-transparent text-white hover:bg-white/10 hover:text-white"
                onClick={clearSelection}
              >
                Clear selection
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => setConfirmOpen(true)}
              >
                {deleteLabel}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{deleteLabel}?</DialogTitle>
            <DialogDescription>
              This permanently removes the selected accounts from Clerk and
              Supabase, including their projects and contractor data.
            </DialogDescription>
          </DialogHeader>

          <ul className="max-h-48 space-y-2 overflow-y-auto rounded-[8px] border border-[var(--border)] p-3 text-sm">
            {selectedUsers.map((user) => (
              <li key={user.id} className="text-neutral-700">
                <span className="font-medium text-neutral-900">
                  {user.name || user.email}
                </span>
                {user.name ? (
                  <span className="text-[var(--muted)]"> · {user.email}</span>
                ) : null}
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-wrap justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting…" : deleteLabel}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
