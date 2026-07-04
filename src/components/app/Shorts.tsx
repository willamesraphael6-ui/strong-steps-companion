import { useEffect, useRef, useState } from "react";

// YouTube Shorts IDs curated by the coach (extract from URLs the user picked)
const SHORTS: { id: string; title: string; author: string }[] = [
  { id: "Y84KtNT2JUA", title: "Postura no agachamento", author: "Coach PF" },
  { id: "Gc7KJHMiNQ0", title: "Rotina de 5 minutos", author: "Coach PF" },
  { id: "R2pLioaUumI", title: "Core em casa", author: "Coach PF" },
  { id: "_Imc4feNV9Q", title: "Alongamento pós-treino", author: "Coach PF" },
  { id: "YuKJyUweGHY", title: "Foco e disciplina", author: "Coach PF" },
];

export function Shorts({ onClose }: { onClose: () => void }) {
  const [current, setCurrent] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => {
      const idx = Math.round(el.scrollTop / el.clientHeight);
      if (idx !== current) setCurrent(idx);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [current]);

  return (
    <div className="fixed inset-0 bg-black z-[160] flex flex-col">
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-black/60 backdrop-blur text-paper flex items-center justify-center text-lg"
          aria-label="Fechar"
        >
          ✕
        </button>
        <div className="font-mono text-[11px] text-paper bg-black/60 backdrop-blur rounded-full px-3 py-1.5">
          SHORTS · {current + 1}/{SHORTS.length}
        </div>
      </div>
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto snap-y snap-mandatory"
        style={{ scrollSnapType: "y mandatory" }}
      >
        {SHORTS.map((s, i) => (
          <div
            key={s.id}
            className="w-full h-full min-h-screen snap-start relative flex items-center justify-center bg-black"
          >
            {Math.abs(i - current) <= 1 && (
              <iframe
                title={s.title}
                src={`https://www.youtube.com/embed/${s.id}?autoplay=${i === current ? 1 : 0}&mute=${i === current ? 0 : 1}&loop=1&playlist=${s.id}&playsinline=1&modestbranding=1&rel=0`}
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                className="w-full h-full max-w-[420px] aspect-[9/16] border-0"
              />
            )}
            <div className="absolute bottom-8 left-4 right-16 text-paper drop-shadow-lg">
              <div className="font-display text-xl">{s.title}</div>
              <div className="font-mono text-[11px] text-volt mt-1">@{s.author}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}