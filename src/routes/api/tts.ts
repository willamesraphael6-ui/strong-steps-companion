import { createFileRoute } from "@tanstack/react-router";
import { requireLovableApiKey } from "@/lib/ai-gateway.server";

export const Route = createFileRoute("/api/tts")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { text, voice = "alloy" } = (await request.json()) as {
          text?: string;
          voice?: string;
        };
        if (!text) return new Response("text required", { status: 400 });
        const key = requireLovableApiKey();
        const upstream = await fetch(
          "https://ai.gateway.lovable.dev/v1/audio/speech",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${key}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "openai/gpt-4o-mini-tts",
              input: text,
              voice,
              response_format: "mp3",
            }),
          },
        );
        if (!upstream.ok) {
          const msg = await upstream.text().catch(() => "");
          return new Response(msg || "tts failed", { status: upstream.status });
        }
        return new Response(upstream.body, {
          headers: {
            "Content-Type": "audio/mpeg",
            "Cache-Control": "no-store",
          },
        });
      },
    },
  },
});