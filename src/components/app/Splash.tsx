import logo from "@/assets/logo.jpg";

export function Splash({
  onStart,
  onSkip,
}: {
  onStart: () => void;
  onSkip: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8 text-center">
      <div
        className="w-32 h-32 rounded-full mb-8 relative flex items-center justify-center overflow-hidden ring-4 ring-volt/30"
        style={{
          background:
            "conic-gradient(from 220deg, #C6FF3D, #FF5A2B 55%, #C6FF3D)",
          boxShadow: "0 0 60px rgba(198,255,61,0.25)",
          animation: "spin 8s linear infinite",
        }}
      >
        <img
          src={logo}
          alt="Passos Fortes"
          className="w-24 h-24 rounded-full object-cover"
          width={96}
          height={96}
        />
      </div>
      <h1 className="font-display text-[52px] leading-none tracking-tight">
        PASSOS
        <br />
        <span className="text-volt not-italic">FORTES</span>
      </h1>
      <p className="text-paper-dim text-[15px] mt-4 max-w-[280px]">
        Caminhe, treine e suba de nível de verdade — sem contagem falsa, sem
        enrolação.
      </p>
      <div className="w-full mt-10 space-y-3">
        <button
          onClick={onStart}
          className="btn-pf bg-volt text-ink active:scale-[.97]"
        >
          COMEÇAR AVALIAÇÃO →
        </button>
        <button
          onClick={onSkip}
          className="btn-pf bg-transparent border border-line text-paper active:scale-[.97]"
        >
          JÁ TENHO PERFIL
        </button>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  );
}