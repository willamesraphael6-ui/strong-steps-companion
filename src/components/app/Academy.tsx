import { useMemo, useState } from "react";
import {
  levelFromXp,
  levelName,
  type LocalProfile,
} from "@/lib/profile-storage";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "./Toast";

const cats = [
  { id: "forca", name: "FORÇA", ico: "🏋️" },
  { id: "cardio", name: "CARDIO", ico: "🏃" },
  { id: "mob", name: "MOBILIDADE", ico: "🧘" },
  { id: "hiit", name: "HIIT", ico: "⚡" },
];

const workouts: {
  id: string;
  cat: string;
  title: string;
  meta: string;
  xp: number;
  minLevel: number;
  ico: string;
  exercises: { name: string; reps: string }[];
}[] = [
  {
    id: "corpo-inteiro",
    cat: "forca",
    title: "Corpo Inteiro Iniciante",
    meta: "20 min · sem equipamento",
    xp: 80,
    minLevel: 1,
    ico: "💥",
    exercises: [
      { name: "Agachamento livre", reps: "3x15" },
      { name: "Flexão de joelhos", reps: "3x10" },
      { name: "Prancha", reps: "3x30s" },
      { name: "Elevação pélvica", reps: "3x15" },
    ],
  },
  {
    id: "peito-triceps",
    cat: "forca",
    title: "Peito & Tríceps",
    meta: "30 min · halteres",
    xp: 120,
    minLevel: 3,
    ico: "💪",
    exercises: [
      { name: "Supino halteres", reps: "4x10" },
      { name: "Crucifixo", reps: "3x12" },
      { name: "Tríceps testa", reps: "4x10" },
      { name: "Mergulho", reps: "3xmax" },
    ],
  },
  {
    id: "cardio-hiit",
    cat: "cardio",
    title: "HIIT Queima-Tudo",
    meta: "15 min · alta intensidade",
    xp: 100,
    minLevel: 2,
    ico: "🔥",
    exercises: [
      { name: "Burpees", reps: "40s on / 20s off" },
      { name: "Mountain climbers", reps: "40s on / 20s off" },
      { name: "Jump squats", reps: "40s on / 20s off" },
    ],
  },
  {
    id: "mobilidade",
    cat: "mob",
    title: "Mobilidade Total",
    meta: "12 min · relaxante",
    xp: 40,
    minLevel: 1,
    ico: "🌿",
    exercises: [
      { name: "Rotação de quadril", reps: "10 cada lado" },
      { name: "Cat-cow", reps: "10 reps" },
      { name: "Alongamento passivo", reps: "5 min" },
    ],
  },
  {
    id: "hiit-avancado",
    cat: "hiit",
    title: "HIIT Predador",
    meta: "25 min · destruidor",
    xp: 180,
    minLevel: 5,
    ico: "⚡",
    exercises: [
      { name: "Sprint 100m", reps: "6 rounds" },
      { name: "Kettlebell swings", reps: "4x20" },
      { name: "Box jumps", reps: "4x10" },
    ],
  },
];

