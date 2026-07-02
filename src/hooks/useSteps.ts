import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Peak-detection pedometer using DeviceMotionEvent.
 * Works on real mobile devices. Requires explicit user gesture to
 * request permission on iOS (see requestPermission).
 */

const TODAY = () => new Date().toISOString().slice(0, 10);

type StepState = {
  steps: number;
  permission: "unknown" | "granted" | "denied" | "unsupported";
  active: boolean;
};

export function useSteps(profileId: string | null) {
  const [state, setState] = useState<StepState>({
    steps: 0,
    permission: "unknown",
    active: false,
  });
  const bufferRef = useRef<number[]>([]);
  const lastStepAtRef = useRef<number>(0);
  const listenerRef = useRef<((e: DeviceMotionEvent) => void) | null>(null);
  const dirtyRef = useRef(false);
  const stepsRef = useRef(0);

  // Load today's steps from cloud
  useEffect(() => {
    if (!profileId) return;
    (async () => {
      const { data } = await supabase
        .from("daily_stats")
        .select("steps")
        .eq("profile_id", profileId)
        .eq("date", TODAY())
        .maybeSingle();
      if (data?.steps) {
        setState((s) => ({ ...s, steps: data.steps }));
        stepsRef.current = data.steps;
      }
    })();
  }, [profileId]);

  // Persist every 15s if dirty
  useEffect(() => {
    if (!profileId) return;
    const t = setInterval(async () => {
      if (!dirtyRef.current) return;
      dirtyRef.current = false;
      const steps = stepsRef.current;
      const distance_m = Math.round(steps * 0.762);
      const calories = Math.round(steps * 0.04);
      const active_minutes = Math.round(steps / 100);
      await supabase.from("daily_stats").upsert(
        {
          profile_id: profileId,
          date: TODAY(),
          steps,
          distance_m,
          calories,
          active_minutes,
        },
        { onConflict: "profile_id,date" },
      );
    }, 15000);
    return () => clearInterval(t);
  }, [profileId]);

  const stop = useCallback(() => {
    if (listenerRef.current) {
      window.removeEventListener("devicemotion", listenerRef.current);
      listenerRef.current = null;
    }
    setState((s) => ({ ...s, active: false }));
  }, []);

  const start = useCallback(() => {
    if (listenerRef.current) return;
    if (typeof window === "undefined" || !("DeviceMotionEvent" in window)) {
      setState((s) => ({ ...s, permission: "unsupported" }));
      return;
    }
    const handler = (e: DeviceMotionEvent) => {
      const a = e.accelerationIncludingGravity;
      if (!a) return;
      const mag = Math.sqrt(
        (a.x || 0) ** 2 + (a.y || 0) ** 2 + (a.z || 0) ** 2,
      );
      const buf = bufferRef.current;
      buf.push(mag);
      if (buf.length > 15) buf.shift();
      if (buf.length < 15) return;
      const avg = buf.reduce((s, v) => s + v, 0) / buf.length;
      const now = Date.now();
      // Simple peak: current sample above avg by threshold and enough gap
      if (mag > avg + 1.6 && now - lastStepAtRef.current > 320) {
        lastStepAtRef.current = now;
        stepsRef.current += 1;
        dirtyRef.current = true;
        setState((s) => ({ ...s, steps: stepsRef.current }));
      }
    };
    listenerRef.current = handler;
    window.addEventListener("devicemotion", handler);
    setState((s) => ({ ...s, active: true, permission: "granted" }));
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof window === "undefined" || !("DeviceMotionEvent" in window)) {
      setState((s) => ({ ...s, permission: "unsupported" }));
      return "unsupported" as const;
    }
    const DM = window.DeviceMotionEvent as unknown as {
      requestPermission?: () => Promise<"granted" | "denied">;
    };
    if (typeof DM.requestPermission === "function") {
      try {
        const res = await DM.requestPermission();
        if (res === "granted") {
          start();
          return "granted" as const;
        }
        setState((s) => ({ ...s, permission: "denied" }));
        return "denied" as const;
      } catch {
        setState((s) => ({ ...s, permission: "denied" }));
        return "denied" as const;
      }
    }
    // Android / desktop — no permission gate
    start();
    return "granted" as const;
  }, [start]);

  useEffect(() => stop, [stop]);

  return { ...state, requestPermission, stop, start };
}