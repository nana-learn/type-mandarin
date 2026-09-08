export const LEVELS = ["hsk1", "hsk2", "hsk3", "hsk4", "hsk5", "hsk6"] as const;

export type Level = (typeof LEVELS)[number];

export type Passage = {
  id: string;
  title: string;
  level: Level;
  text: string;
};

export const LEVEL_LABELS: Record<Level, string> = {
  hsk1: "HSK 1",
  hsk2: "HSK 2",
  hsk3: "HSK 3",
  hsk4: "HSK 4",
  hsk5: "HSK 5",
  hsk6: "HSK 6",
};

export function passage(level: Level, id: string, title: string, text: string): Passage {
  return { id, title, level, text };
}
