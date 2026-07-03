import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "./Toast";
import type { LocalProfile } from "@/lib/profile-storage";

type Result = {
  body_type?: string;
  strengths?: string;
  focus_areas?: string;
  recommendations?: string;
};

export function BodyScan({
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
        body: JSON.stringify({ kind: "body", image: dataUrl }),
      });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as Result;
      setResult(data);
      await supabase.from("body_analyses").insert({
        profile_id: profile.id,
        body_type: data.body_type ?? null,
        strengths: data.strengths ?? null,
        focus_areas: data.focus_areas ?? null,
        recommendations: data.recommendations ?? null,
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
      <h1 className="text-[28px] mt-2">💪 Avaliação corporal</h1>
      <p className="text-paper-dim text-sm mt-1">
        Tira uma foto de corpo inteiro (roupa de treino). O coach classifica o biotipo e sugere foco.
      </p>

      <input ref={fileRef} type="file" accept="image/*" capture="user" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ""; }} />

      {!preview && (
        <button onClick={() => fileRef.current?.click()} className="btn-pf bg-volt text-ink mt-6">
          📷 TIRAR FOTO
        </button>
      )}

      {preview && (
        <div className="mt-5">
          <img src={preview} alt="corpo" className="w-full rounded-2xl border border-line max-h-[420px] object-contain bg-iron" />
          {loading && <div className="text-center mt-4 font-mono text-volt animate-pulse">ANALISANDO…</div>}
          {result && (
            <div className="mt-4 space-y-3">
              <Card label="BIOTIPO" val={result.body_type || "-"} />
              <Card label="PONTOS FORTES" val={result.strengths || "-"} />
              <Card label="FOCO" val={result.focus_areas || "-"} />
              <Card label="RECOMENDAÇÕES" val={result.recommendations || "-"} big />
            </div>
          )}
          <button onClick={() => fileRef.current?.click()} className="btn-pf bg-transparent border border-line text-paper mt-4">TROCAR FOTO</button>
        </div>
      )}
    </div>
  );
}

function Card({ label, val, big }: { label: string; val: string; big?: boolean }) {
  return (
    <div className="bg-iron border border-line rounded-2xl p-4">
      <div className="font-mono text-[10.5px] text-volt tracking-wider">{label}</div>
      <div className={"mt-1 " + (big ? "text-[14.5px]" : "text-[15px] font-semibold")}>
        {val.split("|").map((s, i) => (
          <div key={i} className="mb-0.5">{s.trim()}</div>
        ))}
      </div>
    </div>
  );
}