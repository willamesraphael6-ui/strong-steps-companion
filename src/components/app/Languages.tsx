import { useState } from "react";
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

type Lesson = {
  title: string;
  phrases: { target: string; pt: string; pron: string }[];
  quiz: { q: string; options: string[]; answer: number }[];
};

export function Languages({ profile: _profile }: { profile: LocalProfile }) {
  const [selected, setSelected] = useState<(typeof langs)[number] | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(false);
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizPick, setQuizPick] = useState<number | null>(null);

  const loadLesson = async (lang: (typeof langs)[number]) => {
    setSelected(lang);
    setLoading(true);
    setLesson(null);
    setQuizIdx(0);
    setQuizPick(null);
    try {
      const res = await fetch("/api/lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: lang.name }),
      });
      const data = (await res.json()) as Lesson;
      setLesson(data);
    } catch {
      toast("Erro ao carregar lição", "⚠️");
    } finally {
      setLoading(false);
    }
  };

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

  if (selected && lesson) {
    const currentQ = lesson.quiz[quizIdx];
    return (
      <div className="pb-4">
        <button
          onClick={() => {
            setSelected(null);
            setLesson(null);
          }}
          className="mx-6 mt-5 font-mono text-xs text-paper-dim"
        >
          ← IDIOMAS
        </button>
        <div className="px-6 pt-2">
          <div className="text-4xl mb-1">{selected.flag}</div>
          <h2 className="text-[26px]">{lesson.title}</h2>
          <p className="eyebrow mt-1">{selected.name}</p>
        </div>
        <div className="px-6 pt-6">
          <h3 className="font-display text-lg mb-3 tracking-wide">
            FRASES
          </h3>
          {lesson.phrases.map((p, i) => (
            <div
              key={i}
              className="bg-iron border border-line rounded-2xl p-4 mb-2.5"
            >
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1">
                  <div className="text-[17px] font-semibold text-volt">
                    {p.target}
                  </div>
                  <div className="text-sm text-paper mt-1">{p.pt}</div>
                  <div className="font-mono text-[11px] text-paper-dim mt-1">
                    /{p.pron}/
                  </div>
                </div>
                <button
                  onClick={() => playAudio(p.target, selected.voice)}
                  className="w-10 h-10 rounded-full bg-volt text-ink flex items-center justify-center text-lg shrink-0 active:scale-95"
                >
                  🔊
                </button>
              </div>
            </div>
          ))}
        </div>
        {currentQ && (
          <div className="px-6 pt-6">
            <h3 className="font-display text-lg mb-3 tracking-wide">
              QUIZ ({quizIdx + 1}/{lesson.quiz.length})
            </h3>
            <div className="bg-iron border border-line rounded-2xl p-5">
              <p className="text-[15px] mb-4">{currentQ.q}</p>
              <div className="space-y-2">
                {currentQ.options.map((opt, i) => {
                  const chosen = quizPick === i;
                  const correct = quizPick !== null && i === currentQ.answer;
                  const wrong = chosen && i !== currentQ.answer;
                  return (
                    <button
                      key={i}
                      disabled={quizPick !== null}
                      onClick={() => setQuizPick(i)}
                      className={
                        "w-full text-left px-4 py-3 rounded-xl border text-[14.5px] " +
                        (correct
                          ? "bg-volt/20 border-volt"
                          : wrong
                            ? "bg-ember/20 border-ember"
                            : "bg-ink border-line")
                      }
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
              {quizPick !== null && (
                <button
                  onClick={() => {
                    if (quizIdx < lesson.quiz.length - 1) {
                      setQuizIdx(quizIdx + 1);
                      setQuizPick(null);
                    } else {
                      toast("Lição concluída! +30 XP", "🎉");
                      setSelected(null);
                      setLesson(null);
                    }
                  }}
                  className="btn-pf bg-volt text-ink mt-4"
                >
                  {quizIdx < lesson.quiz.length - 1 ? "PRÓXIMA" : "TERMINAR"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (selected && loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 pt-40">
        <div className="text-4xl animate-pulse">{selected.flag}</div>
        <div className="font-mono text-xs text-volt tracking-wider">
          GERANDO SUA LIÇÃO…
        </div>
      </div>
    );
  }

  return (
    <div className="pb-4">
      <div className="px-6 pt-6">
        <div className="eyebrow">Aprenda no seu ritmo</div>
        <h1 className="text-[30px] mt-1">Escolha um idioma</h1>
        <p className="text-paper-dim text-sm mt-2">
          Lições geradas pela IA, com áudio nativo. Toque em qualquer bandeira.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 px-6 pt-6">
        {langs.map((l) => (
          <button
            key={l.code}
            onClick={() => loadLesson(l)}
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