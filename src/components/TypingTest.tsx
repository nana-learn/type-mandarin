"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { readingsFor, requestReadings, subscribeReadings } from "@/lib/pinyin-loader";
import { showRuby } from "@/lib/ruby";
import {
  charsOf,
  charactersPerMinute,
  formatDuration,
  loadHistory,
  loadReview,
  loadStats,
  loadDaily,
  loadStreak,
  missedSentenceList,
  missedSentences,
  mistakesOf,
  noteRun,
  rememberSentences,
  nextStreak,
  noteDaily,
  saveDaily,
  saveHistory,
  saveReview,
  saveStats,
  saveStreak,
  streakIsLive,
  scoreTyped,
  seedStats,
  stopAtFirstMistake,
  dayKey,
  DAILY_GOAL,
  type Daily,
  type LevelStats,
  type ReviewItem,
  type Streak,
  type TestResult,
} from "@/lib/scoring";
import { initAudio, playFinishSound, playSound } from "@/lib/sounds";
import {
  findIn,
  findPassage,
  isLevel,
  LEVELS,
  LEVEL_LABELS,
  levelPassages,
  neighborPassage,
  passagePosition,
  pickRandom,
  readLevelFromUrl,
  readPassageIdFromUrl,
  requestLevel,
  subscribeCatalog,
  writePracticeToUrl,
  type Level,
  type Passage,
} from "@/lib/texts";

const SOUND_KEY = "soundEnabled";
const SOUND_MODE_KEY = "soundMode";
const PINYIN_KEY = "showPinyin";
const STRICT_KEY = "strictMode";
type SoundMode = "all" | "errors" | "off";
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

function readSoundMode(): SoundMode {
  try {
    const mode = localStorage.getItem(SOUND_MODE_KEY);
    if (mode === "all" || mode === "errors" || mode === "off") return mode;
    if (localStorage.getItem(SOUND_KEY) === "false") return "off";
  } catch {
    return "all";
  }
  return "all";
}

function nextSoundMode(mode: SoundMode): SoundMode {
  if (mode === "all") return "errors";
  if (mode === "errors") return "off";
  return "all";
}

function urlIdOf(id: string) {
  return id.replace(/__drill$/, "");
}

function drillPassage(source: Passage, typed: string): Passage | null {
  const text = missedSentences(source.text, typed);
  if (!text) return null;
  return {
    id: `${urlIdOf(source.id)}__drill`,
    title: `${source.title.replace(/ · 错句$/, "")} · 错句`,
    level: source.level,
    text,
  };
}

function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

function keyboardInset() {
  const viewport = window.visualViewport;
  if (!viewport) return 0;
  return Math.max(0, Math.round(window.innerHeight - viewport.height - viewport.offsetTop));
}

function subscribeViewport(onChange: () => void) {
  const viewport = window.visualViewport;
  if (!viewport) return () => {};
  viewport.addEventListener("resize", onChange);
  viewport.addEventListener("scroll", onChange);
  window.addEventListener("resize", onChange);
  return () => {
    viewport.removeEventListener("resize", onChange);
    viewport.removeEventListener("scroll", onChange);
    window.removeEventListener("resize", onChange);
  };
}

function useKeyboardInset() {
  return useSyncExternalStore(subscribeViewport, keyboardInset, () => 0);
}

function focusInput(input: HTMLTextAreaElement | null, force = false) {
  if (!input) return;
  if (!force && window.matchMedia("(max-width: 767px)").matches) return;
  input.focus();
}

