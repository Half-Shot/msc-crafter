import { useMemo } from "preact/hooks";
import type { MSC } from "../model/MSC";

export function useLocalMSCCache(): MSC[] {
  return useMemo(
    () =>
      Object.entries(localStorage)
        .filter(([k]) => k.startsWith("msccrafter.msc."))
        .map(([, v]) => JSON.parse(v) as MSC),
    [],
  );
}
