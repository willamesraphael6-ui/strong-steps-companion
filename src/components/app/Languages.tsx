import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "./Toast";
import type { LocalProfile } from "@/lib/profile-storage";

const langs = [
  { code: "en", name: "Inglês", flag: "🇺🇸", voice: "alloy" },
  { code: "es", name: "Espanhol", flag: "🇪🇸", voice: "nova" },
  { code: "fr", name: "Francês", flag: "🇫🇷", voice: "shimmer" },
  { code: "de", name: "Alemão", flag: "🇩🇪", voice: "onyx" },
  { code: "it", name: "Italiano", flag: "🇮🇹", voice: "echo" },
  { code: "pt", name: "Português", flag: "🇧🇷", voice: "nova" },
  { code: "ja", name: "Japonês", flag: "🇯🇵", voice: "shimmer" },
  { code: "ko", name: "Coreano", flag: "🇰🇷", voice: "nova" },
  { code: "zh", name: "Mandarim", flag: "🇨🇳", voice: "alloy" },
  { code: "ar", name: "Árabe", flag: "🇸🇦", voice: "onyx" },
];

type Task = {
  id: string;
  title: string;
  target: string;
  translation_pt: string;
  pronunciation: string | null;
  difficulty: number;
  category: string;
};

export function Languages({ profile }: { profile: LocalProfile }) {
  const [selected, setSelected] = useState<(typeof langs)[number] | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [done, setDone] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState<Task | null>(null);

  useEffect(() => {
    if (!selected) return;
    setLoading(true);
    (async () => {
      const [{ data: t }, { data: p }] = await Promise.all([
        supabase
          .from("language_tasks")
          .select("*")
          .eq("lang_code", selected.code)
          .order("order_index"),
        supabase
          .from("user_task_progress")
          .select("task_id")
          .eq("profile_id", profile.id),
      ]);
      setTasks((t || []) as Task[]);
      setDone(new Set((p || []).map((r) => r.task_id as string)));
      setLoading(false);
    })();
  }, [selected, profile.id]);

  const playAudio = async (text: string, voice: string) => {
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice }),
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => URL.revokeObjectURL(url);
      await audio.play();
    } catch {
      toast("Erro ao tocar áudio", "⚠️");
    }
  };

  const markDone = async (t: Task) => {
    if (done.has(t.id)) return;
    setDone(new Set([...done, t.id]));
    await supabase.from("user_task_progress").upsert({
      profile_id: profile.id, task_id: t.id, score: 10,
    }, { onConflict: "profile_id,task_id" });
    toast(`+10 XP — ${t.title}`, "🎉");
  };

  if (active && selected) {
    return (
      <div className="pb-4">
        <button onClick={() => setActive(null)} className="mx-6 mt-5 font-mono text-xs text-paper-dim">
          ← TAREFAS
        </button>
        <div className="px-6 pt-2">
          <div className="text-4xl mb-1">{selected.flag}</div>
          <p className="eyebrow mt-1">{selected.name} · nível {active.difficulty}</p>
          <h2 className="text-[22px] mt-1">{active.title}</h2>
        </div>
        <div className="px-6 pt-6">
          <div className="bg-iron border border-line rounded-2xl p-5">
            <div className="text-[22px] font-semibold text-volt">{active.target}</div>
            <div className="text-sm text-paper mt-2">{active.translation_pt}</div>
            {active.pronunciation && (
              <div className="font-mono text-[11px] text-paper-dim mt-2">/{active.pronunciation}/</div>
            )}
            <button
              onClick={() => playAudio(active.target, selected.voice)}
              className="btn-pf bg-volt text-ink mt-4"
            >
              🔊 OUVIR PRONÚNCIA
            </button>
            <button
              onClick={async () => { await markDone(active); setActive(null); }}
              className="btn-pf bg-transparent border border-line text-paper mt-2"
            >
              {done.has(active.id) ? "JÁ FEITA — VOLTAR" : "MARCAR COMO FEITA (+10 XP)"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (selected) {
    const doneCount = tasks.filter((t) => done.has(t.id)).length;
    return (
      <div className="pb-4">
        <button onClick={() => setSelected(null)} className="mx-6 mt-5 font-mono text-xs text-paper-dim">
          ← IDIOMAS
        </button>
        <div className="px-6 pt-2">
          <div className="text-4xl mb-1">{selected.flag}</div>
          <h2 className="text-[26px]">{selected.name}</h2>
          <p className="text-paper-dim text-sm mt-1">
            {doneCount}/{tasks.length} tarefas completas
          </p>
        </div>
        {loading ? (
          <div className="text-center pt-10 font-mono text-volt animate-pulse">CARREGANDO…</div>
        ) : (
          <div className="px-6 pt-5 space-y-2">
            {tasks.map((t) => {
              const isDone = done.has(t.id);
              return (
                <button
                  key={t.id}
                  onClick={() => setActive(t)}
                  className="w-full text-left bg-iron border border-line rounded-2xl p-4 flex items-center gap-3 active:scale-[.99]"
                >
                  <div className={"w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 " + (isDone ? "bg-volt text-ink" : "bg-steel")}>
                    {isDone ? "✓" : t.difficulty}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14.5px] font-semibold text-volt truncate">{t.target}</div>
                    <div className="text-[12px] text-paper-dim truncate">{t.translation_pt}</div>
                  </div>
                  <div className="font-mono text-[10px] text-paper-dim uppercase">{t.category}</div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="pb-4">
      <div className="px-6 pt-6">
        <div className="eyebrow">Aprenda no seu ritmo</div>
        <h1 className="text-[30px] mt-1">Escolha um idioma</h1>
        <p className="text-paper-dim text-sm mt-2">
          120+ tarefas reais salvas no banco, com áudio nativo. Toque em qualquer bandeira.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 px-6 pt-6">
        {langs.map((l) => (
          <button
            key={l.code}
            onClick={() => setSelected(l)}
            className="bg-iron border border-line rounded-2xl p-5 flex flex-col items-start gap-2 active:scale-[.97] transition"
          >
            <div className="text-4xl">{l.flag}</div>
            <div className="font-display text-base">
              {l.name.toUpperCase()}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}