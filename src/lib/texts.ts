import { findIn, neighborIn, pickRandom, positionIn } from "./pool";
import { LEVELS, type Level, type Passage } from "./types";

export { LEVELS, LEVEL_LABELS, type Level, type Passage } from "./types";

const loaders: Record<Level, () => Promise<Passage[]>> = {
  hsk1: () => import("./passages/hsk1").then((mod) => mod.HSK1),
  hsk2: () => import("./passages/hsk2").then((mod) => mod.HSK2),
  hsk3: () => import("./passages/hsk3").then((mod) => mod.HSK3),
  hsk4: () => import("./passages/hsk4").then((mod) => mod.HSK4),
  hsk5: () => import("./passages/hsk5").then((mod) => mod.HSK5),
  hsk6: () => import("./passages/hsk6").then((mod) => mod.HSK6),
};

const cache = new Map<Level, Passage[]>();
const pending = new Set<Level>();
const listeners = new Set<() => void>();

function publish() {
  listeners.forEach((listener) => listener());
}

export function subscribeCatalog(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function levelPassages(level: Level): Passage[] | null {
  return cache.get(level) ?? null;
}

export function requestLevel(level: Level) {
  if (cache.has(level) || pending.has(level)) return;
  pending.add(level);
  loaders[level]()
    .then((list) => {
      cache.set(level, list.map((item) => ({ ...item, text: item.text.trim() })));
    })
    .catch(() => {
      cache.set(level, []);
    })
    .finally(() => {
      pending.delete(level);
      publish();
    });
}

export function isLevel(value: string | null | undefined): value is Level {
  return value !== null && value !== undefined && (LEVELS as readonly string[]).includes(value);
}

export { findIn, neighborIn, pickRandom, positionIn };

export function passagesFor(level: Level): Passage[] {
  return levelPassages(level) ?? [];
}

export function findPassage(level: Level, id: string | null | undefined): Passage | undefined {
  return findIn(passagesFor(level), id);
}

export function randomPassage(level: Level, avoidIds: string[] = []): Passage | undefined {
  return pickRandom(passagesFor(level), avoidIds);
}

export function passagePosition(level: Level, id?: string) {
  return positionIn(passagesFor(level), id);
}

export function neighborPassage(level: Level, id: string | undefined, delta: number): Passage | undefined {
  return neighborIn(passagesFor(level), id, delta);
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
