function delay(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export async function waitForClerkSession(
  getToken: () => Promise<string | null>,
  options?: { maxAttempts?: number; delayMs?: number }
): Promise<string | null> {
  const maxAttempts = options?.maxAttempts ?? 12;
  const delayMs = options?.delayMs ?? 250;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const token = await getToken();
    if (token) {
      return token;
    }

    if (attempt < maxAttempts - 1) {
      await delay(delayMs);
    }
  }

  return null;
}
