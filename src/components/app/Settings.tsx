import { useEffect, useState } from "react";
import type { LocalProfile } from "@/lib/profile-storage";
import { toast } from "./Toast";

export function Settings({
  profile,
  onClose,
  onUpdate,
}: {
  profile: LocalProfile;
  onClose: () => void;
  onUpdate: (p: Partial<LocalProfile>) => Promise<void>;
}) {
  const [notif, setNotif] = useState(!!profile.notifications_enabled);
  const [goal, setGoal] = useState(profile.daily_step_goal || 8000);
  const [lang, setLang] = useState(profile.preferred_language || "pt-BR");
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">(
    typeof Notification === "undefined" ? "unsupported" : Notification.permission,
  );

  useEffect(() => {
    if (typeof Notification === "undefined") return;
    setPermission(Notification.permission);
  }, []);

  const toggleNotif = async () => {
    const next = !notif;
    if (next && typeof Notification !== "undefined") {
      if (Notification.permission === "default") {
        const r = await Notification.requestPermission();
        setPermission(r);
        if (r !== "granted") {
          toast("Permissão negada pelo navegador", "⚠️");
          return;
        }
      }
      if (Notification.permission === "denied") {
        toast("Bloqueado no navegador. Libere no cadeado da URL.", "⚠️");
        return;
      }
      try {
        new Notification("Lembretes ativados 🔔", {
          body: "Vou te chamar 4x por dia. Bora.",
        });
      } catch {
        // ignore
      }
    }
    setNotif(next);
    await onUpdate({ notifications_enabled: next });
    toast(next ? "Notificações ligadas" : "Notificações desligadas");
  };

  const saveGoal = async () => {
    await onUpdate({ daily_step_goal: goal });
    toast("Meta atualizada");
  };
  const saveLang = async (v: string) => {
    setLang(v);
    await onUpdate({ preferred_language: v });
  };

  return (
    <div className="min-h-screen px-6 pt-6 pb-24">
      <button onClick={onClose} className="font-mono text-xs text-paper-dim">
        ← VOLTAR
      </button>
      <h1 className="text-[28px] mt-3 mb-6">CONFIGURAÇÕES</h1>

      <Section title="LEMBRETES">
        <Row label="🔔 Notificações diárias">
          <button
            onClick={toggleNotif}
            className={
              "w-12 h-7 rounded-full relative transition " +
              (notif ? "bg-volt" : "bg-steel")
            }
          >
            <span
              className={
                "absolute top-1 w-5 h-5 rounded-full transition " +
                (notif ? "left-6 bg-ink" : "left-1 bg-paper")
              }
            />
          </button>
        </Row>
        {permission === "denied" && (
          <p className="text-[11px] text-ember font-mono mt-1">
            Navegador bloqueou. Toque no cadeado da URL → Notificações → Permitir.
          </p>
        )}
        <p className="text-[11px] text-paper-dim font-mono mt-2">
          Você recebe até 4 alertas por dia (manhã, meio-dia, tarde e noite) para
          fazer as rotinas.
        </p>
      </Section>

      <Section title="METAS">
        <label className="block">
          <div className="text-[13px] mb-2">Meta diária de passos</div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={3000}
              max={20000}
              step={500}
              value={goal}
              onChange={(e) => setGoal(Number(e.target.value))}
              onMouseUp={saveGoal}
              onTouchEnd={saveGoal}
              className="flex-1 accent-volt"
            />
            <span className="font-mono text-sm text-volt w-16 text-right">
              {goal.toLocaleString("pt-BR")}
            </span>
          </div>
        </label>
      </Section>

      <Section title="IDIOMA">
        <select
          value={lang}
          onChange={(e) => saveLang(e.target.value)}
          className="w-full bg-iron border border-line rounded-2xl px-4 py-3 text-paper text-[14.5px]"
        >
          {[
            ["pt-BR", "Português (BR)"],
            ["en", "English"],
            ["es", "Español"],
            ["fr", "Français"],
            ["de", "Deutsch"],
            ["it", "Italiano"],
            ["ja", "日本語"],
            ["ko", "한국어"],
            ["zh", "中文"],
            ["ar", "العربية"],
          ].map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
      </Section>

      <Section title="SOBRE">
        <p className="text-[12.5px] text-paper-dim">
          Passos Fortes v1.1 · IA por Lovable AI · PIX por Krypt.
        </p>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h2 className="font-mono text-[11px] text-volt tracking-widest mb-3">
        {title}
      </h2>
      <div className="bg-iron border border-line rounded-2xl p-4">{children}</div>
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[14.5px]">{label}</span>
      {children}
    </div>
  );
}