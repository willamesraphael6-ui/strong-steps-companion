// Client-side device identifier — no auth, keyed by localStorage.
// A user resets their profile by clearing storage or via the app's reset button.

const DEVICE_KEY = "pf_device_id";
const PROFILE_ID_KEY = "pf_profile_id";
const CACHE_KEY = "pf_profile_cache";

export type LocalProfile = {
  id: string;
  device_id: string;
  name: string;
  avatar_url: string | null;
  level: number;
  xp: number;
  daily_step_goal: number;
  fitness_goal: string | null;
  fitness_level: string | null;
  preferred_language: string | null;
  notifications_enabled: boolean | null;
};

export function getOrCreateDeviceId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

export function setCachedProfile(p: LocalProfile) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PROFILE_ID_KEY, p.id);
  localStorage.setItem(CACHE_KEY, JSON.stringify(p));
}

export function getCachedProfile(): LocalProfile | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(CACHE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as LocalProfile;
  } catch {
    return null;
  }
}

export function clearProfileCache() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PROFILE_ID_KEY);
  localStorage.removeItem(CACHE_KEY);
}

export function xpForLevel(level: number): number {
  return 100 + (level - 1) * 150;
}

export function levelFromXp(xp: number): { level: number; xpInLevel: number; xpNeeded: number } {
  let level = 1;
  let remaining = xp;
  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level);
    level += 1;
  }
  return { level, xpInLevel: remaining, xpNeeded: xpForLevel(level) };
}

export function levelName(level: number): string {
  if (level < 3) return "Guerreiro Iniciante";
  if (level < 6) return "Aprendiz Forte";
  if (level < 10) return "Atleta Consistente";
  if (level < 15) return "Combatente";
  if (level < 22) return "Elite";
  if (level < 30) return "Predador";
  return "Lenda";
}
