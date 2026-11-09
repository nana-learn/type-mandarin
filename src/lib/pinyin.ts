import { pinyin } from "pinyin-pro";

/** One pinyin token per character, with tone marks. */
export function pinyinOf(text: string): string[] {
  const chars = Array.from(text);
  if (chars.length === 0) return [];

  const list = pinyin(text, {
    toneType: "symbol",
    type: "array",
    nonZh: "consecutive",
  });

  if (list.length === chars.length) return list;
  return chars.map((char) => pinyin(char, { toneType: "symbol", type: "array" })[0] ?? "");
}

export function showRuby(character: string, reading: string | undefined) {
  if (!reading || reading === character) return false;
  return /[a-zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜü]/i.test(reading);
}
