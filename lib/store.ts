"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";

/**
 * Tiny localStorage-backed stores for Saved perfumes, the Compare tray and the
 * visitor's taste profile. Wrapped in try/catch: storage can be unavailable.
 */
type Listener = () => void;

function createStore<T>(key: string, fallback: T) {
  let value: T = fallback;
  let loaded = false;
  const listeners = new Set<Listener>();
  const load = () => {
    if (loaded || typeof window === "undefined") return;
    loaded = true;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) value = JSON.parse(raw) as T;
    } catch {
      /* storage unavailable */
    }
  };
  return {
    get: () => { load(); return value; },
    getServer: () => fallback,
    set: (next: T) => {
      value = next;
      try { window.localStorage.setItem(key, JSON.stringify(next)); } catch { /* ignore */ }
      listeners.forEach((l) => l());
    },
    subscribe: (l: Listener) => {
      listeners.add(l);
      const onStorage = (e: StorageEvent) => {
        if (e.key === key) { loaded = false; load(); listeners.forEach((x) => x()); }
      };
      window.addEventListener("storage", onStorage);
      return () => { listeners.delete(l); window.removeEventListener("storage", onStorage); };
    },
  };
}

const EMPTY: string[] = [];
const savedStore = createStore<string[]>("cab_saved_v1", EMPTY);
const compareStore = createStore<string[]>("cab_compare_v1", EMPTY);

export interface TasteProfile { families: string[]; liked: string[]; disliked: string[] }
const EMPTY_PROFILE: TasteProfile = { families: [], liked: [], disliked: [] };
const profileStore = createStore<TasteProfile>("cab_profile_v1", EMPTY_PROFILE);

function useStore<T>(s: ReturnType<typeof createStore<T>>) {
  return useSyncExternalStore(s.subscribe, s.get, s.getServer);
}

export const MAX_COMPARE = 3;

export function useSaved() {
  const saved = useStore(savedStore);
  const toggle = useCallback((slug: string) => {
    const cur = savedStore.get();
    savedStore.set(cur.includes(slug) ? cur.filter((s) => s !== slug) : [...cur, slug]);
  }, []);
  const clear = useCallback(() => savedStore.set([]), []);
  return { saved, isSaved: (s: string) => saved.includes(s), toggle, clear };
}

export function useCompare() {
  const items = useStore(compareStore);
  const toggle = useCallback((slug: string) => {
    const cur = compareStore.get();
    if (cur.includes(slug)) compareStore.set(cur.filter((s) => s !== slug));
    else compareStore.set([...cur, slug].slice(-MAX_COMPARE));
  }, []);
  const set = useCallback((slugs: string[]) => compareStore.set(slugs.slice(0, MAX_COMPARE)), []);
  const clear = useCallback(() => compareStore.set([]), []);
  return { items, has: (s: string) => items.includes(s), toggle, set, clear };
}

export function useProfile() {
  const profile = useStore(profileStore);
  const update = useCallback((p: TasteProfile) => profileStore.set(p), []);
  return { profile, update };
}

/** True once mounted on the client — avoids hydration mismatches for storage-driven UI. */
export function useMounted() {
  return useSyncExternalStore(() => () => {}, () => true, () => false);
}

export function usePrefersReducedMotion() {
  const get = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sub = (cb: () => void) => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    m.addEventListener("change", cb);
    return () => m.removeEventListener("change", cb);
  };
  return useSyncExternalStore(sub, get, () => false);
}

export function useLockBody(lock: boolean) {
  useEffect(() => {
    if (!lock) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [lock]);
}
