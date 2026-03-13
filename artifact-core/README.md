# Prima Veritas Artifact Engine

The Prima Veritas Artifact Engine converts structured operational records into a deterministic, cryptographically sealed artifact bundle.

The system transforms CSV event logs into a canonical event ledger with a stable SHA-256 verification hash.

Identical input will always produce identical artifact bundles across machines and environments.

---

## Deterministic Guarantees

The artifact engine enforces strict deterministic behavior.

Identical input produces:

- identical event ordering
- identical JSONL ledger
- identical artifact bundle
- identical verification hash
- identical ZIP archive bytes

There is no randomness, implicit parsing, or silent mutation.

---

## Quick Start

From the repository root:

node src/cli/pv_artifact.mjs examples/sample.csv

Example output:

Artifact hash: <sha256>
Event count: <n>
Output: bundle.zip

---

## CLI Usage

pv-artifact <input.csv> [--out <output.zip>]

Example:

node src/cli/pv_artifact.mjs examples/sample.csv --out artifact.zip

The CLI performs:

1. CSV contract validation
2. deterministic normalization
3. canonical event ordering
4. artifact bundle generation
5. SHA-256 verification

---

## Artifact Bundle Structure

The generated ZIP archive contains:

manifest.json
events.jsonl
verify_report.json

manifest.json  
Artifact metadata and verification hash.

events.jsonl  
Canonical event ledger produced by deterministic ordering.

verify_report.json  
Structured validation and integrity report.

---

## Repository Structure

src/
  contracts/       CSV contract enforcement
  normalize/       canonical normalization rules
  hash/            SHA-256 hashing
  bundle/          artifact bundle builder
  cli/             CLI transport surface

tests/             deterministic test fixtures
examples/          sample inputs

---

## Status

Artifact Core Version: 1.0.0

Deterministic behavior defined by the canonical specification is frozen.

Structural changes require a version bump.