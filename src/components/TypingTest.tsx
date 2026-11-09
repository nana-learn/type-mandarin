"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { pinyinOf, showRuby } from "@/lib/pinyin";
import {
  charsOf,
  charactersPerMinute,
  formatDuration,
  loadHistory,
  mistakesOf,
  saveHistory,
  scoreTyped,
  stopAtFirstMistake,
  type TestResult,
} from "@/lib/scoring";
import { initAudio, playFinishSound, playSound } from "@/lib/sounds";
import {
  findPassage,
  isLevel,
  LEVELS,
  LEVEL_LABELS,
  randomPassage,
  readLevelFromUrl,
  readPassageIdFromUrl,
  writePracticeToUrl,
  type Level,
  type Passage,
} from "@/lib/texts";

const SOUND_KEY = "soundEnabled";
const PINYIN_KEY = "showPinyin";
const STRICT_KEY = "strictMode";
const PUNCTUATION = /^[\s，。！？、；：,.!?;:“”‘’（）()【】《》…—～·]$/;

function readFlag(key: string, fallback: boolean) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === "true") return true;
    if (raw === "false") return false;
  } catch {
    return fallback;
  }
  return fallback;
}

function levelLabel(level?: string) {
  return isLevel(level) ? LEVEL_LABELS[level] : "练习";
}

