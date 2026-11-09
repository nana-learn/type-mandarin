type PoolItem = { id: string };

export function preferUnfinished<T extends PoolItem>(pool: T[], doneIds: string[]): T[] {
  const done = new Set(doneIds);
  const left = pool.filter((item) => !done.has(item.id));
  return left.length > 0 ? left : pool;
}

export function findIn<T extends PoolItem>(pool: T[], id: string | null | undefined): T | undefined {
  if (!id) return undefined;
  return pool.find((item) => item.id === id);
}

export function pickRandom<T extends PoolItem>(pool: T[], avoidIds: string[] = []): T | undefined {
  if (pool.length === 0) return undefined;
  const blocked = new Set(avoidIds);
  const choices = pool.filter((item) => !blocked.has(item.id));
  const source = choices.length > 0 ? choices : pool;
  return source[Math.floor(Math.random() * source.length)];
}

export function positionIn<T extends PoolItem>(pool: T[], id?: string) {
  const base = (id ?? "").replace(/__drill$/, "");
  return { index: pool.findIndex((item) => item.id === base), total: pool.length };
}

export function neighborIn<T extends PoolItem>(pool: T[], id: string | undefined, delta: number): T | undefined {
  if (pool.length === 0) return undefined;
  const base = (id ?? "").replace(/__drill$/, "");
  const index = pool.findIndex((item) => item.id === base);
  const nextIndex = index === -1
    ? (delta >= 0 ? 0 : pool.length - 1)
    : (index + delta + pool.length) % pool.length;
  return pool[nextIndex];
}
