/*
Prima Veritas Artifact Engine
Module: Artifact Bundle Builder

Description:
Constructs the canonical artifact bundle returned by the artifact engine.

Responsibilities:
• render deterministic JSONL ledger
• compute SHA-256 artifact hash
• construct manifest metadata
• produce structured verification report

Outputs:
manifest
events.jsonl
verify_report

Deterministic guarantees:
• stable JSON field ordering
• LF-only JSONL rendering
• no trailing newline
• artifact hash computed from canonical events.jsonl

Artifact Core Version: 1.0.0
*/

import { sha256 } from "../hash/sha256.mjs";

export function renderJsonl(records) {
  if (!Array.isArray(records)) {
    throw new TypeError("renderJsonl: array required");
  }

  const lines = records.map((r) =>
    JSON.stringify({
      timestamp_utc: r.timestamp_utc,
      stream_id: r.stream_id,
      event_type: r.event_type,
      actor: r.actor,
      object: r.object,
      notes: r.notes,
      row_index: r.row_index,
    })
  );

  return lines.join("\n"); // no trailing newline
}

export function buildBundle(records) {
  const eventsJsonl = renderJsonl(records);
  const artifact_hash = sha256(eventsJsonl);

  const manifest = {
    artifact_core_version: "1.0.0",
    event_count: records.length,
    artifact_hash,
  };

  const verifyReport = {
    status: "deterministic",
    event_count: records.length,
    artifact_hash,
  };

  return {
    manifest,
    eventsJsonl,
    verifyReport,
  };
}