/*
Prima Veritas Artifact Engine
Module: SHA-256 Hashing

Description:
Computes the deterministic artifact verification hash.

Responsibilities:
• generate SHA-256 digest from canonical events.jsonl
• enforce UTF-8 byte input
• return lowercase hexadecimal hash

Deterministic Guarantees:
• no salting
• no randomness
• no implicit encoding
• identical input produces identical hash

Artifact Core Version: 1.0.0
*/

export async function sha256(message) {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);

  const hashBuffer = await crypto.subtle.digest("SHA-256", data);

  const hashArray = Array.from(new Uint8Array(hashBuffer));

  const hashHex = hashArray
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");

  return hashHex;
}