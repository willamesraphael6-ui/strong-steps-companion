import { useEffect } from "react";

// Simple daily reminder scheduler. Fires local Notifications while the app is open.
// Persists last-fired timestamp per slot so we don't spam if the tab reopens.

const DEFAULT_SLOTS = [
  { h: 8, m: 0, title: "Bora começar 💪", body: "Missão do dia te esperando. Abre o app." },
  { h: 12, m: 30, title: "Hora da caminhada 🚶", body: "5 min de movimento agora." },
  { h: 18, m: 0, title: "Treino do fim de tarde 🔥", body: "Só 10 minutos. Vai." },
  { h: 21, m: 0, title: "Fecha o dia forte 🌙", body: "Beba água, revise sua meta." },
];

const LAST_KEY = "pf_notif_last";

function loadLast(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(LAST_KEY) || "{}");
  } catch {
    return {};
  }
}
function saveLast(v: Record<string, string>) {
  localStorage.setItem(LAST_KEY, JSON.stringify(v));
}

export function useNotificationScheduler(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    const tick = () => {
      const now = new Date();
      const today = now.toISOString().slice(0, 10);
      const last = loadLast();
      for (const s of DEFAULT_SLOTS) {
        const key = `${s.h}:${s.m}`;
        if (last[key] === today) continue;
        if (
          now.getHours() > s.h ||
          (now.getHours() === s.h && now.getMinutes() >= s.m)
        ) {
          // Fire once per slot per day
          try {
            new Notification(s.title, {
              body: s.body,
              icon: "/favicon.ico",
              tag: `pf-${key}`,
            });
          } catch {
            // ignore
          }
          last[key] = today;
          saveLast(last);
        }
      }
    };

    tick();
    const id = window.setInterval(tick, 60_000); // every minute
    return () => window.clearInterval(id);
  }, [enabled]);
}