Prima Veritas Artifact Engine CLI

Overview

The pv-artifact CLI generates a deterministic artifact bundle from a CSV event log.

The CLI is a transport surface only.  
All deterministic behavior lives inside the artifact core.

---

Command

pv-artifact <input.csv> [--out <output.zip>]

---

Examples

Generate an artifact using the default output name:

node src/cli/pv_artifact.mjs examples/sample.csv

Output:

Artifact hash: <sha256>
Event count: <n>
Output: bundle.zip

---

Specify a custom output path:

node src/cli/pv_artifact.mjs examples/sample.csv --out artifact.zip

---

CLI Behavior

The CLI performs the following steps:

1. Reads the CSV input file as UTF-8
2. Passes the raw content to the artifact engine
3. Generates the deterministic artifact bundle
4. Writes a deterministic ZIP archive
5. Prints artifact metadata to stdout

The CLI does not modify artifact logic.

All validation, normalization, sorting, and hashing occur inside the artifact engine.

---

Deterministic ZIP Properties

The CLI produces byte-stable ZIP archives with the following constraints:

• STORE mode (no compression)  
• fixed file order  
• fixed epoch timestamp  
• no additional metadata  

Running the CLI twice on identical input will produce identical ZIP hashes.

---

Error Handling

Validation errors are printed as structured JSON to stderr.

Example failure output:

{
  "error": "Invalid timestamp format",
  "row": 12
}

The CLI exits with a non-zero status code on failure.

---

Artifact Contents

The generated ZIP archive contains:

manifest.json  
events.jsonl  
verify_report.json  

These files represent the canonical artifact bundle.

---

Integration

The same artifact engine powers:

• CLI usage  
• website demo surface  
• enterprise pilot deployments  

No separate logic paths exist.