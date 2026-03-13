/*
Prima Veritas Artifact Engine
Module: Timestamp Canonicalization

Description:
Validates and canonicalizes ISO 8601 timestamps to canonical UTC format.

Responsibilities:
• enforce ISO 8601 timestamp structure
• require explicit timezone information
• reject ambiguous or locale-based formats
• preserve millisecond precision if provided
• convert timestamps to canonical UTC representation

Deterministic Guarantees:
• strict format validation
• stable UTC output format
• identical canonical output for identical logical timestamps
• no implicit timezone assumptions

Artifact Core Version: 1.0.0
*/

const ISO_REGEX =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?(Z|[+-]\d{2}:\d{2})$/;

export function canonicalizeTimestamp(input) {
  if (typeof input !== "string") {
    throw new TypeError("timestamp must be string");
  }

  if (!ISO_REGEX.test(input)) {
    throw new Error(
      "Invalid timestamp format. Must be ISO 8601 with seconds and timezone."
    );
  }

  const date = new Date(input);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid timestamp value");
  }

  const milliseconds = input.includes(".")
    ? input.match(/\.(\d{1,3})/)[1].padEnd(3, "0")
    : null;

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const seconds = String(date.getUTCSeconds()).padStart(2, "0");

  let base = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;

  if (milliseconds) {
    base += `.${milliseconds}`;
  }

  return base + "Z";
}