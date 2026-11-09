import assert from "node:assert/strict";
import { test } from "node:test";
import {
  missedSentenceList,
  missedSentences,
  nextStreak,
  noteDaily,
  noteRun,
  rememberSentences,
  scoreTyped,
  seedStats,
  shiftDay,
  stopAtFirstMistake,
} from "./scoring.ts";

test("scoreTyped counts matches and misses", () => {
  const score = scoreTyped("你好", "你号");
  assert.equal(score.correct, 1);
  assert.equal(score.wrong, 1);
  assert.equal(score.accuracy, 50);
});

test("stopAtFirstMistake keeps the error and drops what follows", () => {
  assert.equal(stopAtFirstMistake(["你", "好", "吗"], ["你", "号", "吗"]), "你号");
  assert.equal(stopAtFirstMistake(["你", "好"], ["你", "好"]), "你好");
});

test("missedSentences keeps only the sentence with a mismatch", () => {
  assert.equal(missedSentences("我爱家。今天很热。", "我爱家。今天很冷。"), "今天很热。");
  assert.equal(missedSentences("只有一句。", "只有一句。"), null);
});

test("noteDaily resets on a new day and keeps counting today", () => {
  const at = new Date(2026, 2, 20, 12).getTime();
  const first = noteDaily(null, at);
  const second = noteDaily(first, at);
  assert.equal(second.count, 2);
  assert.equal(noteDaily(second, at + 24 * 60 * 60 * 1000).count, 1);
});

test("nextStreak continues yesterday and resets after a gap", () => {
  const today = "2026-03-20";
  const yesterday = shiftDay(today, -1);
  const at = new Date(2026, 2, 20, 12).getTime();
  assert.equal(nextStreak({ count: 4, lastDay: yesterday }, at).count, 5);
  assert.equal(nextStreak({ count: 4, lastDay: today }, at).count, 4);
  assert.equal(nextStreak({ count: 4, lastDay: shiftDay(today, -3) }, at).count, 1);
});

test("rememberSentences counts a repeated miss and keeps the newest time", () => {
  const once = rememberSentences([], "hsk1", ["今天很热。"], 1);
  const twice = rememberSentences(once, "hsk1", ["今天很热。", "我爱家。"], 2);
  assert.equal(twice.length, 2);
  assert.equal(twice.find((item) => item.text === "今天很热。")?.count, 2);
  assert.equal(missedSentenceList("我爱家。今天很热。", "我爱家。今天很冷。").join("|"), "今天很热。");
});

test("noteRun keeps the best score and seedStats ignores an existing record", () => {
  const once = noteRun({}, "hsk1", 40, 90);
  const twice = noteRun(once, "hsk1", 55, 80);
  assert.equal(twice.hsk1.runs, 2);
  assert.equal(twice.hsk1.bestCpm, 55);
  assert.equal(twice.hsk1.bestAccuracy, 90);
  assert.equal(seedStats(twice, []).hsk1.bestCpm, 55);
});
