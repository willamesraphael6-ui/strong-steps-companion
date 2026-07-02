import { useState } from "react";
import {
  levelFromXp,
  levelName,
  type LocalProfile,
} from "@/lib/profile-storage";
import { toast } from "./Toast";

const badges = [
  { id: "first", ico: "🌱", label: "Primeiro dia", min: 0 },
  { id: "3k", ico: "🚶", label: "3k passos", min: 0 },
  { id: "workout", ico: "💪", label: "1º treino", min: 80 },
  { id: "lvl5", ico: "🏅", label: "Nível 5", min: 5 * 250 },
  { id: "lvl10", ico: "👑", label: "Nível 10", min: 10 * 250 },
  { id: "streak", ico: "🔥", label: "7 dias", min: 1000 },
];

export function ProfileScreen({
  profile,
  onReset,
  onUpdate,
}: {
  profile: LocalProfile;
  onReset: () => void;
  onUpdate: (p: Partial<LocalProfile>) => Promise<void>;
}) {
  const [notif, setNotif] = useState(!!profile.notifications_enabled);
  const { level } = levelFromXp(profile.xp);
  const avatarSrc =
    profile.avatar_url ||
    "https://api.dicebear.com/9.x/notionists/svg?seed=" +
      encodeURIComponent(profile.name);

  const toggleNotif = async () => {
    const next = !notif;
    setNotif(next);
    if (next && typeof Notification !== "undefined") {
      if (Notification.permission !== "granted") {
        const r = await Notification.requestPermission();
        if (r !== "granted") {
          setNotif(false);
          toast("Permissão negada pelo navegador", "⚠️");
          return;
        }
      }
    }
    await onUpdate({ notifications_enabled: next });
    toast(next ? "Notificações ligadas" : "Notificações desligadas");
  };

  return (
    <div className="pb-4">
      <div className="flex flex-col items-center pt-8 px-6">
        <img
          src={avatarSrc}
          alt={profile.name}
          className="w-26 h-26 rounded-full object-cover ring-4 ring-volt bg-steel"
          style={{ width: 104, height: 104 }}
        />
        <h1 className="text-[26px] mt-3">{profile.name.toUpperCase()}</h1>
        <div className="font-mono text-xs text-paper-dim mt-1">
          NÍVEL {level} · {levelName(level).toUpperCase()} · {profile.xp} XP
        </div>
      </div>

      <h3 className="font-display text-lg tracking-wide px-6 pt-8 mb-2">
        CONQUISTAS
      </h3>
      <div className="flex gap-3 px-6 overflow-x-auto pb-2">
        {badges.map((b) => {
          const locked = profile.xp < b.min && level < b.min;
          return (
            <div key={b.id} className="w-16 shrink-0 text-center">
              <div
                className={
                  "w-14 h-14 rounded-2xl bg-iron border border-line flex items-center justify-center text-2xl mb-1.5 " +
                  (locked ? "opacity-30" : "")
                }
              >
                {b.ico}
              </div>
              <div className="font-mono text-[9.5px] text-paper-dim leading-tight">
                {b.label}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mx-6 mt-6">
        <div className="flex items-center justify-between py-4 border-b border-line">
          <span className="text-[15px]">🔔 Notificações diárias</span>
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
        </div>
        <div className="flex items-center justify-between py-4 border-b border-line">
          <span className="text-[15px]">📏 Meta diária de passos</span>
          <span className="font-mono text-sm text-volt">
            {profile.daily_step_goal}
          </span>
        </div>
        <button
          onClick={() => {
            if (
              confirm(
                "Isso apaga seu perfil deste aparelho. Continuar?",
              )
            )
              onReset();
          }}
          className="w-full text-left py-4 border-b border-line text-ember"
        >
          🗑️ Apagar meu perfil
        </button>
      </div>
      <p className="text-center text-[11px] text-paper-dim font-mono mt-6">
        v1.0 · Passos Fortes
      </p>
    </div>
  );
}