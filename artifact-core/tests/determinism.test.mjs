import { generateArtifact } from "../src/index.mjs";

function assertEqual(a, b, message) {
  if (a !== b) throw new Error(message || `Assertion failed`);
}

// Distinct timestamps
const csvA = [
  "timestamp,stream_id,event_type,actor,object,notes",
  "2026-03-02T12:34:56Z,s1,A,bryan,o1,x",
  "2026-03-03T12:34:56Z,s1,B,bryan,o1,y",
].join("\n");

const csvB = [
  "timestamp,stream_id,event_type,actor,object,notes",
  "2026-03-03T12:34:56Z,s1,B,bryan,o1,y",
  "2026-03-02T12:34:56Z,s1,A,bryan,o1,x",
].join("\n");

const a1 = generateArtifact(csvA);
const b1 = generateArtifact(csvB);

console.log("A hash:", a1.manifest.artifact_hash);
console.log("B hash:", b1.manifest.artifact_hash);

assertEqual(a1.manifest.artifact_hash, b1.manifest.artifact_hash);

// identical input
const a2 = generateArtifact(csvA);
assertEqual(a1.manifest.artifact_hash, a2.manifest.artifact_hash);

console.log("determinism.test.mjs passed");