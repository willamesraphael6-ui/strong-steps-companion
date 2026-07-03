import { createFileRoute } from "@tanstack/react-router";
import { requireLovableApiKey } from "@/lib/ai-gateway.server";

export const Route = createFileRoute("/api/tutor-call")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as {
          transcript?: string;
          history?: { role: "user" | "assistant"; content: string }[];
          imageDataUrl?: string;
          systemContext?: string;
        };
        if (!body.transcript) return new Response("transcript required", { status: 400 });
        const key = requireLovableApiKey();

        const system = `Você é "Coach PF", tutor de fitness em CHAMADA DE VOZ. Regras:
- Português BR, direto, conversacional. 1-2 frases MÁXIMO.
- Sem markdown, sem listas, sem emojis.
- Se enxergar imagem, comente rapidamente postura/execução do exercício se relevante.
${body.systemContext || ""}`;

        const userContent: Array<Record<string, unknown>> = [
          { type: "text", text: body.transcript },
        ];
        if (body.imageDataUrl) {
          userContent.push({
            type: "image_url",
            image_url: { url: body.imageDataUrl },
          });
        }

        const upstream = await fetch(
          "https://ai.gateway.lovable.dev/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${key}`,
              "Content-Type": "application/json",
              "X-Lovable-AIG-SDK": "fetch",
            },
            body: JSON.stringify({
              model: "google/gemini-3-flash-preview",
              messages: [
                { role: "system", content: system },
                ...(body.history || []).map((m) => ({
                  role: m.role,
                  content: m.content,
                })),
                { role: "user", content: userContent },
              ],
            }),
          },
        );
        if (!upstream.ok) {
          const t = await upstream.text().catch(() => "");
          return new Response(t || "AI error", { status: upstream.status });
        }
        const data = (await upstream.json()) as {
          choices?: { message?: { content?: string } }[];
        };
        const reply = data.choices?.[0]?.message?.content || "";
        return Response.json({ reply });
      },
    },
  },
});