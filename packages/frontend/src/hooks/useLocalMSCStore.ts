import {
  MSCState,
  type Comment,
  type MSC,
  type OpenMSC,
  type Thread,
} from "../model/MSC";
import { resolveMSC } from "../github";
import { useEffect, useState } from "preact/hooks";
import { useOnlineStatus } from "./useOnlineStatus";
import { useGitHubAuth } from "./GitHubAuth";
import { HOUR_S, MONTH_S, YEAR_S } from "../time";

export type CachedComment = Omit<Comment, "created" | "updated"> & {
  created: string;
  updated?: string;
};

export type CachedThread = Omit<Thread, "comments"> & {
  comments: [CachedComment] & CachedComment[];
};

export type CachedMSC = Omit<MSC, "created" | "updated" | "threads"> & {
  expiresAt: number;
  created: string;
  updated: string;
  renderState: "full" | "partial";
  threads: CachedThread[];
};

const CACHE_LIVE_FOR_MS = HOUR_S * 500; // MSC that is updated frequently, 30 min cache.
const CACHE_LIVE_FOR_MERGED_MS = HOUR_S * 8000; // MSC that is merged, 8 hour cache.
const CACHE_LIVE_FOR_STALE_MS = MONTH_S * 1000; // MSC that is stale.

const STALE_MSC_THRESHOLD_MS = YEAR_S * 1000;

function deseraliseMSC(parsed: CachedMSC): MSC {
  return {
    ...parsed,
    threads: parsed.threads.map((t) => ({
      ...t,
      comments: t.comments.map(
        (c) =>
          ({
            ...c,
            created: new Date(c.created),
            updated: c.updated ? new Date(c.updated) : undefined,
          }) satisfies Comment,
      ) as [Comment] & Comment[],
    })),
    created: new Date(parsed.created),
    updated: new Date(parsed.updated),
  };
}

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

    if (useCache) {
      // Load from cache
      const cachedItem = localStorage.getItem(`msccrafter.msc.${mscNumber}`);
      if (cachedItem) {
        const parsed = JSON.parse(cachedItem) as CachedMSC;
        if (!fullRender || !isOnline || parsed.expiresAt > Date.now()) {
          console.log(`Loading ${mscNumber} from cache`);
          // If the render state was partial and we want a full render then we have to go again.
          if (parsed.renderState !== "partial" || !fullRender) {
            setMSC(deseraliseMSC(parsed));
            return;
          }
        }
        // Expired.
      } // Never cached.
    }

    // Only nullify after we've found the cache to be empty, to avoid flicker.
    setMSC(null);

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
          threads: resultMsc.threads.map((t) => ({
            ...t,
            comments: t.comments.map((c) => ({
              ...c,
              created: c.created.toString(),
              updated: c.updated?.toString(),
            })),
          })),
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
