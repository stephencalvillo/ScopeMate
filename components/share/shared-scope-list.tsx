import { ScopeCategoryGroup } from "@/components/scope/scope-category-group";
import { VerificationBadge } from "@/components/scope/verification-badge";
import { groupScopeItemsByCategory } from "@/lib/scope/group-by-category";
import type { ScopeItem } from "@/types";

function SharedScopeItemRow({ item }: { item: ScopeItem }) {
  return (
    <div className="py-3">
      <p className="text-sm font-medium leading-7 text-neutral-900">
        {item.text}
      </p>
      {item.needs_verification ? <VerificationBadge /> : null}
    </div>
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
        <ScopeCategoryGroup key={group.category} category={group.category}>
          {group.items.map((item) => (
            <SharedScopeItemRow key={item.id} item={item} />
          ))}
        </ScopeCategoryGroup>
      ))}
    </div>
  );
}
