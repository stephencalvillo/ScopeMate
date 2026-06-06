import { ScopeCategoryGroup } from "@/components/scope/scope-category-group";
import { ScopeItemContent } from "@/components/scope/scope-item-content";
import { ScopeItemShell } from "@/components/scope/scope-item-shell";
import { groupScopeItemsByCategory } from "@/lib/scope/group-by-category";
import type { ScopeItem } from "@/types";

function SharedScopeItemRow({ item }: { item: ScopeItem }) {
  return (
    <ScopeItemShell>
      <ScopeItemContent item={item} showAttribution={false} />
    </ScopeItemShell>
  );
}

export function SharedScopeList({ items }: { items: ScopeItem[] }) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-[var(--muted)]">
        This project does not have any scope items yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {groupScopeItemsByCategory(items).map((group) => (
        <ScopeCategoryGroup
          key={group.category}
          category={group.category}
          itemCount={group.items.length}
        >
          {group.items.map((item) => (
            <SharedScopeItemRow key={item.id} item={item} />
          ))}
        </ScopeCategoryGroup>
      ))}
    </div>
  );
}
