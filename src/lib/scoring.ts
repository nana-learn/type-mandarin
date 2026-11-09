export type TestResult = {
  at: number;
  duration: number;
  level?: string;
  title?: string;
  passageId?: string;
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

const SENTENCE_END = new Set(["。", "！", "？"]);

export function missedSentenceList(target: string, typed: string): string[] {
  const mistakes = mistakesOf(target, typed);
  if (mistakes.length === 0) return [];
  const indexes = new Set(mistakes.map((item) => item.index));
  const chars = charsOf(target);
  const selected: string[] = [];
  let start = 0;

  for (let i = 0; i < chars.length; i += 1) {
    if (!SENTENCE_END.has(chars[i]) && i !== chars.length - 1) continue;
    const end = i + 1;
    let hit = false;
    for (let j = start; j < end; j += 1) {
      if (indexes.has(j)) hit = true;
    }
    if (hit) selected.push(chars.slice(start, end).join("").trim());
    start = end;
  }

  return selected.filter(Boolean);
}

/** Sentences that contain a mismatch. Null when there is nothing shorter to retry. */
export function missedSentences(target: string, typed: string): string | null {
  const text = missedSentenceList(target, typed).join("");
  if (!text || text === target.trim()) return null;
  return text;
}

export type ReviewItem = {
  level: string;
  text: string;
  count: number;
  at: number;
};

export function rememberSentences(
  items: ReviewItem[],
  level: string,
  sentences: string[],
  at: number,
): ReviewItem[] {
  const next = items.map((item) => ({ ...item }));
  for (const sentence of sentences) {
    const text = sentence.trim();
    if (!text) continue;
    const found = next.find((item) => item.level === level && item.text === text);
    if (found) {
      found.count += 1;
      found.at = at;
    } else {
      next.push({ level, text, count: 1, at });
    }
  }
  return next.sort((a, b) => b.count - a.count || b.at - a.at).slice(0, 20);
}

export type LevelStats = {
  runs: number;
  bestCpm: number;
  bestAccuracy: number;
};

export const STATS_KEY = "type-mandarin-stats";

export function noteRun(
  stats: Record<string, LevelStats>,
  level: string,
  cpm: number,
  accuracy: number,
) {
  const prev = stats[level] ?? { runs: 0, bestCpm: 0, bestAccuracy: 0 };
  return {
    ...stats,
    [level]: {
      runs: prev.runs + 1,
      bestCpm: Math.max(prev.bestCpm, cpm),
      bestAccuracy: Math.max(prev.bestAccuracy, accuracy),
    },
  };
}

export function seedStats(stats: Record<string, LevelStats>, history: TestResult[]) {
  if (Object.keys(stats).length > 0) return stats;
  let next = stats;
  for (const item of [...history].reverse()) {
    if (!item.level || item.title?.includes("错句")) continue;
    next = noteRun(next, item.level, item.cpm, item.accuracy);
  }
  return next;
}

export function loadStats(): Record<string, LevelStats> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STATS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, LevelStats>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function saveStats(stats: Record<string, LevelStats>) {
  window.localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export const REVIEW_KEY = "type-mandarin-review";

export function loadReview(): ReviewItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(REVIEW_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ReviewItem[];
    return Array.isArray(parsed) ? parsed.filter((item) => item && typeof item.text === "string").slice(0, 20) : [];
  } catch {
    return [];
  }
}

export function saveReview(items: ReviewItem[]) {
  window.localStorage.setItem(REVIEW_KEY, JSON.stringify(items.slice(0, 20)));
}

export type Streak = {
  count: number;
  lastDay: string;
};

export const STREAK_KEY = "type-mandarin-streak";

export function dayKey(at = Date.now()) {
  const date = new Date(at);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function shiftDay(day: string, delta: number) {
  const [year, month, date] = day.split("-").map(Number);
  return dayKey(new Date(year, month - 1, date + delta).getTime());
}

export function nextStreak(streak: Streak | null, at = Date.now()): Streak {
  const today = dayKey(at);
  if (!streak?.lastDay) return { count: 1, lastDay: today };
  if (streak.lastDay === today) return streak;
  if (streak.lastDay === shiftDay(today, -1)) return { count: streak.count + 1, lastDay: today };
  return { count: 1, lastDay: today };
}

export function streakIsLive(streak: Streak | null, at = Date.now()) {
  if (!streak?.lastDay) return false;
  const today = dayKey(at);
  return streak.lastDay === today || streak.lastDay === shiftDay(today, -1);
}

export function loadStreak(): Streak | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STREAK_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Streak;
    if (!parsed || typeof parsed.count !== "number" || typeof parsed.lastDay !== "string") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveStreak(streak: Streak) {
  window.localStorage.setItem(STREAK_KEY, JSON.stringify(streak));
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