function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export default function TypingTest() {
  const [level, setLevel] = useState<Level>("hsk1");
  const [passage, setPassage] = useState<Passage | null>(null);
  const [typed, setTyped] = useState("");
  const [runId, setRunId] = useState(0);
  const [showPinyin, setShowPinyin] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [strict, setStrict] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [booted, setBooted] = useState(false);
  const [finished, setFinished] = useState<TestResult | null>(null);
  const [history, setHistory] = useState<TestResult[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [copied, setCopied] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const composingRef = useRef(false);
  const startedAt = useRef<number | null>(null);
  const prevLen = useRef(0);
  const finishedRef = useRef(false);
  const passageRef = useRef<Passage | null>(null);
  const levelRef = useRef<Level>(level);
  const historyRef = useRef<TestResult[]>([]);
  const soundRef = useRef(soundEnabled);
  const strictRef = useRef(false);
  const recentRef = useRef<string[]>([]);
  const passageBoxRef = useRef<HTMLDivElement>(null);

  const hydrated = useHydrated();
  if (hydrated && !booted) {
    const fromUrl = readLevelFromUrl();
    setBooted(true);
    setLevel(fromUrl);
    setPassage(findPassage(fromUrl, readPassageIdFromUrl()) ?? randomPassage(fromUrl));
    setShowPinyin(readFlag(PINYIN_KEY, false));
    setSoundEnabled(readFlag(SOUND_KEY, true));
    setStrict(readFlag(STRICT_KEY, false));
    setHistory(loadHistory());
  }

  const target = passage?.text ?? "";
  const targetChars = useMemo(() => charsOf(target), [target]);
  const live = useMemo(() => scoreTyped(target, typed), [target, typed]);
  const cpm = elapsed >= 1000 ? charactersPerMinute(live.correct, elapsed) : null;
  const progress = targetChars.length === 0 ? 0 : Math.min(100, (live.typed / targetChars.length) * 100);
  const readings = useMemo(
    () => (showPinyin && target ? pinyinOf(target) : []),
    [showPinyin, target],
  );
  const best = history.reduce((max, item) => (item.level === level ? Math.max(max, item.cpm) : max), 0);
  const misses = passage ? mistakesOf(passage.text, typed) : [];

  const begin = useCallback((nextLevel: Level, same?: Passage | null) => {
    const avoid = nextLevel === levelRef.current ? recentRef.current : [];
    const next = same ?? randomPassage(nextLevel, avoid);
    recentRef.current = [next.id, ...recentRef.current.filter((id) => id !== next.id)].slice(0, 12);
    passageRef.current = next;
    levelRef.current = nextLevel;
    setLevel(nextLevel);
    writePracticeToUrl(nextLevel, next.id);
    setPassage(next);
    setTyped("");
    setFinished(null);
    setCopied(false);
    setLinkCopied(false);
    setElapsed(0);
    finishedRef.current = false;
    startedAt.current = null;
    prevLen.current = 0;
    setRunId((id) => id + 1);
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }, []);

  const finish = useCallback((value: string) => {
    const current = passageRef.current;
    if (!current || finishedRef.current) return;
    finishedRef.current = true;
    const duration = startedAt.current ? Date.now() - startedAt.current : 0;
    const score = scoreTyped(current.text, value);
    const result: TestResult = {
      at: Date.now(),
      duration,
      level: levelRef.current,
      title: current.title,
      cpm: charactersPerMinute(score.correct, duration),
      accuracy: Math.round(score.accuracy),
      correct: score.correct,
      wrong: score.wrong,
      typed: score.typed,
    };
    const nextHistory = [result, ...historyRef.current].slice(0, 10);
    historyRef.current = nextHistory;
    saveHistory(nextHistory);
    setHistory(nextHistory);
    setFinished(result);
    setElapsed(duration);
    if (soundRef.current) playFinishSound();
  }, []);

  const commitTyped = useCallback((raw: string) => {
    const current = passageRef.current;
    if (!current || finishedRef.current) return;
    const expected = charsOf(current.text);
    const sliced = charsOf(raw).slice(0, expected.length);
    const limited = strictRef.current ? stopAtFirstMistake(expected, sliced) : sliced.join("");
    if (inputRef.current && inputRef.current.value !== limited) {
      inputRef.current.value = limited;
    }

    const nextChars = charsOf(limited);
    if (nextChars.length > 0 && startedAt.current === null) {
      startedAt.current = Date.now();
    }

    const prev = prevLen.current;
    const completes = expected.length > 0 && nextChars.length >= expected.length;
    if (soundRef.current && nextChars.length > prev && !completes) {
      let wrong = false;
      for (let i = prev; i < nextChars.length; i += 1) {
        if (nextChars[i] !== expected[i]) wrong = true;
      }
      playSound(wrong ? "wrong" : "correct");
    }
    prevLen.current = nextChars.length;
    setTyped(limited);
    if (startedAt.current) setElapsed(Date.now() - startedAt.current);
    if (completes) finish(limited);
  }, [finish]);

  useEffect(() => {
    passageRef.current = passage;
    levelRef.current = level;
    historyRef.current = history;
    soundRef.current = soundEnabled;
    strictRef.current = strict;
    if (passage) {
      recentRef.current = [passage.id, ...recentRef.current.filter((id) => id !== passage.id)].slice(0, 12);
    }
  });

  useEffect(() => {
    if (!booted || !passage) return;
    writePracticeToUrl(level, passage.id);
    if (finishedRef.current) return;
    window.setTimeout(() => {
      if (!finishedRef.current) inputRef.current?.focus();
    }, 0);
  }, [booted, level, passage, runId]);

  useEffect(() => {
    if (!booted) return;
    localStorage.setItem(SOUND_KEY, String(soundEnabled));
  }, [booted, soundEnabled]);

  useEffect(() => {
    if (!booted) return;
    localStorage.setItem(PINYIN_KEY, String(showPinyin));
  }, [booted, showPinyin]);

  useEffect(() => {
    if (!booted) return;
    localStorage.setItem(STRICT_KEY, String(strict));
  }, [booted, strict]);

  useEffect(() => {
    if (!startedAt.current || finished) return;
    const id = window.setInterval(() => {
      if (startedAt.current) setElapsed(Date.now() - startedAt.current);
    }, 200);
    return () => window.clearInterval(id);
  }, [typed, finished]);

  useEffect(() => {
    const box = passageBoxRef.current;
    const current = box?.querySelector<HTMLElement>(".cur");
    if (!box || !current) return;
    const boxRect = box.getBoundingClientRect();
    const currentRect = current.getBoundingClientRect();
    if (currentRect.top < boxRect.top) {
      box.scrollTop -= boxRect.top - currentRect.top + 12;
    } else if (currentRect.bottom > boxRect.bottom) {
      box.scrollTop += currentRect.bottom - boxRect.bottom + 12;
    }
  }, [typed, showPinyin]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        initAudio();
        begin(levelRef.current);
        return;
      }
      if (event.key === "Enter" && finishedRef.current) {
        const tag = (event.target as HTMLElement | null)?.tagName;
        if (tag === "BUTTON" || tag === "A" || tag === "TEXTAREA") return;
        event.preventDefault();
        begin(levelRef.current);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [begin]);

  useEffect(() => {
    if (finished) nextRef.current?.focus();
  }, [finished]);

  const syncTyped = () => {
    if (composingRef.current || finishedRef.current) return;
    commitTyped(inputRef.current?.value ?? "");
  };

  const copyResult = async () => {
    if (!finished || !passage) return;
    const text = `${LEVEL_LABELS[level]} · ${passage.title} · ${finished.cpm} 字/分 · 准确率 ${finished.accuracy}%`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);
    } catch {
      setLinkCopied(false);
    }
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-[#2a261f] bg-[#0c0b0a]/90 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 min-h-14 py-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-md bg-[#d45d32] text-white text-sm font-semibold grid place-items-center">
              汉
            </span>
            <div>
              <p className="text-sm font-semibold tracking-tight">Type Mandarin</p>
              <p className="text-[11px] text-[#a39a8c] leading-none">汉字打字练习</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                initAudio();
                setSoundEnabled((value) => !value);
              }}
              aria-pressed={soundEnabled}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d45d32] ${
                soundEnabled
                  ? "bg-[#d45d32]/20 text-[#d45d32] border border-[#d45d32]/30"
                  : "text-[#6d655b] hover:text-[#a39a8c]"
              }`}
              title={soundEnabled ? "关闭声音" : "打开声音"}
            >
              <SoundIcon muted={!soundEnabled} />
              <span className="hidden sm:inline">{soundEnabled ? "声音" : "静音"}</span>
            </button>
            <button
              type="button"
              onClick={() => setShowPinyin((value) => !value)}
              aria-pressed={showPinyin}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e8c547] ${
                showPinyin
                  ? "bg-[#e8c547]/15 text-[#e8c547] border border-[#e8c547]/30"
                  : "text-[#6d655b] hover:text-[#a39a8c]"
              }`}
              title={showPinyin ? "隐藏拼音" : "显示拼音"}
            >
              <span className="font-semibold tracking-tight">拼</span>
              <span className="hidden sm:inline">{showPinyin ? "拼音" : "汉字"}</span>
            </button>
            <button
              type="button"
              onClick={() => setStrict((value) => !value)}
              aria-pressed={strict}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e8c547] ${
                strict
                  ? "bg-white/10 text-white border border-[#a39a8c]"
                  : "text-[#6d655b] hover:text-[#a39a8c]"
              }`}
              title={strict ? "关闭严格模式" : "严格模式：打错后必须退格"}
            >
              <span className="font-semibold">严</span>
              <span className="hidden sm:inline">{strict ? "严格" : "宽松"}</span>
            </button>
            <a
              href="https://github.com/nana-learn/type-mandarin"
              className="text-xs text-[#a39a8c] hover:text-white transition-colors px-1"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex flex-col gap-3 mb-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-[#a39a8c] w-10">等级</span>
            {LEVELS.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  initAudio();
                  begin(id);
                }}
                className={`px-3 py-1.5 rounded-full text-sm border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d45d32] ${
                  level === id
                    ? "bg-[#d45d32] border-[#d45d32] text-white"
                    : "border-[#2a261f] text-[#a39a8c] hover:text-white"
                }`}
              >
                {LEVEL_LABELS[id]}
              </button>
            ))}
          </div>
          <p className="text-xs text-[#7d766a]">
            {passage
              ? `${LEVEL_LABELS[level]} · ${passage.title}`
              : `每次打开 ${LEVEL_LABELS[level]} 都会随机一篇该等级的段落。`}
            {best > 0 ? ` · 本级最好 ${best} 字/分` : ""}
            {strict ? " · 打错后必须退格" : ""}
          </p>
        </div>

        <div
          className="h-1.5 rounded-full bg-[#2a261f] overflow-hidden mb-4"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={targetChars.length}
          aria-valuenow={live.typed}
          aria-label="进度"
        >
          <div className="h-full bg-[#d45d32] transition-[width] duration-150" style={{ width: `${progress}%` }} />
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4 text-center">
          <Stat label="进度" value={target ? `${live.typed}/${targetChars.length}` : "—"} />
          <Stat label="准确率" value={live.typed === 0 ? "—" : `${Math.round(live.accuracy)}%`} />
          <Stat label="字/分" value={cpm === null ? "—" : String(cpm)} />
        </div>

        <div
          ref={passageBoxRef}
          className="passage w-full text-left rounded-2xl border border-[#2a261f] bg-[#161411] p-5 md:p-6 mb-4 min-h-[220px] max-h-[28rem] overflow-y-auto cursor-text"
          onClick={() => {
            initAudio();
            if (!finished) inputRef.current?.focus();
          }}
        >
          {target ? (
            <PassageView target={target} typed={typed} showPinyin={showPinyin} readings={readings} />
          ) : (
            <p className="text-[#7d766a] text-lg">正在准备段落…</p>
          )}
        </div>

        {finished && passage ? (
          <section className="rounded-2xl border border-[#2a261f] bg-[#12100d] px-4 py-4 mb-4" role="status" aria-live="polite">
            <p className="text-sm text-[#a39a8c]">完成 · {passage.title}</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight">
              {finished.cpm} <span className="text-base font-normal text-[#a39a8c]">字/分</span>
            </p>
            <p className="mt-1 text-sm text-[#a39a8c]">
              准确率 {finished.accuracy}% · 正确 {finished.correct} · 错误 {finished.wrong} · 用时 {formatDuration(finished.duration)}
            </p>
            {misses.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-2">
                {misses.slice(0, 8).map((miss) => (
                  <li key={miss.index} className="text-sm rounded-lg border border-[#2a261f] px-2 py-1">
                    <span className="text-[#fb7185]">{miss.actual}</span>
                    <span className="text-[#7d766a]"> → </span>
                    <span>{miss.expected}</span>
                  </li>
                ))}
                {misses.length > 8 && (
                  <li className="text-xs text-[#7d766a] self-center">还有 {misses.length - 8} 处</li>
                )}
              </ul>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                ref={nextRef}
                type="button"
                onClick={() => begin(level)}
                className="px-3 py-1.5 rounded-lg bg-[#d45d32] text-white text-sm hover:bg-[#c04b26] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e8c547]"
              >
                下一段
              </button>
              <button
                type="button"
                onClick={() => begin(level, passage)}
                className="px-3 py-1.5 rounded-lg border border-[#2a261f] text-sm hover:text-white hover:border-[#d45d32]"
              >
                再练这篇
              </button>
              <button
                type="button"
                onClick={copyResult}
                className="px-3 py-1.5 rounded-lg border border-[#2a261f] text-sm hover:text-white hover:border-[#d45d32]"
              >
                {copied ? "已复制" : "复制成绩"}
              </button>
              <button
                type="button"
                onClick={copyLink}
                className="px-3 py-1.5 rounded-lg border border-[#2a261f] text-sm hover:text-white hover:border-[#d45d32]"
              >
                {linkCopied ? "链接已复制" : "复制链接"}
              </button>
            </div>
          </section>
        ) : (
          <label className="block mb-4">
            <span className="sr-only">在此输入汉字</span>
            <textarea
              key={runId}
              ref={inputRef}
              lang="zh-CN"
              rows={2}
              placeholder="请开启中文输入法，在此输入……"
              className="w-full resize-none rounded-2xl border border-[#2a261f] bg-[#12100d] px-4 py-3 text-xl leading-relaxed text-[#f4efe6] placeholder:text-[#6d655b] outline-none focus:border-[#d45d32]"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              onPaste={(event) => event.preventDefault()}
              onDrop={(event) => event.preventDefault()}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.nativeEvent.isComposing && !composingRef.current) {
                  event.preventDefault();
                }
              }}
              onCompositionStart={() => {
                composingRef.current = true;
              }}
              onCompositionEnd={() => {
                composingRef.current = false;
                requestAnimationFrame(syncTyped);
              }}
              onInput={syncTyped}
            />
          </label>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-[#a39a8c]">
          <p>
            用拼音、五笔或其他输入法打出汉字。Esc 换一段。
            {strict ? "打错后请退格。" : ""}
            {finished ? "Enter 下一段。" : ""}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#7d766a]">{formatDuration(elapsed)}</span>
            {!finished && (
              <button
                type="button"
                onClick={() => passage && begin(level, passage)}
                disabled={!passage}
                className="shrink-0 px-3 py-1.5 rounded-lg border border-[#2a261f] hover:text-white hover:border-[#d45d32] transition-colors disabled:opacity-40"
              >
                重练
              </button>
            )}
            <button
              type="button"
              onClick={copyLink}
              className="shrink-0 px-3 py-1.5 rounded-lg border border-[#2a261f] hover:text-white hover:border-[#d45d32] transition-colors"
            >
              {linkCopied ? "已复制" : "链接"}
            </button>
            <button
              type="button"
              onClick={() => {
                initAudio();
                begin(level);
              }}
              className="shrink-0 px-3 py-1.5 rounded-lg border border-[#2a261f] hover:text-white hover:border-[#d45d32] transition-colors"
            >
              换一段
            </button>
          </div>
        </div>

        {history.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-[#7d766a]">最近成绩</p>
              <button
                type="button"
                onClick={() => {
                  saveHistory([]);
                  setHistory([]);
                }}
                className="text-xs text-[#7d766a] hover:text-white"
              >
                清除
              </button>
            </div>
            <ul className="flex flex-wrap gap-2">
              {history.map((item, index) => (
                <li
                  key={`${item.at}-${index}`}
                  className="text-xs text-[#a39a8c] border border-[#2a261f] rounded-full px-2.5 py-1"
                >
                  {levelLabel(item.level)}
                  {item.title ? ` · ${item.title}` : ""} · {item.cpm} 字/分 · {item.accuracy}%
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#2a261f] bg-[#12100d] px-3 py-2">
      <p className="text-[11px] text-[#7d766a]">{label}</p>
      <p className="text-lg font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function PassageView({
  target,
  typed,
  showPinyin,
  readings,
}: {
  target: string;
  typed: string;
  showPinyin: boolean;
  readings: string[];
}) {
  const targetChars = charsOf(target);
  const typedChars = charsOf(typed);

  return (
    <div className="passage-row">
      {targetChars.map((character, index) => {
        let className = "glyph pending";
        if (index < typedChars.length) {
          className = typedChars[index] === character ? "glyph ok" : "glyph bad";
        } else if (index === typedChars.length) {
          className = "glyph cur blink";
        }
        const reading = readings[index];
        const punct = PUNCTUATION.test(character);
        const typedChar = typedChars[index];
        const wrong = typedChar !== undefined && typedChar !== character;
        return (
          <span
            key={`${index}-${character}`}
            className={punct ? "cell punct" : "cell"}
            title={wrong ? `打了${typedChar}，应为${character}` : undefined}
          >
            {showPinyin && <span className="ruby">{showRuby(character, reading) ? reading : ""}</span>}
            <span className={className}>{character}</span>
            {wrong && <span className="miss">{typedChar}</span>}
          </span>
        );
      })}
    </div>
  );
}

function SoundIcon({ muted }: { muted: boolean }) {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      {muted ? (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zM17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
      )}
    </svg>
  );
}
