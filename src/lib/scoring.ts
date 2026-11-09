export type TestResult = {
  at: number;
  duration: number;
  level?: string;
  title?: string;
  cpm: number;
  accuracy: number;
  correct: number;
  wrong: number;
  typed: number;
};

export function charsOf(value: string): string[] {
  return Array.from(value);
}

export type Mistake = {
  index: number;
  expected: string;
  actual: string;
};

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

export function mistakesOf(target: string, typed: string): Mistake[] {
  const targetChars = charsOf(target);
  const typedChars = charsOf(typed);
  const mistakes: Mistake[] = [];
  const length = Math.min(targetChars.length, typedChars.length);
  for (let i = 0; i < length; i += 1) {
    if (typedChars[i] !== targetChars[i]) {
      mistakes.push({ index: i, expected: targetChars[i], actual: typedChars[i] });
    }
  }
  return mistakes;
}

/** Keep characters through the first mismatch, so later keystrokes cannot skip an error. */
export function stopAtFirstMistake(expected: string[], typed: string[]) {
  const kept: string[] = [];
  const length = Math.min(expected.length, typed.length);
  for (let i = 0; i < length; i += 1) {
    kept.push(typed[i]);
    if (typed[i] !== expected[i]) break;
  }
  return kept.join("");
}

export function charactersPerMinute(correct: number, elapsedMs: number) {
  if (elapsedMs <= 0) return 0;
  return Math.round((correct * 60000) / elapsedMs);
}

export function formatDuration(ms: number) {
  const total = Math.max(0, Math.round(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
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
