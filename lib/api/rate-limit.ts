const generationCounts = new Map<string, { count: number; resetAt: number }>();

export function checkScopeGenerationLimit(userId: string): boolean {
  const limit = Number(process.env.RATE_LIMIT_SCOPE_GENERATION ?? 10);
  const now = Date.now();
  const hourMs = 60 * 60 * 1000;
  const entry = generationCounts.get(userId);

  if (!entry || entry.resetAt <= now) {
    generationCounts.set(userId, { count: 1, resetAt: now + hourMs });
    return true;
  }

  if (entry.count >= limit) {
    return false;
  }

  entry.count += 1;
  return true;
}
