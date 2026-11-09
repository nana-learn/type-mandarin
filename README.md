# Type Mandarin

A Mandarin typing practice page in the spirit of [10FastFingers](https://10fastfingers.com/typing-test): a paragraph of Chinese is shown, and you type characters to match it.

**Live site:** https://nana-learn.github.io/type-mandarin/

## Levels

Choose **HSK 1–6**. The URL stores the level, and each visit loads a **random paragraph** for that level:

| Level | Paragraphs | Link |
| --- | ---: | --- |
| HSK 1 | 100 | [type](https://nana-learn.github.io/type-mandarin/?level=hsk1) |
| HSK 2 | 100 | [type](https://nana-learn.github.io/type-mandarin/?level=hsk2) |
| HSK 3 | 100 | [type](https://nana-learn.github.io/type-mandarin/?level=hsk3) |
| HSK 4 | 100 | [type](https://nana-learn.github.io/type-mandarin/?level=hsk4) |
| HSK 5 | 100 | [type](https://nana-learn.github.io/type-mandarin/?level=hsk5) |
| HSK 6 | 100 | [type](https://nana-learn.github.io/type-mandarin/?level=hsk6) |
| **Total** | **600** | |

Default is HSK 1. A level link without an id starts on a random paragraph. After one is chosen, the URL also stores that paragraph id, so a refresh or a shared link opens the same text.

## How it works

1. Turn on a Chinese IME (Pinyin, Wubi, Zhuyin, …).
2. Pick a level, then type the paragraph in the input box.
3. Finishing a paragraph shows characters per minute and accuracy. Load another, or repeat the same one.

Wrong characters are marked in red, and the character you actually typed is shown underneath. After a run you can retry only the sentences you missed. Strict mode stops at the first mistake until you backspace. Paste is disabled. Esc loads another random paragraph; the footer also moves to the previous or next paragraph in that level. The header can show tone-marked pinyin, turn on strict mode, or cycle sounds between all keystrokes, errors only, and mute. A menu jumps to any paragraph in the level and marks the ones you have typed perfectly. New random paragraphs prefer ones you have not finished. Missed sentences and characters are kept for later practice, and each level’s best speed is remembered. Finishing a full paragraph on a new day continues a streak, and three finished paragraphs complete the day’s goal. On a phone, the input stays above the keyboard. Only the selected level is downloaded, and after one visit the page can open offline.

## Tech stack

- **Next.js 16** static export (`next build` → `./out`)
- **Tailwind CSS v4**
- **GitHub Pages** via GitHub Actions, same pattern as [pbt-findings](https://github.com/fermat-hkrc/pbt-findings)

## Development

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static export to ./out
```

## Deploy

Push to `main`. GitHub Actions builds the static export and publishes Pages.

The production `basePath` is `/type-mandarin`, so the site is served at:

`https://nana-learn.github.io/type-mandarin/`

In the GitHub repo, set **Settings → Pages → Source** to **GitHub Actions**.
