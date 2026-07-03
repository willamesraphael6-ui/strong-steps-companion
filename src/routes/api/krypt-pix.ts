import { createFileRoute } from "@tanstack/react-router";

const KRYPT_URL = "https://kryptgateway.netlify.app/api/gateway/pix-create";

export const Route = createFileRoute("/api/krypt-pix")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const ci = process.env.KRYPT_CI;
        const cs = process.env.KRYPT_CS;
        if (!ci || !cs)
          return new Response("Krypt not configured", { status: 500 });
        const body = (await request.json()) as {
          amount?: number;
          payerName?: string;
          payerDocument?: string;
          description?: string;
        };
        const upstream = await fetch(KRYPT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ci,
            cs,
          },
          body: JSON.stringify({
            amount: body.amount ?? 29.9,
            payerName: body.payerName || "Atleta Passos Fortes",
            payerDocument: body.payerDocument || "00000000000",
            description: body.description || "Passos Fortes PRO — assinatura mensal",
          }),
        });
        const text = await upstream.text();
        return new Response(text, {
          status: upstream.status,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});