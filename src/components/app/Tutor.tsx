import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import tutorAvatar from "@/assets/tutor-avatar.jpg";
import type { LocalProfile } from "@/lib/profile-storage";

type Mode = "chat" | "call";

export function Tutor({ profile }: { profile: LocalProfile }) {
  const [mode, setMode] = useState<Mode>("chat");
  const systemContext = `Nome: ${profile.name}. Nível: ${profile.level}. Objetivo: ${profile.fitness_goal || "não informado"}. Nível fitness: ${profile.fitness_level || "não informado"}.`;

  const transport = useState(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { systemContext },
      }),
  )[0];

  const { messages, sendMessage, status } = useChat({
    transport,
    id: "tutor-" + profile.id,
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-4 border-b border-line">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={tutorAvatar}
              alt="Coach PF"
              className="w-11 h-11 rounded-full object-cover ring-2 ring-volt"
              width={44}
              height={44}
              loading="lazy"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-volt border-2 border-ink" />
          </div>
          <div>
            <div className="font-display text-lg leading-none">COACH PF</div>
            <div className="text-[11px] font-mono text-volt mt-0.5">
              {status === "streaming" ? "digitando…" : "online agora"}
            </div>
          </div>
        </div>
        <button
          onClick={() => setMode(mode === "chat" ? "call" : "chat")}
          className="w-11 h-11 rounded-full bg-ember text-ink flex items-center justify-center text-lg active:scale-95 transition"
          aria-label={mode === "chat" ? "Iniciar chamada" : "Voltar ao chat"}
        >
          {mode === "chat" ? "📞" : "💬"}
        </button>
      </div>

      {mode === "chat" ? (
        <ChatView messages={messages} status={status} sendMessage={sendMessage} />
      ) : (
        <CallView profileName={profile.name} onEnd={() => setMode("chat")} />
      )}
    </div>
  );
}

function ChatView({
  messages,
  status,
  sendMessage,
}: {
  messages: ReturnType<typeof useChat>["messages"];
  status: ReturnType<typeof useChat>["status"];
  sendMessage: ReturnType<typeof useChat>["sendMessage"];
}) {
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const send = useCallback(() => {
    const t = text.trim();
    if (!t || status === "streaming" || status === "submitted") return;
    setText("");
    sendMessage({ text: t });
  }, [text, status, sendMessage]);

  const sendImage = useCallback(
    async (file: File) => {
      const dataUrl: string = await new Promise((res) => {
        const r = new FileReader();
        r.onload = () => res(r.result as string);
        r.readAsDataURL(file);
      });
      sendMessage({
        files: [
          {
            type: "file",
            mediaType: file.type || "image/jpeg",
            url: dataUrl,
          },
        ],
        text: "Analisa esta imagem para mim, coach.",
      });
    },
    [sendMessage],
  );

  const busy = status === "streaming" || status === "submitted";

  return (
    <>
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-3"
      >
        {messages.length === 0 && (
          <div className="text-center text-paper-dim text-sm py-8">
            <p className="mb-2">Fale comigo. Posso montar seu treino, sugerir refeições, analisar sua forma por foto ou dar aula de idiomas.</p>
          </div>
        )}
        {messages.map((m) => {
          const text = m.parts
            .map((p) => (p.type === "text" ? p.text : ""))
            .join("");
          return (
            <div
              key={m.id}
              className={
                m.role === "user"
                  ? "max-w-[82%] self-end bg-volt text-ink px-4 py-2.5 rounded-2xl rounded-br-md text-[14.5px] font-medium whitespace-pre-wrap"
                  : "max-w-[82%] self-start bg-iron border border-line px-4 py-2.5 rounded-2xl rounded-bl-md text-[14.5px] whitespace-pre-wrap"
              }
            >
              {text || (m.role === "assistant" && busy ? "…" : "")}
            </div>
          );
        })}
      </div>
      <div className="flex gap-2 px-4 pt-3 pb-2 overflow-x-auto">
        {[
          "Monta meu treino de hoje",
          "O que comer no almoço?",
          "Aula rápida de inglês",
          "Como fazer agachamento?",
        ].map((q) => (
          <button
            key={q}
            onClick={() => sendMessage({ text: q })}
            className="font-mono text-[11.5px] px-3 py-2 rounded-2xl bg-iron border border-line text-paper-dim whitespace-nowrap active:scale-95"
          >
            {q}
          </button>
        ))}
      </div>
      <div className="flex gap-2 px-4 py-3 border-t border-line sticky bottom-0 bg-ink">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) sendImage(f);
            e.target.value = "";
          }}
        />
        <button
          onClick={() => fileRef.current?.click()}
          className="w-11 h-11 rounded-full bg-iron border border-line text-paper flex items-center justify-center text-lg shrink-0 active:scale-95"
          aria-label="Enviar imagem"
        >
          📷
        </button>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Pergunta pro coach…"
          className="flex-1 bg-iron border border-line rounded-full px-4 text-[14.5px] text-paper outline-none focus:border-volt"
        />
        <button
          onClick={send}
          disabled={busy || !text.trim()}
          className="w-11 h-11 rounded-full bg-volt text-ink flex items-center justify-center text-lg shrink-0 disabled:opacity-40 active:scale-95"
          aria-label="Enviar"
        >
          →
        </button>
      </div>
    </>
  );
}

