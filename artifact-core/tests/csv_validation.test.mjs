import { parseCsvStrict } from "../src/contracts/csv_contract.mjs";

function assertEqual(a, b, message) {
  if (a !== b) throw new Error(message || `Assertion failed: ${a} !== ${b}`);
}

function assertThrows(fn, message) {
  let threw = false;
  try { fn(); } catch { threw = true; }
  if (!threw) throw new Error(message || "Expected throw");
}

const goodCsv = [
  "timestamp,stream_id,event_type,actor,object,notes",
  "2026-03-02T12:34:56Z,stream-1,CREATE,bryan,obj-1,hello",
  "2026-03-02T07:34:56-05:00,stream-1,UPDATE,bryan,obj-1, world ",
].join("\n");

const rows = parseCsvStrict(goodCsv);
assertEqual(rows.length, 2);
assertEqual(rows[0].timestamp_utc, "2026-03-02T12:34:56Z");
assertEqual(rows[1].timestamp_utc, "2026-03-02T12:34:56Z"); // offset conversion
assertEqual(rows[1].notes, "world"); // outer whitespace trimmed only

// Wrong header order
const badHeader = [
  "stream_id,timestamp,event_type,actor,object,notes",
  "stream-1,2026-03-02T12:34:56Z,CREATE,bryan,obj-1,hello",
].join("\n");

assertThrows(() => parseCsvStrict(badHeader), "Expected header mismatch");

// Missing required column (fewer columns)
const missingCol = [
  "timestamp,stream_id,event_type,actor,object",
  "2026-03-02T12:34:56Z,stream-1,CREATE,bryan,obj-1",
].join("\n");

assertThrows(() => parseCsvStrict(missingCol), "Expected column count failure");

// Blank internal line should fail
const blankLine = [
  "timestamp,stream_id,event_type,actor,object,notes",
  "",
  "2026-03-02T12:34:56Z,stream-1,CREATE,bryan,obj-1,hello",
].join("\n");

assertThrows(() => parseCsvStrict(blankLine), "Expected blank line failure");

console.log("csv_validation.test.mjs passed");