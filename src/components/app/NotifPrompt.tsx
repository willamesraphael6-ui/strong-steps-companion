import { useState } from "react";
import { toast } from "./Toast";

export function NotifPrompt({
  onDone,
}: {
  onDone: (enabled: boolean) => void;
}) {
  const [busy, setBusy] = useState(false);

  const ask = async () => {
    setBusy(true);
    try {
      if (
        typeof window !== "undefined" &&
        "Notification" in window &&
        Notification.permission !== "granted"
      ) {
        const res = await Notification.requestPermission();
        if (res === "granted") {
          try {
            new Notification("Passos Fortes ativo 💪", {
              body: "Vou te lembrar todo dia. Bora começar.",
              icon: "/favicon.ico",
            });
          } catch {}
          toast("Notificações ativadas!", "🔔");
          onDone(true);
          return;
        }
        toast("Notificações não permitidas.", "⚠️");
        onDone(false);
        return;
      }
      if (
        typeof Notification !== "undefined" &&
        Notification.permission === "granted"
      ) {
        onDone(true);
        return;
      }
      onDone(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen px-6 pt-8 pb-10 flex flex-col justify-center">
      <div className="bg-iron border border-line rounded-3xl p-6 text-center">
        <div className="text-5xl mb-3">🔔</div>
        <h2 className="text-2xl mb-2">Ative os lembretes diários</h2>
        <p className="text-paper-dim text-sm">
          O Passos Fortes te avisa todo dia o que fazer: caminhada, treino e a
          missão do dia. Sem enrolação.
        </p>
      </div>
      <button
        onClick={ask}
        disabled={busy}
        className="btn-pf bg-volt text-ink mt-6 disabled:opacity-60"
      >
        {busy ? "…" : "PERMITIR NOTIFICAÇÕES"}
      </button>
      <button
        onClick={() => onDone(false)}
        className="btn-pf bg-transparent border border-line text-paper mt-3"
      >
        AGORA NÃO
      </button>
    </div>
  );
}