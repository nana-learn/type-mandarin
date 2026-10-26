import { pinyin } from 'pinyin-pro';

/**
 * Convert Chinese text to Pinyin
 * Uses pinyin-pro library for accurate conversion
 */
export function textToPinyin(text: string): string {
  return pinyin(text, { toneType: 'none', type: 'array' }).join(' ');
}

/**
 * Get pinyin for a single character
 */
export function charToPinyin(char: string): string {
  return pinyin(char, { toneType: 'none', type: 'array' }).join(' ');
}
