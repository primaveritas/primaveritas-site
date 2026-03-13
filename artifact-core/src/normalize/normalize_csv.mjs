/*
Prima Veritas Artifact Engine
Module: Deterministic Record Ordering

Description:
Implements canonical event ordering for artifact generation.

Responsibilities:
• perform deterministic sorting of validated records
• compare canonical UTC timestamps explicitly
• use original row_index as a stable tie-breaker
• reassign canonical row_index after sorting

Deterministic Guarantees:
• stable comparator
• explicit ordering rules
• no locale or runtime-dependent sorting behavior
• reproducible ordering across environments

Artifact Core Version: 1.0.0
*/

export function sortRecordsDeterministically(records) {
  if (!Array.isArray(records)) {
    throw new TypeError("sortRecordsDeterministically: array required");
  }

  // clone to avoid mutation
  const copy = [...records];

  // Sort using original row_index as stable secondary key
  copy.sort((a, b) => {
    // Compare timestamp strings (already canonical UTC format)
    if (a.timestamp_utc < b.timestamp_utc) return -1;
    if (a.timestamp_utc > b.timestamp_utc) return 1;

    // Secondary key: original row_index
    if (a.row_index < b.row_index) return -1;
    if (a.row_index > b.row_index) return 1;

    return 0;
  });

  // Reassign canonical row_index after sort
  return copy.map((r, idx) => ({
    ...r,
    row_index: idx,
  }));
}