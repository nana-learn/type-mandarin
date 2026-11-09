import assert from "node:assert/strict";
import { test } from "node:test";
import { findIn, neighborIn, pickRandom, preferUnfinished } from "./pool.ts";

const pool = [
  { id: "a", title: "甲" },
  { id: "b", title: "乙" },
  { id: "c", title: "丙" },
];

test("pickRandom avoids the recent ids when another passage remains", () => {
  const picked = pickRandom(pool, ["a", "b"]);
  assert.equal(picked?.id, "c");
});

test("preferUnfinished keeps only new passages until all are done", () => {
  assert.deepEqual(preferUnfinished(pool, ["a", "c"]).map((item) => item.id), ["b"]);
  assert.equal(preferUnfinished(pool, ["a", "b", "c"]).length, 3);
});

test("neighborIn wraps and ignores a drill suffix", () => {
  assert.equal(neighborIn(pool, "a__drill", -1)?.id, "c");
  assert.equal(neighborIn(pool, "c", 1)?.id, "a");
  assert.equal(findIn(pool, "b")?.title, "乙");
});
