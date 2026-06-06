import type { AiScopeItem } from "@/types";

const VERIFY_SUFFIX =
  /\s*[\(\[]?\s*contractor must verify\s*[\)\]]?\.?\s*$/i;

export function normalizeAiScopeItem(item: AiScopeItem): AiScopeItem {
  return {
    ...item,
    text: item.text.replace(VERIFY_SUFFIX, "").trim(),
  };
}

export function normalizeAiScopeItems(items: AiScopeItem[]): AiScopeItem[] {
  const normalized = items.map(normalizeAiScopeItem);
  return applyVerificationCap(normalized);
}

function applyVerificationCap(items: AiScopeItem[]): AiScopeItem[] {
  const maxVerified = Math.max(1, Math.ceil(items.length / 4));
  let verifiedCount = items.filter((item) => item.needs_verification).length;

  if (verifiedCount <= maxVerified) {
    return items;
  }

  return items.map((item) => {
    if (!item.needs_verification || verifiedCount <= maxVerified) {
      return item;
    }

    if (item.priority === "required") {
      return item;
    }

    verifiedCount -= 1;
    return { ...item, needs_verification: false };
  });
}
