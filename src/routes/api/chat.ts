import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import {
  createLovableAiGatewayProvider,
  requireLovableApiKey,
} from "@/lib/ai-gateway.server";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as {
          messages?: UIMessage[];
          systemContext?: string;
        };
        const messages = body.messages;
        if (!Array.isArray(messages)) {
          return new Response("messages required", { status: 400 });
        }
        const key = requireLovableApiKey();
        const gateway = createLovableAiGatewayProvider(key);

        const system = `Você é "Coach PF" — tutor pessoal de fitness, nutrição e idiomas dentro do app Passos Fortes.
Regras:
- Responda SEMPRE em português do Brasil, tom direto, motivador, sem enrolação.
- Respostas curtas por padrão (2-5 frases). Só se estenda quando o usuário pedir plano/lista.
- Você pode: montar planos de treino, sugerir refeições/cardápios, dar dicas de forma, analisar imagens (refeições, postura), ensinar 10 idiomas (Inglês, Espanhol, Francês, Alemão, Italiano, Português, Japonês, Coreano, Mandarim, Árabe).
- Nunca invente contagem de passos ou dados do usuário. Pergunte se precisar.
- Se receber imagem, descreva o que vê e dê feedback prático.
${body.systemContext ? `\nContexto do usuário: ${body.systemContext}` : ""}`;

        const result = streamText({
          model: gateway("google/gemini-3-flash-preview"),
          system,
          messages: await convertToModelMessages(messages),
        });

        return result.toUIMessageStreamResponse();
      },
    },
  },
});