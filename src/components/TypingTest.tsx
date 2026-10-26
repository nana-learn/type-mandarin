"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { charsOf } from "@/lib/scoring";
import {
  LEVELS,
  LEVEL_LABELS,
  randomPrompt,
  readLevelFromUrl,
  writeLevelToUrl,
  type Level,
} from "@/lib/texts";
import { playSound, playFinishSound, initAudio } from "@/lib/sounds";

export default function TypingTest() {
  const [level, setLevel] = useState<Level>("hsk1");
  const [target, setTarget] = useState("");
  const [typed, setTyped] = useState("");
  const [runId, setRunId] = useState(0);

  const [soundEnabled, setSoundEnabled] = useState(true);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const composingRef = useRef(false);

  // Save sound preference to local storage
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("soundEnabled", String(soundEnabled));
    }
  }, [soundEnabled]);

  const restart = useCallback((nextLevel = level) => {
    setLevel(nextLevel);
    writeLevelToUrl(nextLevel);
    setTarget(randomPrompt(nextLevel));
    setTyped("");
    setRunId((id) => id + 1);
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [level]);

  useEffect(() => {
    const fromUrl = readLevelFromUrl();
    setLevel(fromUrl);
    writeLevelToUrl(fromUrl);
    setTarget(randomPrompt(fromUrl));
    
    // Initialize audio context on first load
    initAudio();
    
    // Check local storage for sound preference
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem("soundEnabled");
      if (saved !== null) {
        setSoundEnabled(saved === "true");
      }
    }
  }, []);

  useEffect(() => {
    if (!target || !typed || !soundEnabled) return;
    const targetChars = charsOf(target);
    const typedChars = charsOf(typed);
    
    // Play sound for last typed character
    if (typedChars.length > 0) {
      const lastTypedIndex = typedChars.length - 1;
      if (lastTypedIndex < targetChars.length) {
        if (typedChars[lastTypedIndex] === targetChars[lastTypedIndex]) {
          playSound("correct");
        } else {
          playSound("wrong");
        }
      }
    }
    
    // Finish passage and play success sound
    if (typedChars.length >= targetChars.length) {
      playFinishSound();
      setTimeout(() => restart(), 300);
    }
  }, [typed, restart]);

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
        initAudio();
        restart();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [restart]);

  const syncTyped = () => {
    if (composingRef.current) return;
    setTyped(inputRef.current?.value ?? "");
  };

  const toggleSound = () => setSoundEnabled(prev => !prev);

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
              <p className="text-[11px] text-[#a39a8c] leading-none">汉字打字练习</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleSound}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                soundEnabled
                  ? "bg-[#d45d32]/20 text-[#d45d32] border border-[#d45d32]/30"
                  : "text-[#6d655b] hover:text-[#a39a8c]"
              }`}
              title={soundEnabled ? "Disable sound effects" : "Enable sound effects"}
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                {soundEnabled ? (
                  <>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </>
                ) : (
                  <>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zM17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                  </>
                )}
              </svg>
              <span>{soundEnabled ? "声音" : "静音"}</span>
            </button>
            <a
              href="https://github.com/nana-learn/type-mandarin"
              className="text-xs text-[#a39a8c] hover:text-white transition-colors"
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
                onClick={() => restart(id)}
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
          onClick={() => {
            initAudio();
            inputRef.current?.focus();
          }}
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
            placeholder="请开启中文输入法，在此输入……"
            className="w-full resize-none rounded-2xl border border-[#2a261f] bg-[#12100d] px-4 py-3 text-xl leading-relaxed text-[#f4efe6] placeholder:text-[#6d655b] outline-none focus:border-[#d45d32]"
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

        <div className="flex items-center justify-between gap-3 text-sm text-[#a39a8c]">
          <p>用拼音、五笔或其他输入法打出段落中的汉字。Esc 换一段同级短文。</p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#7d766a]">{soundEnabled ? "声音已开启" : "已静音"}</span>
            <button
              type="button"
              onClick={() => {
                initAudio();
                restart();
              }}
              className="shrink-0 px-3 py-1.5 rounded-lg border border-[#2a261f] hover:text-white hover:border-[#d45d32] transition-colors"
            >
              换一段
            </button>
          </div>
        </div>
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
