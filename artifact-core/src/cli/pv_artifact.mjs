/*
Prima Veritas Artifact Engine
Module: CLI Transport Surface

Description:
Command-line interface used to generate deterministic artifact bundles
from CSV event logs.

Responsibilities:
• read CSV input as UTF-8
• invoke the artifact engine
• package the deterministic artifact bundle
• produce a byte-stable ZIP archive
• print artifact metadata to stdout

Deterministic ZIP constraints:
• STORE mode (no compression)
• fixed epoch timestamp
• fixed file ordering
• no extended metadata

The CLI does not implement deterministic logic.
All validation, normalization, sorting, and hashing occur in the artifact engine.

Artifact Core Version: 1.0.0
*/

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import yazl from "yazl";
import { generateArtifact } from "../index.mjs";

function fail(message) {
  process.stderr.write(message + "\n");
  process.exit(1);
}

function parseArgs(argv) {
  const args = argv.slice(2);

  if (args.length === 0) {
    fail("Usage: pv-artifact <input.csv> [--out <output.zip>]");
  }

  const inputPath = args[0];
  let outputPath = "bundle.zip";

  for (let i = 1; i < args.length; i++) {
    if (args[i] === "--out") {
      outputPath = args[i + 1];
      i++;
    }
  }

  return { inputPath, outputPath };
}

async function main() {
  const { inputPath, outputPath } = parseArgs(process.argv);

  let csv;
  try {
    csv = fs.readFileSync(inputPath, "utf8");
  } catch {
    fail("Failed to read input file.");
  }

  let artifact;
  try {
    artifact = generateArtifact(csv);
  } catch (err) {
    process.stderr.write(
      JSON.stringify(err?.details || { error: err.message }, null, 2) + "\n"
    );
    process.exit(1);
  }

  const zip = new yazl.ZipFile();

  const fixedDate = new Date(0); // 1970-01-01T00:00:00Z

  zip.addBuffer(
    Buffer.from(JSON.stringify(artifact.manifest, null, 2), "utf8"),
    "manifest.json",
    { compress: false, mtime: fixedDate }
  );

  zip.addBuffer(
    Buffer.from(artifact.eventsJsonl, "utf8"),
    "events.jsonl",
    { compress: false, mtime: fixedDate }
  );

  zip.addBuffer(
    Buffer.from(JSON.stringify(artifact.verifyReport, null, 2), "utf8"),
    "verify_report.json",
    { compress: false, mtime: fixedDate }
  );

  zip.end();

  const outputStream = fs.createWriteStream(outputPath);
  zip.outputStream.pipe(outputStream);

  outputStream.on("close", () => {
    process.stdout.write(
      `Artifact hash: ${artifact.manifest.artifact_hash}\n`
    );
    process.stdout.write(
      `Event count: ${artifact.manifest.event_count}\n`
    );
    process.stdout.write(
      `Output: ${outputPath}\n`
    );
  });
}

main();