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

export function randomPassage(level: Level): Passage {
  const pool = passagesFor(level);
  return pool[Math.floor(Math.random() * pool.length)] ?? PASSAGES[0];
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

export function writeLevelToUrl(level: Level) {
  const url = new URL(window.location.href);
  url.searchParams.set("level", level);
  window.history.replaceState(null, "", url);
}
