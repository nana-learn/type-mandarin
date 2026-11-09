import { HSK1 } from "./passages/hsk1";
import { HSK2 } from "./passages/hsk2";
import { HSK3 } from "./passages/hsk3";
import { HSK4 } from "./passages/hsk4";
import { HSK5 } from "./passages/hsk5";
import { HSK6 } from "./passages/hsk6";
import { LEVELS, type Level, type Passage } from "./types";

export { LEVELS, LEVEL_LABELS, type Level, type Passage } from "./types";

export const PASSAGES: Passage[] = [
  ...HSK1,
  ...HSK2,
  ...HSK3,
  ...HSK4,
  ...HSK5,
  ...HSK6,
];

export function isLevel(value: string | null | undefined): value is Level {
  return value !== null && value !== undefined && (LEVELS as readonly string[]).includes(value);
}

export function passagesFor(level: Level): Passage[] {
  return PASSAGES.filter((passage) => passage.level === level);
}

export function findPassage(level: Level, id: string | null | undefined): Passage | undefined {
  if (!id) return undefined;
  const found = passagesFor(level).find((item) => item.id === id);
  return found ? { ...found, text: found.text.trim() } : undefined;
}

export function randomPassage(level: Level, avoidIds: string[] = []): Passage {
  const pool = passagesFor(level);
  const blocked = new Set(avoidIds);
  const choices = pool.filter((item) => !blocked.has(item.id));
  const source = choices.length > 0 ? choices : pool;
  const picked = source[Math.floor(Math.random() * source.length)] ?? PASSAGES[0];
  return { ...picked, text: picked.text.trim() };
}

export function randomPrompt(level: Level): string {
  return randomPassage(level).text.trim();
}

export function nextPassage(level: Level): string {
  return randomPrompt(level);
}

export function readLevelFromUrl(): Level {
  const params = new URLSearchParams(window.location.search);
  return isLevel(params.get("level")) ? params.get("level") as Level : "hsk1";
}

export function readPassageIdFromUrl() {
  return new URLSearchParams(window.location.search).get("id");
}

export function writePracticeToUrl(level: Level, id?: string) {
  const url = new URL(window.location.href);
  url.searchParams.set("level", level);
  if (id) url.searchParams.set("id", id);
  else url.searchParams.delete("id");
  window.history.replaceState(null, "", url);
}

export function writeLevelToUrl(level: Level) {
  writePracticeToUrl(level);
}
