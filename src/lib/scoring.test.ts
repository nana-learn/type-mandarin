import assert from "node:assert/strict";
import { test } from "node:test";
import {
  missedSentences,
  noteRun,
  scoreTyped,
  seedStats,
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

test("noteRun keeps the best score and seedStats ignores an existing record", () => {
  const once = noteRun({}, "hsk1", 40, 90);
  const twice = noteRun(once, "hsk1", 55, 80);
  assert.equal(twice.hsk1.runs, 2);
  assert.equal(twice.hsk1.bestCpm, 55);
  assert.equal(twice.hsk1.bestAccuracy, 90);
  assert.equal(seedStats(twice, []).hsk1.bestCpm, 55);
});
