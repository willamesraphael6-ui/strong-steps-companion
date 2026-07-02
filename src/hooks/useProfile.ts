import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  getOrCreateDeviceId,
  getCachedProfile,
  setCachedProfile,
  clearProfileCache,
  type LocalProfile,
} from "@/lib/profile-storage";

export function useProfile() {
  const [profile, setProfile] = useState<LocalProfile | null>(() =>
    getCachedProfile(),
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const deviceId = getOrCreateDeviceId();
      if (!deviceId) {
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("device_id", deviceId)
        .maybeSingle();
      if (cancelled) return;
      if (data) {
        setProfile(data as unknown as LocalProfile);
        setCachedProfile(data as unknown as LocalProfile);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const create = useCallback(
    async (input: {
      name: string;
      avatar_url: string | null;
      fitness_goal?: string;
      fitness_level?: string;
    }) => {
      const deviceId = getOrCreateDeviceId();
      const { data, error } = await supabase
        .from("profiles")
        .upsert(
          {
            device_id: deviceId,
            name: input.name,
            avatar_url: input.avatar_url,
            fitness_goal: input.fitness_goal ?? null,
            fitness_level: input.fitness_level ?? null,
          },
          { onConflict: "device_id" },
        )
        .select()
        .single();
      if (error) throw error;
      setProfile(data as unknown as LocalProfile);
      setCachedProfile(data as unknown as LocalProfile);
      return data as unknown as LocalProfile;
    },
    [],
  );

  const update = useCallback(
    async (patch: Partial<LocalProfile>) => {
      if (!profile) return;
      const { data, error } = await supabase
        .from("profiles")
        .update(patch)
        .eq("id", profile.id)
        .select()
        .single();
      if (error) throw error;
      setProfile(data as unknown as LocalProfile);
      setCachedProfile(data as unknown as LocalProfile);
    },
    [profile],
  );

  const reset = useCallback(() => {
    clearProfileCache();
    setProfile(null);
  }, []);

  return { profile, loading, create, update, reset };
}