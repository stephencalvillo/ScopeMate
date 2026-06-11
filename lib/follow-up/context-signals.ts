import type { AiFollowUpQuestion, ScopeItem } from "@/types";

export type FollowUpContextInput = {
  description: string;
  scopeItems: ScopeItem[];
  projectType?: string;
};

export type DetectedRoom = {
  key: string;
  label: string;
};

const ROOM_SIGNALS: Array<{ key: string; label: string; pattern: RegExp }> = [
  { key: "kitchen", label: "kitchen", pattern: /\bkitchens?\b/i },
  { key: "bathroom", label: "bathroom", pattern: /\b(?:bathrooms?|primary bath|master bath)\b/i },
  { key: "bedroom", label: "bedroom", pattern: /\b(?:bedrooms?|primary suite|master suite)\b/i },
  { key: "basement", label: "basement", pattern: /\bbasements?\b/i },
  { key: "garage", label: "garage", pattern: /\bgarages?\b/i },
  { key: "living room", label: "living room", pattern: /\bliving\s+rooms?\b/i },
  { key: "deck", label: "deck", pattern: /\bdecks?\b/i },
  { key: "patio", label: "patio", pattern: /\bpatios?\b/i },
  { key: "laundry", label: "laundry room", pattern: /\blaundry(?:\s+room)?\b/i },
];

const CABINET_PATTERN =
  /\b(?:new\s+)?cabinet(?:ry|s)?\b|\bcabinet\s+refac(?:e|ing)\b|\brefinish(?:ing)?\s+(?:the\s+)?cabinet/i;

const DIMENSION_INFO_PATTERN =
  /\b\d+(?:\.\d+)?\s*(?:x|by)\s*\d+(?:\.\d+)?\s*(?:ft|feet|foot|'|")?\b|\b\d+(?:,\d{3})*(?:\.\d+)?\s*(?:sq\.?\s*ft|square\s*feet)\b|\b\d+(?:,\d{3})*(?:\.\d+)?\s*(?:linear\s*)?ft\b|\b(?:length|width|dimensions?)\s*(?:is|are|of)?\s*\d+/i;

const CABINET_QUANTITY_PATTERN =
  /\b\d+\s*(?:cabinet|door|drawer|face)s?\b|\b(?:under|about|around)\s+\d+\s*(?:cabinet|door|drawer|face)/i;

export const CABINET_COUNT_QUESTION =
  "About how many cabinet doors or faces?";

export const CABINET_COUNT_CHOICES = [
  "Under 15",
  "15–30",
  "30+",
  "Not sure",
] as const;

function collectContextText({ description, scopeItems, projectType }: FollowUpContextInput) {
  const scopeText = scopeItems.map((item) => item.text).join("\n");
  return [description, scopeText, projectType ?? ""].filter(Boolean).join("\n");
}

export function hasDimensionInfoInText(text: string): boolean {
  return DIMENSION_INFO_PATTERN.test(text);
}

function roomHasDimensionInfo(text: string, room: DetectedRoom): boolean {
  const dimensionMatch = text.match(DIMENSION_INFO_PATTERN);
  if (!dimensionMatch || dimensionMatch.index === undefined) {
    return false;
  }

  const dimensionIndex = dimensionMatch.index;
  let closestRoomKey: string | null = null;
  let closestDistance = Infinity;

  for (const signal of ROOM_SIGNALS) {
    const regex = new RegExp(`\\b${escapeRegExp(signal.label)}\\b`, "gi");
    let match = regex.exec(text);

    while (match) {
      const distance = Math.abs(match.index - dimensionIndex);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestRoomKey = signal.key;
      }
      match = regex.exec(text);
    }
  }

  return closestRoomKey === room.key && closestDistance <= 50;
}

export function hasCabinetQuantityInText(text: string): boolean {
  return CABINET_QUANTITY_PATTERN.test(text);
}

export function detectRoomsInText(text: string): DetectedRoom[] {
  const found: DetectedRoom[] = [];

  for (const signal of ROOM_SIGNALS) {
    if (signal.pattern.test(text)) {
      found.push({ key: signal.key, label: signal.label });
    }
  }

  return found;
}

export function detectRoomsNeedingDimensions(
  input: FollowUpContextInput
): DetectedRoom[] {
  const text = collectContextText(input);
  const rooms = detectRoomsInText(text);

  if (rooms.length === 0) return [];

  const needingDimensions: DetectedRoom[] = [];

  for (const signal of ROOM_SIGNALS) {
    const match = rooms.find((room) => room.key === signal.key);
    if (!match) continue;

    if (!roomHasDimensionInfo(text, match)) {
      needingDimensions.push(match);
    }
  }

  return needingDimensions;
}

export function detectPrimaryRoom(input: FollowUpContextInput): DetectedRoom | null {
  return detectRoomsNeedingDimensions(input)[0] ?? null;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function detectCabinetWork(input: FollowUpContextInput): boolean {
  const text = collectContextText(input);
  if (!CABINET_PATTERN.test(text)) return false;
  return !hasCabinetQuantityInText(text);
}

export function buildRoomDimensionQuestion(room: DetectedRoom): AiFollowUpQuestion {
  return {
    question: `Roughly how big is the ${room.label}?`,
    question_type: "dimension_estimate",
    category: "dimensions",
    choices: ["small", "medium", "large", "not_sure"],
  };
}

export function buildCabinetCountQuestion(): AiFollowUpQuestion {
  return {
    question: CABINET_COUNT_QUESTION,
    question_type: "choice",
    category: "trade_scope",
    choices: [...CABINET_COUNT_CHOICES],
  };
}

export function buildInjectedContextQuestions(
  input: FollowUpContextInput
): AiFollowUpQuestion[] {
  const injected: AiFollowUpQuestion[] = [];

  for (const room of detectRoomsNeedingDimensions(input)) {
    injected.push(buildRoomDimensionQuestion(room));
  }

  if (detectCabinetWork(input)) {
    injected.push(buildCabinetCountQuestion());
  }

  return injected;
}

export function describeInjectedTopics(questions: AiFollowUpQuestion[]): string[] {
  return questions.map((question) => {
    if (question.category === "dimensions") {
      return `Room size (${question.question})`;
    }

    if (question.category === "trade_scope") {
      return "Cabinet door/face count";
    }

    return question.question;
  });
}
