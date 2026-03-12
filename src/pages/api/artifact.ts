import { generateArtifact } from "artifact-core/src/index.mjs";

export async function GET() {
  return new Response(
    JSON.stringify({
      api: "Prima Veritas Artifact Engine",
      status: "online"
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" }
    }
  );
}

export async function POST({ request }) {
  try {
    const csv = await request.text();

    const artifact = generateArtifact(csv);

    return new Response(
      JSON.stringify({
        artifact_hash: artifact.manifest.artifact_hash,
        event_count: artifact.manifest.event_count,
        manifest: artifact.manifest,
        verify_report: artifact.verifyReport
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: err.message || "Artifact generation failed"
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
