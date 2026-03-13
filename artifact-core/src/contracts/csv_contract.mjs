/*
Prima Veritas Artifact Engine
Module: CSV Contract Enforcement

Description:
Implements the canonical CSV contract for artifact generation.

Responsibilities:
• enforce exact header structure
• validate column ordering
• normalize line endings
• remove trailing blank lines
• enforce UTF-8 BOM stripping
• trim outer whitespace
• validate required fields and length limits
• canonicalize timestamps
• assign deterministic row_index

Failure Philosophy:
Invalid input fails hard with explicit validation errors.

Deterministic Guarantees:
• strict header matching
• no implicit parsing
• stable row indexing
• deterministic record mapping

Artifact Core Version: 1.0.0
*/

import { canonicalizeTimestamp } from "../normalize/timestamp.mjs";

export const CSV_CONTRACT_VERSION = "1.0.0";

export const REQUIRED_HEADER = [
  "timestamp",
  "stream_id",
  "event_type",
  "actor",
  "object",
  "notes",
];

export function stripUtf8Bom(s) {
  if (typeof s !== "string") throw new TypeError("stripUtf8Bom: string required");
  return s.charCodeAt(0) === 0xfeff ? s.slice(1) : s;
}

export function canonicalizeLineEndings(s) {
  // CRLF -> LF, CR -> LF (defensive)
  return s.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

export function removeTrailingBlankLines(s) {
  // remove trailing blank lines only
  return s.replace(/\n+$/g, "");
}

export function splitLines(s) {
  // assumes canonical LF endings
  return s.length === 0 ? [] : s.split("\n");
}

export function parseCsvStrict(csvText) {
  if (typeof csvText !== "string") throw new TypeError("parseCsvStrict: input must be string");

  let s = stripUtf8Bom(csvText);
  s = canonicalizeLineEndings(s);
  s = removeTrailingBlankLines(s);

  const lines = splitLines(s);
  if (lines.length === 0) {
    throw new Error("CSV must contain a header row");
  }

  // No trimming of header cells beyond exact match requirement
  const headerCells = lines[0].split(",");
  validateHeaderExact(headerCells);

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];

    // allow empty lines inside? Spec only says remove trailing blank lines.
    // If an internal blank line occurs, fail hard to avoid ambiguity.
    if (line.trim() === "") {
      throw new Error(`Blank line encountered at CSV line ${i + 1}`);
    }

    const cells = line.split(",");
    if (cells.length !== REQUIRED_HEADER.length) {
      throw new Error(
        `CSV row has wrong column count at line ${i + 1}: expected ${REQUIRED_HEADER.length}, got ${cells.length}`
      );
    }

    const record = mapAndValidateRecord(cells, i - 1); // row_index starts at 0 for first data row
    rows.push(record);
  }

  return rows;
}

export function validateHeaderExact(headerCells) {
  if (!Array.isArray(headerCells)) throw new TypeError("validateHeaderExact: array required");

  if (headerCells.length !== REQUIRED_HEADER.length) {
    throw new Error(
      `Header has wrong column count: expected ${REQUIRED_HEADER.length}, got ${headerCells.length}`
    );
  }

  for (let i = 0; i < REQUIRED_HEADER.length; i++) {
    if (headerCells[i] !== REQUIRED_HEADER[i]) {
      throw new Error(
        `Header mismatch at column ${i + 1}: expected '${REQUIRED_HEADER[i]}', got '${headerCells[i]}'`
      );
    }
  }
}

function trimOuterWhitespace(s) {
  // Trim leading/trailing only. Do not modify internal spacing.
  return s.trim();
}

function mapAndValidateRecord(cells, rowIndex) {
  // Step 2 — Trim Outer Whitespace on all fields
  const timestampRaw = trimOuterWhitespace(cells[0]);
  const stream_id = trimOuterWhitespace(cells[1]);
  const event_type = trimOuterWhitespace(cells[2]);
  const actor = trimOuterWhitespace(cells[3]);
  const object = trimOuterWhitespace(cells[4]);
  const notes = trimOuterWhitespace(cells[5] ?? "");

  // Required checks
  if (timestampRaw.length === 0) throw new Error(`Missing required field 'timestamp' at row_index ${rowIndex}`);
  if (stream_id.length === 0) throw new Error(`Missing required field 'stream_id' at row_index ${rowIndex}`);
  if (event_type.length === 0) throw new Error(`Missing required field 'event_type' at row_index ${rowIndex}`);
  if (actor.length === 0) throw new Error(`Missing required field 'actor' at row_index ${rowIndex}`);
  if (object.length === 0) throw new Error(`Missing required field 'object' at row_index ${rowIndex}`);

  // Max lengths
  if (stream_id.length > 128) throw new Error(`stream_id exceeds 128 chars at row_index ${rowIndex}`);
  if (event_type.length > 128) throw new Error(`event_type exceeds 128 chars at row_index ${rowIndex}`);
  if (actor.length > 256) throw new Error(`actor exceeds 256 chars at row_index ${rowIndex}`);
  if (object.length > 256) throw new Error(`object exceeds 256 chars at row_index ${rowIndex}`);
  if (notes.length > 2000) throw new Error(`notes exceeds 2000 chars at row_index ${rowIndex}`);

  // Timestamp canonicalization (Step 3)
  const timestamp_utc = canonicalizeTimestamp(timestampRaw);

  return {
    timestamp_utc,
    stream_id,
    event_type,
    actor,
    object,
    notes: notes.length === 0 ? "" : notes,
    row_index: rowIndex,
  };
}