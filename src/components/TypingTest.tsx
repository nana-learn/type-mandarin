"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  charactersPerMinute,
  charsOf,
  loadHistory,
  saveHistory,
  scoreTyped,
  type TestResult,
} from "@/lib/scoring";
import {
  LEVELS,
  LEVEL_LABELS,
  randomPrompt,
  readLevelFromUrl,
  writeLevelToUrl,
  type Level,
} from "@/lib/texts";

type Status = "idle" | "running" | "done";

export default function TypingTest() {
  const [level, setLevel] = useState<Level>("hsk1");
  const [target, setTarget] = useState("");
  const [typed, setTyped] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [history, setHistory] = useState<TestResult[]>([]);
  const [runId, setRunId] = useState(0);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const composingRef = useRef(false);
  const finishedRef = useRef(false);

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setStatus("done");
    const elapsed = startedAt ? Date.now() - startedAt : 0;
    const scored = scoreTyped(target, inputRef.current?.value ?? typed);
    const result: TestResult = {
      at: Date.now(),
      duration: Math.max(1, Math.round(elapsed / 1000)),
      level,
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
  }, [level, startedAt, target, typed]);

  const restart = useCallback(
    (nextLevel = level) => {
      finishedRef.current = false;
      setLevel(nextLevel);
      writeLevelToUrl(nextLevel);
      setTarget(randomPrompt(nextLevel));
      setTyped("");
      setStatus("idle");
      setStartedAt(null);
      setRunId((id) => id + 1);
      setTimeout(() => inputRef.current?.focus(), 0);
    },
    [level],
  );

  const changeLevel = (nextLevel: Level) => {
    restart(nextLevel);
  };

  useEffect(() => {
    const fromUrl = readLevelFromUrl();
    setLevel(fromUrl);
    writeLevelToUrl(fromUrl);
    setTarget(randomPrompt(fromUrl));
    setHistory(loadHistory());
  }, []);

  useEffect(() => {
    if (status !== "running") return;
    const typedLen = charsOf(typed).length;
    const targetLen = charsOf(target).length;
    if (targetLen > 0 && typedLen >= targetLen) finish();
  }, [finish, status, target, typed]);

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
    }
    setTyped(value);
  };

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
        <div className="flex flex-col gap-3 mb-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-[#a39a8c] w-10">等级</span>
            {LEVELS.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => changeLevel(id)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
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
            每次打开 {LEVEL_LABELS[level]} 链接都会随机一篇该等级的段落。
          </p>
        </div>

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
            placeholder="请开启中文输入法，在此输入……"
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
          <p>用拼音、五笔或其他输入法打出段落中的汉字。Esc 换一段同级短文。</p>
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
                    <th className="text-left font-medium px-3 py-2">等级</th>
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
                      <td className="px-3 py-2">
                        {row.level ? LEVEL_LABELS[row.level as Level] ?? row.level : "—"}
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

function ResultPanel({
  result,
  onRetry,
}: {
  result: TestResult;
  onRetry: () => void;
}) {
  return (
    <section className="rounded-2xl border border-[#2a261f] bg-[#161411] p-6 mb-10">
      <p className="text-sm text-[#a39a8c] mb-1">完成</p>
      <div className="flex flex-wrap items-end gap-8 mb-5">
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


