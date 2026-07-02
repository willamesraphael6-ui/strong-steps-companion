import { useState } from "react";

type Answers = { goal?: string; level?: string; equip?: string; time?: string };

const questions = [
  {
    key: "goal" as const,
    q: "Qual seu objetivo agora?",
    hint: "Vamos usar isso pra montar seu plano.",
    opts: [
      { ico: "🔥", label: "Queimar gordura" },
      { ico: "💪", label: "Ganhar massa" },
      { ico: "🏃", label: "Melhorar condicionamento" },
      { ico: "🧘", label: "Saúde e mobilidade" },
    ],
  },
  {
    key: "level" as const,
    q: "Como está sua rotina hoje?",
    hint: "Sem julgamento, só diagnóstico.",
    opts: [
      { ico: "🛋️", label: "Começando do zero" },
      { ico: "🚶", label: "Movimento leve" },
      { ico: "🏋️", label: "Treino regular" },
      { ico: "⚡", label: "Avançado" },
    ],
  },
  {
    key: "equip" as const,
    q: "O que você tem em casa?",
    hint: "Ajusto os treinos ao seu setup.",
    opts: [
      { ico: "🤸", label: "Só o corpo" },
      { ico: "🎯", label: "Halteres / elástico" },
      { ico: "🏢", label: "Academia completa" },
      { ico: "🏞️", label: "Prefiro ao ar livre" },
    ],
  },
  {
    key: "time" as const,
    q: "Quanto tempo por dia?",
    hint: "Consistência bate volume.",
    opts: [
      { ico: "⏱️", label: "15 min" },
      { ico: "⏰", label: "30 min" },
      { ico: "🕐", label: "45–60 min" },
      { ico: "🔥", label: "1h+" },
    ],
  },
];

export function Quiz({ onDone }: { onDone: (a: Answers) => void }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const q = questions[step];
  const chosen = answers[q.key];

  const next = () => {
    if (!chosen) return;
    if (step === questions.length - 1) {
      onDone(answers);
    } else {
      setStep(step + 1);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between pb-8">
      <div className="px-6 pt-8">
        <div className="flex gap-1.5 mb-6">
          {questions.map((_, i) => (
            <span
              key={i}
              className={
                "flex-1 h-1 rounded " +
                (i <= step ? "bg-volt" : "bg-steel")
              }
            />
          ))}
        </div>
        <div className="eyebrow mb-2">Pergunta {step + 1} de {questions.length}</div>
        <h2 className="text-[28px] leading-tight mb-1">{q.q}</h2>
        <p className="text-paper-dim text-sm mb-6">{q.hint}</p>
        <div className="space-y-2.5">
          {q.opts.map((o) => {
            const sel = chosen === o.label;
            return (
              <button
                key={o.label}
                onClick={() =>
                  setAnswers({ ...answers, [q.key]: o.label })
                }
                className={
                  "w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition active:scale-[.98] " +
                  (sel
                    ? "border-volt bg-volt/10"
                    : "border-line bg-iron")
                }
              >
                <span className="text-2xl w-7 text-center">{o.ico}</span>
                <span className="text-[15.5px]">{o.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="px-6 pt-6">
        <button
          onClick={next}
          disabled={!chosen}
          className="btn-pf bg-volt text-ink disabled:opacity-40 disabled:pointer-events-none"
        >
          {step === questions.length - 1 ? "FINALIZAR" : "CONTINUAR"} →
        </button>
      </div>
    </div>
  );
}