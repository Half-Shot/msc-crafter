import { useMemo } from "preact/hooks";
import type { MSC } from "../model/MSC";
import type { CachedMSC } from "./useLocalMSCStore";

export function useLocalMSCCache(): MSC[] {
  return useMemo(
    () =>
      Object.entries(localStorage)
        .filter(([k]) => k.startsWith("msccrafter.msc."))
        .map(([, v]) => JSON.parse(v) as CachedMSC)
        .map(cachedMSC => ({
          ...cachedMSC,
          created: new Date(cachedMSC.created),
          updated: new Date(cachedMSC.updated),
        })),
    [],
  );
}
