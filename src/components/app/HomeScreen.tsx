import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useSteps } from "@/hooks/useSteps";
import {
  levelFromXp,
  levelName,
  type LocalProfile,
} from "@/lib/profile-storage";
import { toast } from "./Toast";

const AVATAR_FALLBACK = "https://api.dicebear.com/9.x/notionists/svg?seed=";

export function HomeScreen({
  profile,
  onOpenTutor,
  onOpenFood,
  onOpenBody,
  onOpenPaywall,
  onOpenShorts,
}: {
  profile: LocalProfile;
  onOpenTutor: () => void;
  onOpenFood: () => void;
  onOpenBody: () => void;
  onOpenPaywall: () => void;
  onOpenShorts: () => void;
}) {
  const { steps, permission, active, requestPermission } = useSteps(profile.id);
  const [missions, setMissions] = useState<
    { id: string; icon: string; title: string; sub: string; done: boolean }[]
  >([
    { id: "walk", icon: "🚶", title: "Caminhe 3.000 passos", sub: "+50 XP", done: false },
    { id: "water", icon: "💧", title: "Beba 2L de água", sub: "+20 XP", done: false },
    { id: "workout", icon: "💪", title: "Faça 1 treino curto", sub: "+80 XP", done: false },
    { id: "coach", icon: "🤖", title: "Fale com o coach", sub: "+15 XP", done: false },
  ]);

  const goal = profile.daily_step_goal || 8000;
  const pct = Math.min(1, steps / goal);
  const { level, xpInLevel, xpNeeded } = useMemo(
    () => levelFromXp(profile.xp),
    [profile.xp],
  );

  // Auto-complete walk mission when steps cross threshold
  useEffect(() => {
    if (steps >= 3000)
      setMissions((m) =>
        m.map((x) => (x.id === "walk" && !x.done ? { ...x, done: true } : x)),
      );
  }, [steps]);

  const toggle = (id: string) => {
    setMissions((m) =>
      m.map((x) => {
        if (x.id !== id) return x;
        if (!x.done) toast(`+${x.sub.replace(/[^0-9]/g, "")} XP — ${x.title}!`);
        return { ...x, done: !x.done };
      }),
    );
  };

  const avatarSrc =
    profile.avatar_url ||
    AVATAR_FALLBACK + encodeURIComponent(profile.name);

  const c = 2 * Math.PI * 96;

  return (
    <div className="flex-1">
      <header className="flex items-center justify-between px-6 pt-5 pb-2">
        <div className="flex items-center gap-3">
          <img
            src={avatarSrc}
            alt={profile.name}
            className="w-11 h-11 rounded-full object-cover bg-steel ring-2 ring-volt"
          />
          <div>
            <div className="font-display text-base leading-none">
              {profile.name.toUpperCase()}
            </div>
            <div className="font-mono text-[11px] text-volt mt-1">
              NÍVEL {level} · {levelName(level).toUpperCase()}
            </div>
          </div>
        </div>
        <button className="w-10 h-10 rounded-full bg-iron border border-line flex items-center justify-center text-base relative">
          🔔
          <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-ember" />
        </button>
      </header>

      {/* Ring */}
      <div className="flex flex-col items-center px-6 pt-2 pb-2 relative">
        <svg viewBox="0 0 240 240" className="w-60 h-60">
          <circle
            cx="120"
            cy="120"
            r="96"
            fill="none"
            stroke="var(--steel)"
            strokeWidth="14"
          />
          <motion.circle
            cx="120"
            cy="120"
            r="96"
            fill="none"
            stroke="url(#ringGrad)"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={c}
            initial={{ strokeDashoffset: c }}
            animate={{ strokeDashoffset: c * (1 - pct) }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            transform="rotate(-90 120 120)"
          />
          <defs>
            <linearGradient id="ringGrad" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0" stopColor="#FF5A2B" />
              <stop offset="1" stopColor="#C6FF3D" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[54%] text-center pointer-events-none">
          <div className="font-display text-[52px] leading-none tabular-nums">
            {steps.toLocaleString("pt-BR")}
          </div>
          <div className="font-mono text-[11px] text-paper-dim tracking-wider mt-1">
            META {goal.toLocaleString("pt-BR")} PASSOS
          </div>
          <div className="font-mono text-[10.5px] text-volt tracking-wider mt-2">
            {active ? "● SENSOR ATIVO" : "SENSOR PARADO"}
          </div>
        </div>
      </div>

      {permission !== "granted" && (
        <div className="mx-6 mt-1 mb-2 bg-ember/10 border border-ember/40 rounded-xl p-3 text-[12.5px] text-ember flex gap-2">
          <span>⚠️</span>
          <div className="flex-1">
            <div className="font-semibold mb-0.5">Ative o sensor de passos</div>
            <div className="text-paper-dim">
              Usa o acelerômetro do celular. Toque para permitir.
            </div>
            <button
              onClick={requestPermission}
              className="mt-2 font-mono text-[11px] text-volt underline"
            >
              PERMITIR AGORA →
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="flex gap-2.5 px-6 pt-5">
        <Stat
          n={Math.round(steps * 0.762 / 100) / 10}
          l="KM"
          suffix=" km"
        />
        <Stat n={Math.round(steps * 0.04)} l="KCAL" />
        <Stat n={xpInLevel} l={`/${xpNeeded} XP`} raw />
      </div>

      {/* Missions */}
      <div className="flex justify-between items-baseline px-6 pt-7 pb-3">
        <h2 className="text-[22px]">MISSÕES DO DIA</h2>
        <button
          onClick={onOpenTutor}
          className="font-mono text-[11.5px] text-volt"
        >
          FALAR COM COACH →
        </button>
      </div>
      {/* Quick-action cards */}
      <div className="px-6 grid grid-cols-4 gap-2 mb-4">
        <button onClick={onOpenFood} className="bg-iron border border-line rounded-2xl p-3 text-left active:scale-95">
          <div className="text-2xl">🍽️</div>
          <div className="font-mono text-[10px] text-volt mt-1">COMIDA</div>
        </button>
        <button onClick={onOpenBody} className="bg-iron border border-line rounded-2xl p-3 text-left active:scale-95">
          <div className="text-2xl">💪</div>
          <div className="font-mono text-[10px] text-volt mt-1">CORPO</div>
        </button>
        <button onClick={onOpenShorts} className="bg-iron border border-line rounded-2xl p-3 text-left active:scale-95">
          <div className="text-2xl">▶️</div>
          <div className="font-mono text-[10px] text-volt mt-1">SHORTS</div>
        </button>
        <button onClick={onOpenPaywall} className="bg-gradient-to-br from-ember/30 to-volt/10 border border-volt/40 rounded-2xl p-3 text-left active:scale-95">
          <div className="text-2xl">⚡</div>
          <div className="font-mono text-[10px] text-volt mt-1">PRO</div>
        </button>
      </div>
      {missions.map((m) => (
        <button
          key={m.id}
          onClick={() => toggle(m.id)}
          className="w-full mx-6 mb-2.5 bg-iron border border-line rounded-2xl p-4 flex items-center gap-3.5 text-left active:scale-[.99] transition"
          style={{ width: "calc(100% - 3rem)" }}
        >
          <div
            className={
              "w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 " +
              (m.done ? "bg-volt text-ink" : "bg-steel")
            }
          >
            {m.icon}
          </div>
          <div className="flex-1">
            <div className="font-semibold text-[15px]">{m.title}</div>
            <div className="font-mono text-[11px] text-paper-dim mt-0.5">
              {m.sub}
            </div>
          </div>
          <div
            className={
              "w-6 h-6 rounded-full border-2 flex items-center justify-center " +
              (m.done
                ? "bg-volt border-volt text-ink text-sm font-black"
                : "border-steel")
            }
          >
            {m.done ? "✓" : ""}
          </div>
        </button>
      ))}
    </div>
  );
}

function Stat({
  n,
  l,
  raw,
  suffix,
}: {
  n: number;
  l: string;
  raw?: boolean;
  suffix?: string;
}) {
  return (
    <div className="flex-1 bg-iron border border-line rounded-2xl p-3.5">
      <div className="font-display text-[26px] leading-none tabular-nums">
        {raw ? n : n.toLocaleString("pt-BR")}
        {suffix ?? ""}
      </div>
      <div className="font-mono text-[10.5px] text-paper-dim tracking-wider uppercase mt-1">
        {l}
      </div>
    </div>
  );
}