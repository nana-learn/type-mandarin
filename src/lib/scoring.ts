export type TestResult = {
  at: number;
  duration: number;
  cpm: number;
  accuracy: number;
  correct: number;
  wrong: number;
  typed: number;
};

export function charsOf(value: string): string[] {
  return Array.from(value);
}

export function scoreTyped(target: string, typed: string) {
  const targetChars = charsOf(target);
  const typedChars = charsOf(typed);
  let correct = 0;
  let wrong = 0;

  for (let i = 0; i < typedChars.length; i += 1) {
    if (typedChars[i] === targetChars[i]) correct += 1;
    else wrong += 1;
  }

  const typedCount = typedChars.length;
  const accuracy = typedCount === 0 ? 100 : (correct / typedCount) * 100;
  return { correct, wrong, typed: typedCount, accuracy };
}

export function charactersPerMinute(correct: number, elapsedMs: number) {
  if (elapsedMs <= 0) return 0;
  return Math.round((correct * 60000) / elapsedMs);
}

export const HISTORY_KEY = "type-mandarin-history";

export function loadHistory(): TestResult[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as TestResult[];
    return Array.isArray(parsed) ? parsed.slice(0, 10) : [];
  } catch {
    return [];
  }
}

export function saveHistory(results: TestResult[]) {
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(results.slice(0, 10)));
}