function CallView({
  profileName,
  onEnd,
}: {
  profileName: string;
  onEnd: () => void;
}) {
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [status, setStatus] = useState<
    "idle" | "listening" | "thinking" | "speaking" | "error"
  >("idle");
  const [transcript, setTranscript] = useState("");
  const [reply, setReply] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const historyRef = useRef<{ role: "user" | "assistant"; content: string }[]>(
    [],
  );

  // Start camera + mic
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: { facingMode: "user", width: 640, height: 480 },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      } catch (e) {
        console.error(e);
        setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      recorderRef.current?.stop();
      audioRef.current?.pause();
    };
  }, []);

  useEffect(() => {
    streamRef.current
      ?.getAudioTracks()
      .forEach((t) => (t.enabled = micOn));
  }, [micOn]);
  useEffect(() => {
    streamRef.current
      ?.getVideoTracks()
      .forEach((t) => (t.enabled = camOn));
  }, [camOn]);

  const startRecording = () => {
    if (!streamRef.current || status === "thinking" || status === "speaking")
      return;
    const audioStream = new MediaStream(
      streamRef.current.getAudioTracks(),
    );
    const mime = MediaRecorder.isTypeSupported("audio/webm")
      ? "audio/webm"
      : "audio/mp4";
    const rec = new MediaRecorder(audioStream, { mimeType: mime });
    chunksRef.current = [];
    rec.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    rec.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: mime });
      if (blob.size < 800) {
        setStatus("idle");
        return;
      }
      await processAudio(blob, mime);
    };
    recorderRef.current = rec;
    rec.start();
    setStatus("listening");
  };

  const stopRecording = () => {
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
      setStatus("thinking");
    }
  };

  const processAudio = async (blob: Blob, mime: string) => {
    try {
      setStatus("thinking");
      setTranscript("");
      setReply("");
      const ext = mime.includes("mp4") ? "m4a" : "webm";
      const fd = new FormData();
      fd.append("file", blob, `voice.${ext}`);
      const sttRes = await fetch("/api/stt", { method: "POST", body: fd });
      if (!sttRes.ok) throw new Error("STT failed");
      const sttData = (await sttRes.json()) as { text?: string };
      const userText = (sttData.text || "").trim();
      if (!userText) {
        setStatus("idle");
        return;
      }
      setTranscript(userText);
      historyRef.current.push({ role: "user", content: userText });

      // Get reply (non-streaming for simplicity in call mode)
      const chatRes = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: historyRef.current.map((m, i) => ({
            id: String(i),
            role: m.role,
            parts: [{ type: "text", text: m.content }],
          })),
          systemContext: `Você está em uma chamada de voz com ${profileName}. Respostas MUITO curtas (1-3 frases), tom natural de conversa falada. Sem listas nem markdown.`,
        }),
      });
      const chatText = await chatRes.text();
      // Parse UI message stream (SSE-like data lines). Extract text-delta tokens.
      const replyText = extractReplyFromStream(chatText);
      if (!replyText) throw new Error("no reply");
      historyRef.current.push({ role: "assistant", content: replyText });
      setReply(replyText);

      // TTS
      setStatus("speaking");
      const ttsRes = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: replyText, voice: "onyx" }),
      });
      if (!ttsRes.ok) throw new Error("TTS failed");
      const audioBlob = await ttsRes.blob();
      const url = URL.createObjectURL(audioBlob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => {
        setStatus("idle");
        URL.revokeObjectURL(url);
      };
      await audio.play();
    } catch (e) {
      console.error(e);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 1500);
    }
  };

  return (
    <div className="flex-1 relative bg-ink flex flex-col">
      {/* Tutor avatar big */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6">
        <motion.div
          animate={
            status === "speaking"
              ? { scale: [1, 1.06, 1] }
              : status === "listening"
                ? { scale: [1, 1.03, 1] }
                : { scale: 1 }
          }
          transition={{
            duration: status === "speaking" ? 0.6 : 1.2,
            repeat: Infinity,
          }}
          className="relative"
        >
          <div className="absolute inset-0 rounded-full bg-volt/30 blur-3xl" />
          <img
            src={tutorAvatar}
            alt="Coach PF"
            className="relative w-52 h-52 rounded-full object-cover ring-4 ring-volt/60"
            width={208}
            height={208}
          />
        </motion.div>
        <div className="text-center">
          <div className="font-display text-2xl">COACH PF</div>
          <div className="font-mono text-xs text-volt mt-1">
            {status === "idle" && "toque para falar"}
            {status === "listening" && "ouvindo…"}
            {status === "thinking" && "pensando…"}
            {status === "speaking" && "falando…"}
            {status === "error" && "erro — tenta de novo"}
          </div>
        </div>
        {transcript && (
          <div className="text-xs text-paper-dim italic max-w-xs text-center">
            "{transcript}"
          </div>
        )}
        <AnimatePresence>
          {reply && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="max-w-xs text-center text-sm text-paper bg-iron/70 border border-line rounded-2xl px-4 py-3"
            >
              {reply}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* User video PIP */}
      <div className="absolute top-4 right-4 w-24 h-32 rounded-2xl overflow-hidden border-2 border-line bg-iron">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className={"w-full h-full object-cover " + (camOn ? "" : "hidden")}
        />
        {!camOn && (
          <div className="w-full h-full flex items-center justify-center text-xl">
            📷
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 py-6 pb-24">
        <button
          onClick={() => setMicOn((v) => !v)}
          className={
            "w-14 h-14 rounded-full flex items-center justify-center text-xl active:scale-95 " +
            (micOn ? "bg-iron border border-line" : "bg-ember text-ink")
          }
          aria-label="Microfone"
        >
          {micOn ? "🎙️" : "🔇"}
        </button>
        <button
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
          onTouchStart={startRecording}
          onTouchEnd={stopRecording}
          disabled={!micOn || status === "thinking" || status === "speaking"}
          className={
            "w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-ink active:scale-95 transition disabled:opacity-40 " +
            (status === "listening"
              ? "bg-ember animate-pulse"
              : "bg-volt")
          }
          aria-label="Segure para falar"
        >
          {status === "listening" ? "●" : "🎤"}
        </button>
        <button
          onClick={() => setCamOn((v) => !v)}
          className={
            "w-14 h-14 rounded-full flex items-center justify-center text-xl active:scale-95 " +
            (camOn ? "bg-iron border border-line" : "bg-ember text-ink")
          }
          aria-label="Câmera"
        >
          {camOn ? "📹" : "🎥"}
        </button>
        <button
          onClick={onEnd}
          className="w-14 h-14 rounded-full bg-ember-deep text-paper flex items-center justify-center text-xl active:scale-95"
          aria-label="Encerrar"
        >
          ✕
        </button>
      </div>
      <p className="text-[11px] text-paper-dim text-center px-6 -mt-16 mb-2 font-mono">
        Segure o botão verde para falar. Solte para o coach responder.
      </p>
    </div>
  );
}

function extractReplyFromStream(raw: string): string {
  // Handles AI SDK UI message stream (data: {json}\n\n lines) or plain text.
  let out = "";
  const lines = raw.split(/\r?\n/);
  for (const line of lines) {
    const trim = line.trim();
    if (!trim) continue;
    const data = trim.startsWith("data:") ? trim.slice(5).trim() : trim;
    if (data === "[DONE]") continue;
    try {
      const obj = JSON.parse(data);
      // v5 UI stream shapes
      if (obj.type === "text-delta" && typeof obj.delta === "string") {
        out += obj.delta;
      } else if (obj.type === "text" && typeof obj.text === "string") {
        out += obj.text;
      } else if (typeof obj.textDelta === "string") {
        out += obj.textDelta;
      }
    } catch {
      // ignore non-json lines
    }
  }
  return out.trim();
}