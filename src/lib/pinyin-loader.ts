const cache = new Map<string, string[]>();
const pending = new Set<string>();
const listeners = new Set<() => void>();

export function subscribeReadings(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function readingsFor(text: string, enabled: boolean) {
  if (!enabled || !text) return [];
  return cache.get(text) ?? [];
}

export function requestReadings(text: string) {
  if (!text || cache.has(text) || pending.has(text)) return;
  pending.add(text);
  import("./pinyin")
    .then(({ pinyinOf }) => {
      cache.set(text, pinyinOf(text));
    })
    .catch(() => {
      cache.set(text, []);
    })
    .finally(() => {
      pending.delete(text);
      listeners.forEach((listener) => listener());
    });
}
