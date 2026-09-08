# Type Mandarin

A one-minute Mandarin typing test in the spirit of [10FastFingers](https://10fastfingers.com/typing-test): a paragraph of Chinese is shown, and you type characters to match it.

**Live site:** https://nana-learn.github.io/type-mandarin/

## How it works

1. Turn on a Chinese IME (Pinyin, Wubi, Zhuyin, …).
2. Click the input box and start typing the paragraph.
3. The timer starts on the first committed character.
4. After the time is up, you get **CPM** (correct characters per minute) and accuracy.

Wrong characters are marked in red; you can backspace to fix them. Paste is disabled. Esc restarts the test.

Chinese is scored in **characters**, not words. Only correctly typed characters count toward CPM.

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