export function Academy({
  profile,
  onUpdate,
}: {
  profile: LocalProfile;
  onUpdate: (p: Partial<LocalProfile>) => Promise<void>;
}) {
  const [cat, setCat] = useState<string>("forca");
  const [active, setActive] = useState<string | null>(null);
  const { level, xpInLevel, xpNeeded } = useMemo(
    () => levelFromXp(profile.xp),
    [profile.xp],
  );
  const pct = Math.min(1, xpInLevel / xpNeeded);

  const completeWorkout = async (xp: number, title: string) => {
    await onUpdate({ xp: profile.xp + xp });
    const today = new Date().toISOString().slice(0, 10);
    const { data } = await supabase
      .from("daily_stats")
      .select("workouts_completed, xp_earned")
      .eq("profile_id", profile.id)
      .eq("date", today)
      .maybeSingle();
    await supabase.from("daily_stats").upsert(
      {
        profile_id: profile.id,
        date: today,
        workouts_completed: (data?.workouts_completed || 0) + 1,
        xp_earned: (data?.xp_earned || 0) + xp,
      },
      { onConflict: "profile_id,date" },
    );
    toast(`+${xp} XP — ${title} concluído!`, "🏆");
    setActive(null);
  };

  const activeWorkout = workouts.find((w) => w.id === active);

  return (
    <div className="pb-4">
      <div className="mx-6 mt-5 rounded-3xl border border-line p-5 relative overflow-hidden bg-gradient-to-br from-iron to-steel">
        <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-volt/20 blur-2xl" />
        <div className="flex justify-between items-center relative">
          <div>
            <div className="font-display text-[54px] leading-none">{level}</div>
            <div className="font-mono text-[11px] text-volt tracking-wider mt-1">
              {levelName(level).toUpperCase()}
            </div>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-ink border-2 border-volt flex items-center justify-center text-3xl">
            🏅
          </div>
        </div>
        <div className="h-2 rounded-full bg-ink overflow-hidden mt-4">
          <div
            className="h-full bg-gradient-to-r from-ember to-volt"
            style={{ width: `${pct * 100}%` }}
          />
        </div>
        <div className="font-mono text-[11px] text-paper-dim mt-1.5">
          {xpInLevel} / {xpNeeded} XP para o próximo nível
        </div>
      </div>

      <div className="flex gap-2 px-6 py-5 overflow-x-auto">
        {cats.map((c) => (
          <button
            key={c.id}
            onClick={() => setCat(c.id)}
            className={
              "font-mono text-xs px-4 py-2 rounded-full border whitespace-nowrap " +
              (cat === c.id
                ? "bg-volt text-ink border-volt"
                : "bg-iron border-line text-paper-dim")
            }
          >
            {c.ico} {c.name}
          </button>
        ))}
      </div>

      <div className="px-6 space-y-3">
        {workouts
          .filter((w) => w.cat === cat)
          .map((w) => {
            const locked = level < w.minLevel;
            return (
              <button
                key={w.id}
                disabled={locked}
                onClick={() => setActive(w.id)}
                className={
                  "w-full bg-iron border border-line rounded-2xl p-4 flex items-center gap-3.5 text-left transition active:scale-[.99] " +
                  (locked ? "opacity-40" : "")
                }
              >
                <div className="w-14 h-14 rounded-2xl bg-ember text-ink flex items-center justify-center text-2xl shrink-0">
                  {w.ico}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-[16px]">{w.title}</div>
                  <div className="font-mono text-[11px] text-paper-dim mt-1">
                    {locked ? `🔒 Nível ${w.minLevel}` : w.meta}
                  </div>
                </div>
                <div className="font-mono text-xs text-volt shrink-0">
                  +{w.xp} XP
                </div>
              </button>
            );
          })}
      </div>

      {activeWorkout && (
        <div
          className="fixed inset-0 z-[100] bg-black/70 flex items-end"
          onClick={() => setActive(null)}
        >
          <div
            className="w-full max-w-[480px] mx-auto bg-iron border border-line border-b-0 rounded-t-3xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-steel rounded-full mx-auto mb-4" />
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-ember text-ink flex items-center justify-center text-2xl">
                {activeWorkout.ico}
              </div>
              <div>
                <h3 className="text-xl">{activeWorkout.title}</h3>
                <p className="text-paper-dim text-xs font-mono mt-0.5">
                  {activeWorkout.meta}
                </p>
              </div>
            </div>
            <div className="space-y-2 mb-5">
              {activeWorkout.exercises.map((ex, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center py-3 border-b border-line last:border-0"
                >
                  <span className="text-[15px]">{ex.name}</span>
                  <span className="font-mono text-xs text-volt">
                    {ex.reps}
                  </span>
                </div>
              ))}
            </div>
            <button
              onClick={() =>
                completeWorkout(activeWorkout.xp, activeWorkout.title)
              }
              className="btn-pf bg-volt text-ink"
            >
              MARCAR COMO CONCLUÍDO +{activeWorkout.xp} XP
            </button>
          </div>
        </div>
      )}
    </div>
  );
}