export default function TypingTest() {
  const [level, setLevel] = useState<Level>("hsk1");
  const [passage, setPassage] = useState<Passage | null>(null);
  const [typed, setTyped] = useState("");
  const [runId, setRunId] = useState(0);
  const [showPinyin, setShowPinyin] = useState(false);
  const [soundMode, setSoundMode] = useState<SoundMode>("all");
  const [strict, setStrict] = useState(false);
  const [levelStats, setLevelStats] = useState<Record<string, LevelStats>>({});
  const [linkCopied, setLinkCopied] = useState(false);
  const [booted, setBooted] = useState(false);
  const [finished, setFinished] = useState<TestResult | null>(null);
  const [history, setHistory] = useState<TestResult[]>([]);
  const [review, setReview] = useState<ReviewItem[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [copied, setCopied] = useState(false);
  const [streak, setStreak] = useState<Streak | null>(null);
  const [daily, setDaily] = useState<Daily | null>(null);
  const [pendingPick, setPendingPick] = useState<string | "random" | null>(null);
  const [pendingAvoid, setPendingAvoid] = useState<string[]>([]);
  const keyboardInset = useKeyboardInset();

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const composingRef = useRef(false);
  const startedAt = useRef<number | null>(null);
  const prevLen = useRef(0);
  const finishedRef = useRef(false);
  const passageRef = useRef<Passage | null>(null);
  const levelRef = useRef<Level>(level);
  const historyRef = useRef<TestResult[]>([]);
  const reviewRef = useRef<ReviewItem[]>([]);
  const soundRef = useRef<SoundMode>("all");
  const strictRef = useRef(false);
  const statsRef = useRef<Record<string, LevelStats>>({});
  const streakRef = useRef<Streak | null>(null);
  const dailyRef = useRef<Daily | null>(null);
  const recentRef = useRef<string[]>([]);
  const passageBoxRef = useRef<HTMLDivElement>(null);

  const hydrated = useHydrated();
  const pool = useSyncExternalStore(subscribeCatalog, () => levelPassages(level), () => null);
  if (booted && pool && pool.length > 0 && !passage && !finished) {
    const wanted = pendingPick === "random" ? null : pendingPick ?? readPassageIdFromUrl();
    const next = findIn(pool, wanted) ?? pickRandom(pool, pendingPick === "random" ? pendingAvoid : []);
    setPendingPick(null);
    if (next) setPassage(next);
  }

  if (hydrated && !booted) {
    const fromUrl = readLevelFromUrl();
    setBooted(true);
    setLevel(fromUrl);
    setShowPinyin(readFlag(PINYIN_KEY, false));
    setSoundMode(readSoundMode());
    setStrict(readFlag(STRICT_KEY, false));
    const history = loadHistory();
    setHistory(history);
    setReview(loadReview());
    setLevelStats(seedStats(loadStats(), history));
    setStreak(loadStreak());
    setDaily(loadDaily());
  }

  const target = passage?.text ?? "";
  const targetChars = useMemo(() => charsOf(target), [target]);
  const live = useMemo(() => scoreTyped(target, typed), [target, typed]);
  const cpm = elapsed >= 1000 ? charactersPerMinute(live.correct, elapsed) : null;
  const progress = targetChars.length === 0 ? 0 : Math.min(100, (live.typed / targetChars.length) * 100);
  const stats = levelStats[level];
  const position = passage ? passagePosition(level, passage.id) : null;
  const misses = passage ? mistakesOf(passage.text, typed) : [];
  const drill = finished && passage ? drillPassage(passage, typed) : null;
  const catalog = pool ?? [];
  const selectedId = passage && catalog.some((item) => item.id === urlIdOf(passage.id)) ? urlIdOf(passage.id) : "";
  const reviewHere = review.filter((item) => item.level === level).slice(0, 5);
  const liveStreak = streakIsLive(streak) ? streak : null;
  const todayCount = daily && daily.day === dayKey() ? daily.count : 0;
  const upcoming = targetChars.slice(charsOf(typed).length, charsOf(typed).length + 8).join("");
  const stuck = strict && charsOf(typed).length > 0 && charsOf(typed).at(-1) !== targetChars[charsOf(typed).length - 1];
  const readings = useSyncExternalStore(
    subscribeReadings,
    () => readingsFor(target, showPinyin),
    () => [],
  );

  const begin = useCallback((nextLevel: Level, same?: Passage | null) => {
    const avoid = nextLevel === levelRef.current ? recentRef.current : [];
    const loaded = levelPassages(nextLevel);
    if (!same && !loaded) {
      setPendingPick("random");
      setPendingAvoid(nextLevel === levelRef.current ? recentRef.current : []);
      passageRef.current = null;
      levelRef.current = nextLevel;
      setLevel(nextLevel);
      setPassage(null);
      setTyped("");
      setFinished(null);
      setElapsed(0);
      finishedRef.current = false;
      startedAt.current = null;
      prevLen.current = 0;
      writePracticeToUrl(nextLevel);
      requestLevel(nextLevel);
      return;
    }
    const next = same ?? pickRandom(loaded ?? [], avoid);
    if (!next) return;
    recentRef.current = [next.id, ...recentRef.current.filter((id) => id !== next.id)].slice(0, 12);
    passageRef.current = next;
    levelRef.current = nextLevel;
    setLevel(nextLevel);
    writePracticeToUrl(nextLevel, findPassage(nextLevel, urlIdOf(next.id))?.id);
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
    window.setTimeout(() => focusInput(inputRef.current, true), 0);
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
      passageId: findPassage(levelRef.current, urlIdOf(current.id))?.id,
      cpm: charactersPerMinute(score.correct, duration),
      accuracy: Math.round(score.accuracy),
      correct: score.correct,
      wrong: score.wrong,
      typed: score.typed,
    };
    const missed = missedSentenceList(current.text, value);
    if (missed.length > 0) {
      const nextReview = rememberSentences(reviewRef.current, levelRef.current, missed, result.at);
      reviewRef.current = nextReview;
      saveReview(nextReview);
      setReview(nextReview);
    }
    const nextHistory = [result, ...historyRef.current].slice(0, 10);
    historyRef.current = nextHistory;
    saveHistory(nextHistory);
    setHistory(nextHistory);
    if (!current.id.endsWith("__drill") && !current.id.endsWith("-review")) {
      const nextStats = noteRun(statsRef.current, levelRef.current, result.cpm, result.accuracy);
      statsRef.current = nextStats;
      saveStats(nextStats);
      setLevelStats(nextStats);
      const nextStreakValue = nextStreak(streakRef.current, result.at);
      streakRef.current = nextStreakValue;
      saveStreak(nextStreakValue);
      setStreak(nextStreakValue);
      const nextDaily = noteDaily(dailyRef.current, result.at);
      dailyRef.current = nextDaily;
      saveDaily(nextDaily);
      setDaily(nextDaily);
    }
    setFinished(result);
    setElapsed(duration);
    if (soundRef.current !== "off") playFinishSound();
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
    if (soundRef.current !== "off" && nextChars.length > prev && !completes) {
      let wrong = false;
      for (let i = prev; i < nextChars.length; i += 1) {
        if (nextChars[i] !== expected[i]) wrong = true;
      }
      if (wrong || soundRef.current === "all") playSound(wrong ? "wrong" : "correct");
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
    reviewRef.current = review;
    soundRef.current = soundMode;
    strictRef.current = strict;
    statsRef.current = levelStats;
    streakRef.current = streak;
    dailyRef.current = daily;
    if (passage) {
      recentRef.current = [passage.id, ...recentRef.current.filter((id) => id !== passage.id)].slice(0, 12);
    }
  });

  useEffect(() => {
    if (booted) requestLevel(level);
  }, [booted, level]);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    const base = window.location.pathname.startsWith("/type-mandarin") ? "/type-mandarin" : "";
    navigator.serviceWorker.register(`${base}/sw.js`, { scope: `${base}/` }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!booted || !passage) return;
    writePracticeToUrl(level, findPassage(level, urlIdOf(passage.id))?.id);
    if (finishedRef.current) return;
    window.setTimeout(() => {
      if (!finishedRef.current) focusInput(inputRef.current);
    }, 0);
  }, [booted, level, passage, runId]);

  useEffect(() => {
    if (!booted) return;
    localStorage.setItem(SOUND_MODE_KEY, soundMode);
  }, [booted, soundMode]);

  useEffect(() => {
    if (!booted) return;
    saveStats(levelStats);
  }, [booted, levelStats]);

  useEffect(() => {
    if (showPinyin && target) requestReadings(target);
  }, [showPinyin, target]);

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
                setSoundMode((mode) => nextSoundMode(mode));
              }}
              aria-pressed={soundMode !== "off"}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d45d32] ${
                soundMode === "off"
                  ? "text-[#6d655b] hover:text-[#a39a8c]"
                  : soundMode === "errors"
                    ? "bg-[#e8c547]/15 text-[#e8c547] border border-[#e8c547]/30"
                    : "bg-[#d45d32]/20 text-[#d45d32] border border-[#d45d32]/30"
              }`}
              title={soundMode === "all" ? "改为只在打错时出声" : soundMode === "errors" ? "关闭声音" : "打开全部声音"}
            >
              <SoundIcon muted={soundMode === "off"} />
              <span className="hidden sm:inline">{soundMode === "all" ? "声音" : soundMode === "errors" ? "错音" : "静音"}</span>
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

      <main className="max-w-4xl mx-auto px-4 py-8 pb-44 md:pb-8">
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
          <label className="flex flex-wrap items-center gap-2 text-xs text-[#a39a8c]">
            <span className="w-10">篇目</span>
            <select
              value={selectedId}
              onChange={(event) => {
                const next = findPassage(level, event.target.value);
                if (next) begin(level, next);
              }}
              className="min-w-0 flex-1 rounded-lg border border-[#2a261f] bg-[#12100d] px-2 py-1.5 text-sm text-[#f4efe6]"
              style={{ colorScheme: "dark" }}
            >
              {selectedId === "" && <option value="">当前练习</option>}
              {catalog.map((item, index) => (
                <option key={item.id} value={item.id}>
                  {index + 1}. {item.title}
                </option>
              ))}
            </select>
          </label>
          <p className="text-xs text-[#7d766a]">
            {passage
              ? `${LEVEL_LABELS[level]} · ${passage.title}${position && position.index >= 0 ? ` · ${position.index + 1}/${position.total}` : ""}`
              : `每次打开 ${LEVEL_LABELS[level]} 都会随机一篇该等级的段落。`}
            {stats && stats.runs > 0 ? ` · 最好 ${stats.bestCpm} 字/分 · ${stats.runs} 次` : ""}
            {liveStreak ? ` · 连续 ${liveStreak.count} 天` : ""}
            {` · 今天 ${Math.min(todayCount, DAILY_GOAL)}/${DAILY_GOAL}`}
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
          className="passage w-full text-left rounded-2xl border border-[#2a261f] bg-[#161411] p-5 md:p-6 mb-4 min-h-[160px] md:min-h-[220px] max-h-[40vh] md:max-h-[28rem] overflow-y-auto cursor-text"
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
              {drill && (
                <button
                  type="button"
                  onClick={() => begin(level, drill)}
                  className="px-3 py-1.5 rounded-lg border border-[#d45d32] text-sm text-[#d45d32] hover:text-white hover:bg-[#d45d32]"
                >
                  只练错句
                </button>
              )}
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
          <div
            className="fixed inset-x-0 z-30 border-t border-[#2a261f] bg-[#0c0b0a]/95 px-4 pt-3 backdrop-blur-sm pb-[max(0.75rem,env(safe-area-inset-bottom))] md:static md:z-auto md:mb-4 md:border-0 md:bg-transparent md:px-0 md:pt-0 md:pb-0"
            style={{ bottom: keyboardInset }}
          >
            {target && (
              <p className="mb-2 text-sm text-[#a39a8c] md:hidden">
                {stuck ? "请先退格改正。" : `接下来：${upcoming || "完成"}`}
              </p>
            )}
          <label className="block">
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
          </div>
        )}
        {finished && (
          <div
            className="fixed inset-x-0 z-30 border-t border-[#2a261f] bg-[#0c0b0a]/95 px-4 pt-3 backdrop-blur-sm pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden"
            style={{ bottom: keyboardInset }}
          >
            <button
              type="button"
              onClick={() => begin(level)}
              className="w-full rounded-xl bg-[#d45d32] px-3 py-3 text-white"
            >
              下一段 · {finished.cpm} 字/分
            </button>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-[#a39a8c]">
          <p>
            用拼音、五笔或其他输入法打出汉字。Esc 换一段。
            {strict ? "打错后请退格。" : ""}
            {finished ? "Enter 下一段。" : ""}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#7d766a]">{formatDuration(elapsed)}</span>
            <button
              type="button"
              onClick={() => passage && begin(level, neighborPassage(level, passage.id, -1))}
              disabled={!passage}
              className="shrink-0 px-3 py-1.5 rounded-lg border border-[#2a261f] hover:text-white hover:border-[#d45d32] transition-colors disabled:opacity-40"
            >
              上一篇
            </button>
            <button
              type="button"
              onClick={() => passage && begin(level, neighborPassage(level, passage.id, 1))}
              disabled={!passage}
              className="shrink-0 px-3 py-1.5 rounded-lg border border-[#2a261f] hover:text-white hover:border-[#d45d32] transition-colors disabled:opacity-40"
            >
              下一篇
            </button>
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
              {history.map((item, index) => {
                const saved = isLevel(item.level) && item.passageId ? findPassage(item.level, item.passageId) : undefined;
                const label = `${levelLabel(item.level)}${item.title ? ` · ${item.title}` : ""} · ${item.cpm} 字/分 · ${item.accuracy}%`;
                const canOpen = isLevel(item.level) && Boolean(item.passageId);
                return (
                  <li key={`${item.at}-${index}`}>
                    {canOpen ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (!isLevel(item.level) || !item.passageId) return;
                          if (saved) {
                            begin(item.level, saved);
                            return;
                          }
                          setPendingPick(item.passageId);
                          setLevel(item.level);
                          setPassage(null);
                          requestLevel(item.level);
                        }}
                        className="text-xs text-[#a39a8c] border border-[#2a261f] rounded-full px-2.5 py-1 hover:text-white hover:border-[#d45d32]"
                      >
                        {label}
                      </button>
                    ) : (
                      <span className="text-xs text-[#a39a8c] border border-[#2a261f] rounded-full px-2.5 py-1">
                        {label}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {reviewHere.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-[#7d766a]">错句本</p>
              <button
                type="button"
                onClick={() => {
                  const next = review.filter((item) => item.level !== level);
                  reviewRef.current = next;
                  saveReview(next);
                  setReview(next);
                }}
                className="text-xs text-[#7d766a] hover:text-white"
              >
                清除本级
              </button>
            </div>
            <ul className="flex flex-col gap-2">
              {reviewHere.map((item) => (
                <li key={`${item.at}-${item.text}`}>
                  <button
                    type="button"
                    onClick={() => begin(level, {
                      id: `${level}-review`,
                      title: "错句本",
                      level,
                      text: item.text,
                    })}
                    className="w-full text-left text-sm rounded-xl border border-[#2a261f] px-3 py-2 hover:border-[#d45d32]"
                  >
                    <span className="text-[#fb7185] mr-2">{item.count}次</span>
                    {item.text}
                  </button>
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
