import { createFileRoute } from "@tanstack/react-router";
import { generateText } from "ai";
import {
  createLovableAiGatewayProvider,
  requireLovableApiKey,
} from "@/lib/ai-gateway.server";

export const Route = createFileRoute("/api/lesson")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { language, topic } = (await request.json()) as {
          language?: string;
          topic?: string;
        };
        if (!language)
          return new Response("language required", { status: 400 });
        const key = requireLovableApiKey();
        const gateway = createLovableAiGatewayProvider(key);

        const prompt = `Gere uma micro-lição de ${language} para falante de português brasileiro. Tema: ${
          topic || "frases essenciais do dia a dia"
        }.

Responda APENAS JSON válido, sem markdown:
{
  "title": "string curto",
  "phrases": [{ "target": "frase em ${language}", "pt": "tradução PT", "pron": "pronúncia aproximada" }],
  "quiz": [{ "q": "pergunta em português", "options": ["a","b","c","d"], "answer": 0 }]
}

Regras: 5 frases úteis; 3 quizzes com 4 opções cada; "answer" é índice 0-3 correto.`;

        try {
          const { text } = await generateText({
            model: gateway("google/gemini-3-flash-preview"),
            prompt,
          });
          const clean = text
            .replace(/^```(?:json)?/i, "")
            .replace(/```$/, "")
            .trim();
          const s = clean.indexOf("{");
          const e = clean.lastIndexOf("}");
          const json = s >= 0 && e >= 0 ? clean.slice(s, e + 1) : clean;
          return new Response(json, {
            headers: { "Content-Type": "application/json" },
          });
        } catch (err) {
          return new Response(
            JSON.stringify({ error: (err as Error).message }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});