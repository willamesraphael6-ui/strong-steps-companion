import { useRef, useState } from "react";

export function Setup({
  onDone,
}: {
  onDone: (v: { name: string; avatar_url: string | null }) => void;
}) {
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = (f: File) => {
    const r = new FileReader();
    r.onload = () => {
      // Downscale to keep the avatar_url reasonable in DB
      const img = new Image();
      img.onload = () => {
        const size = 256;
        const c = document.createElement("canvas");
        c.width = size;
        c.height = size;
        const ctx = c.getContext("2d")!;
        // cover crop
        const s = Math.min(img.width, img.height);
        const sx = (img.width - s) / 2;
        const sy = (img.height - s) / 2;
        ctx.drawImage(img, sx, sy, s, s, 0, 0, size, size);
        setAvatar(c.toDataURL("image/jpeg", 0.82));
      };
      img.src = r.result as string;
    };
    r.readAsDataURL(f);
  };

  const submit = () => {
    if (!name.trim()) return;
    onDone({ name: name.trim(), avatar_url: avatar });
  };

  return (
    <div className="min-h-screen px-6 pt-8 pb-10 flex flex-col">
      <div className="eyebrow">Passo final</div>
      <h1 className="text-[30px] mt-1 mb-6">Monte seu perfil</h1>
      <div className="flex flex-col items-center py-2 mb-4">
        <label className="cursor-pointer">
          <div className="w-32 h-32 rounded-full border-[3px] border-dashed border-steel bg-iron overflow-hidden relative flex items-center justify-center">
            {avatar ? (
              <img
                src={avatar}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-3xl text-paper-dim">📷</span>
            )}
            <span className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-volt text-ink flex items-center justify-center text-sm border-4 border-ink">
              ✎
            </span>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
          />
        </label>
      </div>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Seu nome"
        maxLength={20}
        className="w-full bg-iron border border-line rounded-2xl px-4 py-4 text-[16px] outline-none focus:border-volt mb-3"
      />
      <button
        onClick={submit}
        disabled={!name.trim()}
        className="btn-pf bg-volt text-ink disabled:opacity-40 disabled:pointer-events-none"
      >
        CRIAR MEU PERFIL →
      </button>
      <p className="text-[11px] text-paper-dim text-center mt-6 font-mono">
        Sem senha, sem cadastro. Seu perfil fica salvo neste aparelho e sincroniza no Lovable Cloud.
      </p>
    </div>
  );
}