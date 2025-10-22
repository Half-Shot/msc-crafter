import { MSCState, type MSC, type OpenMSC } from "../model/MSC";
import { resolveMSC } from "../github";
import { useEffect, useState } from "preact/hooks";
import { useOnlineStatus } from "./useOnlineStatus";
import { useGitHubAuth } from "./GitHubAuth";
import { HOUR_S, MONTH_S, YEAR_S } from "../utils/time";

export type CachedMSC = Omit<MSC, "created" | "updated"> & {
  expiresAt: number;
  created: string;
  updated: string;
  renderState: "full" | "partial";
};

const CACHE_LIVE_FOR_MS = HOUR_S * 500; // MSC that is updated frequently, 30 min cache.
const CACHE_LIVE_FOR_MERGED_MS = HOUR_S * 8000; // MSC that is merged, 8 hour cache.
const CACHE_LIVE_FOR_STALE_MS = MONTH_S * 1000; // MSC that is stale.

const STALE_MSC_THRESHOLD_MS = YEAR_S * 1000;

export function useMSC(
  mscNumber?: number,
  useCache: boolean = true,
  fullRender = true,
): MSC | null | { error: string } {
  const [msc, setMSC] = useState<MSC | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isOnline = useOnlineStatus();
  const githubAuth = useGitHubAuth();

  useEffect(() => {
    if (!mscNumber || !githubAuth || "viewer" in githubAuth !== true) {
      return;
    }
    // Nullify before load
    setMSC(null);

    if (useCache) {
      // Load from cache
      const cachedItem = localStorage.getItem(`msccrafter.msc.${mscNumber}`);
      if (cachedItem) {
        const parsed = JSON.parse(cachedItem) as CachedMSC;
        if (!fullRender || !isOnline || parsed.expiresAt > Date.now()) {
          console.log(`Loading ${mscNumber} from cache`);
          // If the render state was partial and we want a full render then we have to go again.
          if (parsed.renderState !== "partial" || !fullRender) {
            setMSC({
              ...parsed,
              created: new Date(parsed.created),
              updated: new Date(parsed.updated),
            } satisfies MSC);
            return;
          }
        }
        // Expired.
      } // Never cached.
    }

    resolveMSC(githubAuth.graphqlWithAuth, mscNumber, fullRender)
      .then((resultMsc) => {
        setError(null);
        let expiresAt = CACHE_LIVE_FOR_MS;
        const isInfrequntlyUpdated =
          Date.now() - resultMsc.updated.getTime() > STALE_MSC_THRESHOLD_MS;
        if (isInfrequntlyUpdated) {
          expiresAt = CACHE_LIVE_FOR_STALE_MS;
        } else if ((resultMsc as OpenMSC).state === MSCState.Merged) {
          expiresAt = CACHE_LIVE_FOR_MERGED_MS;
        }
        const v = {
          ...resultMsc,
          created: resultMsc.created.toString(),
          updated: resultMsc.updated.toString(),
          expiresAt: Date.now() + expiresAt,
          renderState: fullRender ? "full" : "partial",
        } as CachedMSC;
        localStorage.setItem(`msccrafter.msc.${mscNumber}`, JSON.stringify(v));
        setMSC(resultMsc);
      })
      .catch((ex) => {
        setError(ex.message);
        console.error("Failed to load MSC", ex);
      });
  }, [githubAuth, mscNumber, isOnline, useCache, fullRender]);

  if (!mscNumber) {
    return null;
  }

  if (error) {
    return { error };
  }

  return msc;
}
