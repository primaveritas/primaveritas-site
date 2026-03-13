Prima Veritas Artifact Engine Architecture

Overview

The artifact engine converts structured operational records into a deterministic historical artifact.

The system guarantees that identical input records always produce identical output artifacts, independent of machine or execution environment.

The artifact engine is designed as a deterministic subsystem within the Prima Veritas platform.

---

Pipeline

The artifact generation pipeline consists of five stages:

CSV Input
  → Contract Validation
  → Normalization
  → Deterministic Sort
  → Artifact Bundle
  → SHA-256 Verification

Each stage is strictly deterministic.

No randomness, implicit parsing, or environment-dependent behavior is allowed.

---

Stage 1 — CSV Contract Validation

Input CSV files must follow the canonical contract:

timestamp,stream_id,event_type,actor,object,notes

Validation rules include:

• UTF-8 encoding
• exact header order
• ISO-8601 timestamps with timezone
• no additional columns
• strict parsing with explicit failures

Invalid inputs produce structured validation errors.

---

Stage 2 — Normalization

Normalization prepares the event records for deterministic ordering.

Operations include:

• line ending normalization
• whitespace trimming
• timestamp canonicalization
• row index assignment

Timestamps are converted to canonical UTC format while preserving supplied precision.

---

Stage 3 — Deterministic Sorting

Records are ordered using a deterministic comparator:

(timestamp_utc ASC, row_index ASC)

This guarantees stable ordering even when multiple events share identical timestamps.

The sort comparator is explicitly defined to prevent engine or locale differences from affecting ordering.

---

Stage 4 — Artifact Bundle Generation

The artifact bundle contains three files:

manifest.json  
events.jsonl  
verify_report.json  

events.jsonl contains the canonical event ledger.

Each event includes:

timestamp_utc  
stream_id  
event_type  
actor  
object  
notes  
row_index

The manifest includes artifact metadata and verification information.

---

Stage 5 — SHA-256 Verification

The artifact hash is computed over the canonical events.jsonl byte sequence.

Properties:

• SHA-256
• lowercase hexadecimal encoding
• no salting
• no randomness

Identical input records therefore produce identical artifact hashes.

---

Deterministic ZIP Packaging

The CLI packages the artifact bundle into a deterministic ZIP archive.

Constraints:

• STORE mode (no compression)
• fixed file order
• fixed epoch timestamp
• no extended metadata

This ensures identical ZIP byte output across executions.

---

Module Structure

src/contracts/  
CSV contract validation

src/normalize/  
deterministic normalization and timestamp handling

src/hash/  
SHA-256 artifact hashing

src/bundle/  
artifact bundle construction

src/cli/  
command-line interface transport surface

tests/  
determinism and validation test suite

---

Design Principles

The artifact engine follows strict infrastructure design rules:

Determinism over convenience  
Explicit failure over implicit correction  
Stable interfaces over feature velocity  
Separation of core logic from service layers

The CLI, website demo, and enterprise deployments all use the same deterministic core.

---

Versioning

Artifact Core Version: 1.0.0

Behavior defined by the canonical specification is frozen.

Any change to:

• artifact schema
• normalization behavior
• sorting rules
• hash scope

requires a version bump.