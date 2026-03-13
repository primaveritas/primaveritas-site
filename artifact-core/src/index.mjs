/*
Prima Veritas Artifact Engine
Module: Core Entry Point

Description:
Coordinates artifact generation by executing the canonical pipeline:

CSV contract validation
→ normalization
→ deterministic sort
→ artifact bundle generation

This file exposes the generateArtifact() function used by the CLI,
website demo surface, and enterprise deployments.

Artifact Core Version: 1.0.0
*/

import { parseCsvStrict } from "./contracts/csv_contract.mjs";
import { sortRecordsDeterministically } from "./normalize/normalize_csv.mjs";
import { buildBundle } from "./bundle/build_bundle.mjs";

export function generateArtifact(csvText) {
  const parsed = parseCsvStrict(csvText);
  const sorted = sortRecordsDeterministically(parsed);
  return buildBundle(sorted);
}