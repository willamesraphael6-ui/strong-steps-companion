import { createFileRoute } from "@tanstack/react-router";
import { requireLovableApiKey } from "@/lib/ai-gateway.server";

type Kind = "food" | "body" | "posture";

const prompts: Record<Kind, string> = {
  food: `Você é nutricionista. Analise a imagem de comida. Responda EM JSON válido com o formato:
{"verdict":"pode comer" | "evite" | "moderado","can_eat":true|false,"calories_estimate":<numero>,"notes":"1-2 frases explicando o que é e por quê"}
Tom direto, português BR. Se não for comida, retorne can_eat:false e notes explicando.`,
  body: `Você é personal trainer. Analise a foto corporal (pessoa de pé). Responda EM JSON válido:
{"body_type":"ectomorfo|mesomorfo|endomorfo|misto","strengths":"pontos fortes visíveis","focus_areas":"áreas para focar","recommendations":"3 recomendações práticas em 1 frase cada, separadas por ' | '"}
Sem julgamento estético, foco em treino. Português BR.`,
  posture: `Você é coach de treino. Analise a postura/execução do exercício na imagem. Responda EM JSON válido:
{"verdict":"boa|corrigir|perigosa","notes":"1-2 frases: o que está bom e o que ajustar"}
Português BR, direto.`,
};

export const Route = createFileRoute("/api/analyze-image")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as {
          kind?: Kind;
          image?: string;
          mimeType?: string;
        };
        const kind = body.kind;
        if (!kind || !prompts[kind])
          return new Response("bad kind", { status: 400 });
        if (!body.image) return new Response("image required", { status: 400 });
        const key = requireLovableApiKey();

        const dataUrl = body.image.startsWith("data:")
          ? body.image
          : `data:${body.mimeType || "image/jpeg"};base64,${body.image}`;

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
                { role: "system", content: prompts[kind] },
                {
                  role: "user",
                  content: [
                    { type: "text", text: "Analise esta imagem." },
                    { type: "image_url", image_url: { url: dataUrl } },
                  ],
                },
              ],
              response_format: { type: "json_object" },
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
        const content = data.choices?.[0]?.message?.content || "{}";
        let parsed: Record<string, unknown> = {};
        try {
          parsed = JSON.parse(content);
        } catch {
          parsed = { notes: content };
        }
        return Response.json(parsed);
      },
    },
  },
});