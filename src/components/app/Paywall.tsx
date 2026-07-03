import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "./Toast";
import type { LocalProfile } from "@/lib/profile-storage";

type PixResponse = {
  success?: boolean;
  data?: {
    id?: string;
    pixCode?: string;
    pixCopyPaste?: string;
    qrCode?: string;
    qrCodeBase64?: string;
    expiresAt?: string;
  };
  pixCode?: string;
  pixCopyPaste?: string;
  qrCode?: string;
  qrCodeBase64?: string;
  id?: string;
  transactionId?: string;
  expiresAt?: string;
  error?: string;
  message?: string;
};

export function Paywall({
  profile,
  onClose,
}: {
  profile: LocalProfile;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [pix, setPix] = useState<{
    code: string;
    qr?: string;
    id?: string;
  } | null>(null);

  useEffect(() => {
    // Check existing pending sub
    (async () => {
      const { data } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("profile_id", profile.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data?.pix_code) {
        setPix({ code: data.pix_code, qr: data.pix_qr ?? undefined, id: data.provider_ref ?? undefined });
      }
    })();
  }, [profile.id]);

  const gerarPix = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/krypt-pix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: 29.9,
          payerName: profile.name,
          description: `Passos Fortes PRO — ${profile.name}`,
        }),
      });
      const text = await res.text();
      let data: PixResponse = {};
      try { data = JSON.parse(text); } catch { /* keep empty */ }
      if (!res.ok) {
        toast(data.error || data.message || `Krypt erro ${res.status}`, "⚠️");
        console.error("Krypt", res.status, text);
        return;
      }
      const inner = data.data || data;
      const code = inner.pixCopyPaste || inner.pixCode || "";
      const qr = inner.qrCodeBase64 || inner.qrCode || undefined;
      const id = inner.id || (data as { transactionId?: string }).transactionId || undefined;
      if (!code) {
        toast("Krypt não retornou código PIX", "⚠️");
        console.error("Krypt response", data);
        return;
      }
      setPix({ code, qr, id });
      await supabase.from("subscriptions").insert({
        profile_id: profile.id,
        status: "pending",
        provider: "krypt",
        provider_ref: id ?? null,
        amount_cents: 2990,
        pix_code: code,
        pix_qr: qr ?? null,
        expires_at: inner.expiresAt || null,
      });
      toast("PIX gerado! Copia e cola pra pagar.", "💚");
    } catch (e) {
      console.error(e);
      toast("Falha ao gerar PIX", "⚠️");
    } finally {
      setLoading(false);
    }
  };

  const copy = async (t: string) => {
    try { await navigator.clipboard.writeText(t); toast("Código copiado!", "📋"); } catch { toast("Erro ao copiar", "⚠️"); }
  };

  return (
    <div className="min-h-screen px-6 pt-6 pb-24">
      <button onClick={onClose} className="font-mono text-xs text-paper-dim">← VOLTAR</button>
      <div className="mt-4 bg-gradient-to-br from-ember/20 to-volt/10 border border-volt/30 rounded-3xl p-6">
        <div className="font-mono text-[11px] text-volt tracking-wider">ASSINATURA PRO</div>
        <h1 className="text-[32px] mt-2 leading-tight">Coach sem limites</h1>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="font-display text-5xl text-volt">R$ 29,90</span>
          <span className="font-mono text-xs text-paper-dim">/mês</span>
        </div>
        <ul className="mt-4 space-y-1.5 text-[14px] text-paper">
          <li>✅ Chamadas de voz ilimitadas</li>
          <li>✅ Scanner de comida sem limite</li>
          <li>✅ Todos os 10 idiomas destravados</li>
          <li>✅ Análise corporal por IA</li>
          <li>✅ Planos de treino personalizados</li>
        </ul>
      </div>

      {!pix && (
        <button onClick={gerarPix} disabled={loading} className="btn-pf bg-volt text-ink mt-6 disabled:opacity-60">
          {loading ? "GERANDO PIX…" : "PAGAR R$29,90 COM PIX"}
        </button>
      )}

      {pix && (
        <div className="mt-6 bg-iron border border-line rounded-3xl p-5">
          <div className="font-display text-lg mb-3">SEU PIX</div>
          {pix.qr && (
            <img
              src={pix.qr.startsWith("data:") ? pix.qr : `data:image/png;base64,${pix.qr}`}
              alt="QR PIX"
              className="w-full max-w-[240px] mx-auto rounded-xl bg-white p-2"
            />
          )}
          <div className="mt-4 font-mono text-[11px] text-paper-dim break-all bg-ink border border-line rounded-xl p-3">
            {pix.code}
          </div>
          <button onClick={() => copy(pix.code)} className="btn-pf bg-volt text-ink mt-3">📋 COPIAR CÓDIGO</button>
          <button onClick={gerarPix} className="btn-pf bg-transparent border border-line text-paper mt-2">GERAR NOVO PIX</button>
          <p className="text-[11px] text-paper-dim font-mono mt-3 text-center">
            Pague em qualquer banco. A ativação é automática após confirmação.
          </p>
        </div>
      )}
    </div>
  );
}