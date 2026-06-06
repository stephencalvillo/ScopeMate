export type DimensionOption = "small" | "medium" | "large" | "not_sure";

type DimensionLabelSet = Record<DimensionOption, string>;

const DEFAULT_LABELS: DimensionLabelSet = {
  small: "Small (~10-50 sq ft)",
  medium: "Medium (~50-150 sq ft)",
  large: "Large (~150+ sq ft)",
  not_sure: "Not sure",
};

const LABELS_BY_PROJECT: Record<string, DimensionLabelSet> = {
  kitchen: {
    small: "Small (~50-100 sq ft)",
    medium: "Medium (~100-200 sq ft)",
    large: "Large (~200+ sq ft)",
    not_sure: "Not sure",
  },
  bathroom: {
    small: "Small (~15-40 sq ft)",
    medium: "Medium (~40-80 sq ft)",
    large: "Large (~80+ sq ft)",
    not_sure: "Not sure",
  },
  deck: {
    small: "Small (~100-200 sq ft)",
    medium: "Medium (~200-400 sq ft)",
    large: "Large (~400+ sq ft)",
    not_sure: "Not sure",
  },
  patio: {
    small: "Small (~100-200 sq ft)",
    medium: "Medium (~200-400 sq ft)",
    large: "Large (~400+ sq ft)",
    not_sure: "Not sure",
  },
  roof: {
    small: "Small (~500-1,000 sq ft)",
    medium: "Medium (~1,000-2,000 sq ft)",
    large: "Large (~2,000+ sq ft)",
    not_sure: "Not sure",
  },
  fence: {
    small: "Small (~50-100 linear ft)",
    medium: "Medium (~100-200 linear ft)",
    large: "Large (~200+ linear ft)",
    not_sure: "Not sure",
  },
};

function resolveProjectKey(projectType?: string): string | null {
  if (!projectType) return null;

  const normalized = projectType.trim().toLowerCase();
  if (LABELS_BY_PROJECT[normalized]) return normalized;

  for (const key of Object.keys(LABELS_BY_PROJECT)) {
    if (normalized.includes(key)) return key;
  }

  return null;
}

export function getDimensionLabels(projectType?: string): DimensionLabelSet {
  const key = resolveProjectKey(projectType);
  return key ? LABELS_BY_PROJECT[key] : DEFAULT_LABELS;
}

export function formatDimensionAnswer(
  answer: string,
  projectType?: string
): string {
  const labels = getDimensionLabels(projectType);
  return labels[answer as DimensionOption] ?? answer;
}

export const DIMENSION_OPTIONS: DimensionOption[] = [
  "small",
  "medium",
  "large",
  "not_sure",
];
