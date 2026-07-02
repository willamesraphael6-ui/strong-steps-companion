export type Tab = "home" | "academy" | "tutor" | "lang" | "profile";

const items: { id: Tab; icon: string; label: string }[] = [
  { id: "home", icon: "🏠", label: "HOME" },
  { id: "academy", icon: "🏋️", label: "TREINOS" },
  { id: "tutor", icon: "🤖", label: "TUTOR" },
  { id: "lang", icon: "🌐", label: "IDIOMAS" },
  { id: "profile", icon: "👤", label: "PERFIL" },
];

export function Nav({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-ink/95 backdrop-blur-lg border-t border-line flex px-2 pt-2 pb-[22px] z-50">
      {items.map((it) => {
        const active = tab === it.id;
        return (
          <button
            key={it.id}
            onClick={() => setTab(it.id)}
            className={
              "flex-1 flex flex-col items-center gap-1 py-1.5 " +
              (active ? "text-volt" : "text-paper-dim")
            }
          >
            <span className="text-xl leading-none">{it.icon}</span>
            <span className="font-mono text-[9.5px] tracking-wider">
              {it.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}