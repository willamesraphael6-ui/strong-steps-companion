import { createFileRoute } from "@tanstack/react-router";
import { requireLovableApiKey } from "@/lib/ai-gateway.server";

export const Route = createFileRoute("/api/stt")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = requireLovableApiKey();
        const inbound = await request.formData();
        const file = inbound.get("file") as File | Blob | null;
        if (!file) {
          return new Response("file required", { status: 400 });
        }
        const fd = new FormData();
        const asFile = file as File;
        const filename =
          typeof asFile.name === "string" && asFile.name.includes(".")
            ? asFile.name
            : "recording.webm";
        fd.append("file", file, filename);
        fd.append("model", "openai/gpt-4o-mini-transcribe");
        const upstream = await fetch(
          "https://ai.gateway.lovable.dev/v1/audio/transcriptions",
          {
            method: "POST",
            headers: { Authorization: `Bearer ${key}` },
            body: fd,
          },
        );
        const body = await upstream.text();
        return new Response(body, {
          status: upstream.status,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});