import assert from "node:assert/strict";
import { test } from "node:test";
import { applyBackup, collectBackup, readBackup } from "./backup.ts";

test("readBackup rejects a file from another version", () => {
  assert.equal(readBackup({ version: 2, data: {} }), null);
  assert.equal(readBackup(null), null);
});

test("collectBackup and applyBackup round-trip the saved keys", () => {
  const store = new Map<string, string>([["soundMode", "errors"], ["type-mandarin-done", "{\"hsk1\":[\"a\"]}"] ]);
  const backup = collectBackup((key) => store.get(key) ?? null);
  const restored = new Map<string, string>();
  applyBackup(backup, (key, value) => {
    if (value === null) restored.delete(key);
    else restored.set(key, value);
  });
  assert.equal(restored.get("soundMode"), "errors");
  assert.equal(readBackup(backup)?.version, 1);
});
