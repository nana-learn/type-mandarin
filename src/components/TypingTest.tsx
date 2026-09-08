"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  charactersPerMinute,
  charsOf,
  loadHistory,
  saveHistory,
  scoreTyped,
  type TestResult,
} from "@/lib/scoring";
import {
  buildPrompt,
  nextPassage,
  type Category,
} from "@/lib/texts";

const DURATIONS = [15, 30, 60, 120] as const;
const CATEGORIES: { id: Category; label: string }[] = [
  { id: "all", label: "全部" },
  { id: "hsk", label: "入门" },
  { id: "daily", label: "日常" },
  { id: "story", label: "短文" },
];

type Status = "idle" | "running" | "done";

export default function TypingTest() {
  const [duration, setDuration] = useState(60);
  const [category, setCategory] = useState<Category>("all");
  const [target, setTarget] = useState("");
  const [typed, setTyped] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [history, setHistory] = useState<TestResult[]>([]);
  const [runId, setRunId] = useState(0);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const composingRef = useRef(false);
  const finishedRef = useRef(false);

  const remainingMs = useMemo(() => {
    if (status === "idle" || startedAt === null) return duration * 1000;
    if (status === "done") return 0;
    return Math.max(0, duration * 1000 - (now - startedAt));
  }, [duration, now, startedAt, status]);

  const elapsedMs = useMemo(() => {
    if (startedAt === null) return 0;
    if (status === "done") return duration * 1000;
    return Math.min(duration * 1000, now - startedAt);
  }, [duration, now, startedAt, status]);

  const live = useMemo(() => scoreTyped(target, typed), [target, typed]);
  const cpm = charactersPerMinute(live.correct, elapsedMs);

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setStatus("done");
    const elapsed = duration * 1000;
    const scored = scoreTyped(target, inputRef.current?.value ?? typed);
    const result: TestResult = {
      at: Date.now(),
      duration,
      cpm: charactersPerMinute(scored.correct, elapsed),
      accuracy: Math.round(scored.accuracy * 10) / 10,
      correct: scored.correct,
      wrong: scored.wrong,
      typed: scored.typed,
    };
    setHistory((prev) => {
      const next = [result, ...prev].slice(0, 10);
      saveHistory(next);
      return next;
    });
    inputRef.current?.blur();
  }, [duration, target, typed]);

  const restart = useCallback(
    (nextDuration = duration, nextCategory = category) => {
      finishedRef.current = false;
      setDuration(nextDuration);
      setCategory(nextCategory);
      setTarget(buildPrompt(nextCategory));
      setTyped("");
      setStatus("idle");
      setStartedAt(null);
      setRunId((id) => id + 1);
      setTimeout(() => inputRef.current?.focus(), 0);
    },
    [category, duration],
  );

  useEffect(() => {
    setTarget(buildPrompt("all"));
    setHistory(loadHistory());
  }, []);

  useEffect(() => {
    if (status !== "running") return;
    const timer = window.setInterval(() => setNow(Date.now()), 100);
    return () => window.clearInterval(timer);
  }, [status]);

  useEffect(() => {
    if (status === "running" && remainingMs <= 0) finish();
  }, [finish, remainingMs, status]);

  useEffect(() => {
    if (status === "done") return;
    const typedLen = charsOf(typed).length;
    const targetLen = charsOf(target).length;
    if (targetLen > 0 && typedLen > targetLen - 40) {
      setTarget((current) => current + nextPassage(category));
    }
  }, [category, status, target, typed]);

  useEffect(() => {
    document.querySelector<HTMLElement>(".passage .cur")?.scrollIntoView({
      block: "nearest",
      inline: "nearest",
    });
  }, [typed]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        restart();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [restart]);

  const syncTyped = () => {
    if (composingRef.current || status === "done") return;
    const value = inputRef.current?.value ?? "";
    if (status === "idle" && value.length > 0) {
      finishedRef.current = false;
      setStatus("running");
      setStartedAt(Date.now());
      setNow(Date.now());
    }
    setTyped(value);
  };

  const remainingLabel = formatTime(remainingMs);
  const latest = history[0];

  return (
    <div className="min-h-screen">
      <header className="border-b border-[#2a261f] bg-[#0c0b0a]/90 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-md bg-[#d45d32] text-white text-sm font-semibold grid place-items-center">
              汉
            </span>
            <div>
              <p className="text-sm font-semibold tracking-tight">Type Mandarin</p>
              <p className="text-[11px] text-[#a39a8c] leading-none">汉字打字测试</p>
            </div>
          </div>
          <a
            href="https://github.com/nana-learn/type-mandarin"
            className="text-xs text-[#a39a8c] hover:text-white transition-colors"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {DURATIONS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => restart(value, category)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                duration === value
                  ? "bg-[#d45d32] border-[#d45d32] text-white"
                  : "border-[#2a261f] text-[#a39a8c] hover:text-white"
              }`}
            >
              {value} 秒
            </button>
          ))}
          <span className="w-px h-5 bg-[#2a261f] mx-1" />
          {CATEGORIES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => restart(duration, item.id)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                category === item.id
                  ? "bg-[#2a261f] border-[#d45d32] text-white"
                  : "border-[#2a261f] text-[#a39a8c] hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <section className="grid grid-cols-3 gap-3 mb-5">
          <Stat label="剩余时间" value={remainingLabel} />
          <Stat label="速度 CPM" value={String(cpm)} />
          <Stat
            label="准确率"
            value={`${live.typed ? Math.round(live.accuracy) : 100}%`}
          />
        </section>

        <div
          className="w-full text-left rounded-2xl border border-[#2a261f] bg-[#161411] p-5 md:p-6 mb-4 min-h-[220px] max-h-[320px] overflow-y-auto cursor-text"
          onClick={() => inputRef.current?.focus()}
        >
          {target ? (
            <PassageView target={target} typed={typed} />
          ) : (
            <p className="text-[#7d766a] text-lg">正在准备段落…</p>
          )}
        </div>

        <label className="block mb-4">
          <span className="sr-only">在此输入汉字</span>
          <textarea
            key={runId}
            ref={inputRef}
            lang="zh-CN"
            rows={2}
            disabled={status === "done"}
            placeholder="请开启中文输入法，在此输入……计时将在第一字后开始"
            className="w-full resize-none rounded-2xl border border-[#2a261f] bg-[#12100d] px-4 py-3 text-xl leading-relaxed text-[#f4efe6] placeholder:text-[#6d655b] outline-none focus:border-[#d45d32] disabled:opacity-60"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            onPaste={(event) => event.preventDefault()}
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

        <div className="flex items-center justify-between gap-3 text-sm text-[#a39a8c] mb-10">
          <p>用拼音、五笔或其他输入法打出段落中的汉字。Esc 重新开始。</p>
          <button
            type="button"
            onClick={() => restart()}
            className="shrink-0 px-3 py-1.5 rounded-lg border border-[#2a261f] hover:text-white hover:border-[#d45d32] transition-colors"
          >
            重来
          </button>
        </div>

        {status === "done" && latest && (
          <ResultPanel result={latest} onRetry={() => restart()} />
        )}

        {history.length > 0 && (
          <section>
            <h2 className="text-sm font-medium text-[#a39a8c] mb-3">最近成绩</h2>
            <div className="overflow-hidden rounded-xl border border-[#2a261f]">
              <table className="w-full text-sm">
                <thead className="bg-[#161411] text-[#a39a8c]">
                  <tr>
                    <th className="text-left font-medium px-3 py-2">时间</th>
                    <th className="text-right font-medium px-3 py-2">时长</th>
                    <th className="text-right font-medium px-3 py-2">CPM</th>
                    <th className="text-right font-medium px-3 py-2">准确率</th>
                    <th className="text-right font-medium px-3 py-2">对 / 错</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((row) => (
                    <tr key={row.at} className="border-t border-[#2a261f]">
                      <td className="px-3 py-2 text-[#cfc6b8]">
                        {new Date(row.at).toLocaleString()}
                      </td>
                      <td className="px-3 py-2 text-right">{row.duration}s</td>
                      <td className="px-3 py-2 text-right text-[#3dd68c]">
                        {row.cpm}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {row.accuracy.toFixed(1)}%
                      </td>
                      <td className="px-3 py-2 text-right">
                        {row.correct} / {row.wrong}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function PassageView({ target, typed }: { target: string; typed: string }) {
  const targetChars = charsOf(target);
  const typedChars = charsOf(typed);

  return (
    <p className="passage">
      {targetChars.map((character, index) => {
        let className = "pending";
        if (index < typedChars.length) {
          className = typedChars[index] === character ? "ok" : "bad";
        } else if (index === typedChars.length) {
          className = "cur blink";
        }
        return (
          <span key={`${index}-${character}`} className={className}>
            {character}
          </span>
        );
      })}
    </p>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#2a261f] bg-[#161411] px-4 py-3">
      <p className="text-[11px] uppercase tracking-wide text-[#a39a8c]">{label}</p>
      <p className="text-2xl font-semibold tabular-nums mt-0.5">{value}</p>
    </div>
  );
}

function ResultPanel({
  result,
  onRetry,
}: {
  result: TestResult;
  onRetry: () => void;
}) {
  return (
    <section className="rounded-2xl border border-[#2a261f] bg-[#161411] p-6 mb-10">
      <p className="text-sm text-[#a39a8c] mb-1">时间到</p>
      <div className="flex flex-wrap items-end gap-8 mb-5">
        <div>
          <p className="text-5xl font-semibold text-[#3dd68c] tabular-nums">
            {result.cpm}
          </p>
          <p className="text-sm text-[#a39a8c] mt-1">正确字 / 分钟（CPM）</p>
        </div>
        <div>
          <p className="text-3xl font-semibold tabular-nums">
            {result.accuracy.toFixed(1)}%
          </p>
          <p className="text-sm text-[#a39a8c] mt-1">准确率</p>
        </div>
        <div>
          <p className="text-3xl font-semibold tabular-nums">
            {result.correct}
            <span className="text-[#a39a8c] text-xl"> / {result.wrong}</span>
          </p>
          <p className="text-sm text-[#a39a8c] mt-1">正确 / 错误</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="px-4 py-2 rounded-lg bg-[#d45d32] text-white text-sm hover:bg-[#c44f26] transition-colors"
      >
        再来一次
      </button>
    </section>
  );
}

function formatTime(ms: number) {
  const total = Math.ceil(ms / 1000);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
