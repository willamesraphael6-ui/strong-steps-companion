import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "./Toast";
import type { LocalProfile } from "@/lib/profile-storage";

type Result = {
  verdict?: string;
  can_eat?: boolean;
  calories_estimate?: number;
  notes?: string;
};

export function FoodScanner({
  profile,
  onClose,
}: {
  profile: LocalProfile;
  onClose: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const pick = () => fileRef.current?.click();

  const onFile = async (f: File) => {
    const dataUrl: string = await new Promise((res) => {
      const r = new FileReader();
      r.onload = () => res(r.result as string);
      r.readAsDataURL(f);
    });
    setPreview(dataUrl);
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch("/api/analyze-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "food", image: dataUrl }),
      });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as Result;
      setResult(data);
      await supabase.from("food_analyses").insert({
        profile_id: profile.id,
        verdict: data.verdict || "?",
        can_eat: !!data.can_eat,
        calories_estimate: data.calories_estimate ?? null,
        notes: data.notes ?? null,
      });
    } catch {
      toast("Falha ao analisar", "⚠️");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-6 pt-6 pb-24">
      <button onClick={onClose} className="font-mono text-xs text-paper-dim">← VOLTAR</button>
      <h1 className="text-[28px] mt-2">🍽️ Pode comer?</h1>
      <p className="text-paper-dim text-sm mt-1">Foto da comida e o coach diz se libera ou não.</p>

      <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ""; }} />

      {!preview && (
        <button onClick={pick} className="btn-pf bg-volt text-ink mt-6">📷 TIRAR / ESCOLHER FOTO</button>
      )}

      {preview && (
        <div className="mt-5">
          <img src={preview} alt="comida" className="w-full rounded-2xl border border-line" />
          {loading && <div className="text-center mt-4 font-mono text-volt animate-pulse">ANALISANDO…</div>}
          {result && (
            <div className={"mt-4 rounded-2xl p-5 border " + (result.can_eat ? "bg-volt/10 border-volt/40" : "bg-ember/10 border-ember/40")}>
              <div className="font-display text-2xl mb-1">
                {result.can_eat ? "✅ PODE COMER" : "⛔ EVITE"}
              </div>
              <div className="font-mono text-xs text-paper-dim mb-3">
                {result.verdict?.toUpperCase()}
                {result.calories_estimate ? ` · ~${result.calories_estimate} kcal` : ""}
              </div>
              <p className="text-[14px] text-paper">{result.notes}</p>
            </div>
          )}
          <button onClick={pick} className="btn-pf bg-transparent border border-line text-paper mt-3">TROCAR FOTO</button>
        </div>
      )}
    </div>
  );
}