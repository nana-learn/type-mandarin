# Type Mandarin

A Mandarin typing practice page in the spirit of [10FastFingers](https://10fastfingers.com/typing-test): a paragraph of Chinese is shown, and you type characters to match it.

**Live site:** https://nana-learn.github.io/type-mandarin/

## Levels

Choose **HSK 1–6**. The URL stores the level, and each visit loads a **random paragraph** for that level:

- [HSK 1](https://nana-learn.github.io/type-mandarin/?level=hsk1)
- [HSK 2](https://nana-learn.github.io/type-mandarin/?level=hsk2)
- [HSK 3](https://nana-learn.github.io/type-mandarin/?level=hsk3)
- [HSK 4](https://nana-learn.github.io/type-mandarin/?level=hsk4)
- [HSK 5](https://nana-learn.github.io/type-mandarin/?level=hsk5)
- [HSK 6](https://nana-learn.github.io/type-mandarin/?level=hsk6)

Default is HSK 1. Changing the level in the UI updates the query string, so the page is shareable.

## How it works

1. Turn on a Chinese IME (Pinyin, Wubi, Zhuyin, …).
2. Pick a level, then type the paragraph in the input box.
3. Finishing a paragraph loads another random one at the same level.

Wrong characters are marked in red; you can backspace to fix them. Paste is disabled. Esc loads another random paragraph at the same level.

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
