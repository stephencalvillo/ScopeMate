export const DIMENSION_CUSTOM_LABEL = "I have the dimensions";

const EXACT_PREFIX = "exact:";

export function isExactDimensionAnswer(answer: string) {
  return answer.startsWith(EXACT_PREFIX);
}

export function parseExactDimensionAnswer(answer: string) {
  if (!isExactDimensionAnswer(answer)) return null;

  const [lengthRaw, widthRaw] = answer.slice(EXACT_PREFIX.length).split("x");
  const lengthFt = Number(lengthRaw);
  const widthFt = Number(widthRaw);

  if (
    !Number.isFinite(lengthFt) ||
    !Number.isFinite(widthFt) ||
    lengthFt <= 0 ||
    widthFt <= 0
  ) {
    return null;
  }

  return {
    lengthFt,
    widthFt,
    sqFt: Math.round(lengthFt * widthFt),
  };
}

export function formatExactDimensionAnswer(lengthFt: number, widthFt: number) {
  return `${EXACT_PREFIX}${lengthFt}x${widthFt}`;
}

export function formatExactDimensionLabel(answer: string) {
  const parsed = parseExactDimensionAnswer(answer);
  if (!parsed) return answer;

  return `${parsed.sqFt.toLocaleString()} sq ft (${parsed.lengthFt} ft × ${parsed.widthFt} ft)`;
}
