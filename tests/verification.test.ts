import assert from "node:assert/strict";
import test from "node:test";
import { createSecureToken, tokenHash, valueHash } from "../lib/verification";

test("verification tokens are high entropy, URL safe and only persisted as hashes", () => {
  const first = createSecureToken();
  const second = createSecureToken();
  assert.match(first, /^[A-Za-z0-9_-]{43}$/);
  assert.notEqual(first, second);
  assert.match(tokenHash(first), /^[a-f0-9]{64}$/);
  assert.notEqual(tokenHash(first), first);
});

test("field hashes change when a confirmed value changes", () => {
  assert.notEqual(valueHash(30), valueHash(40));
  assert.equal(valueHash({ monday: true }), valueHash({ monday: true }));
});
