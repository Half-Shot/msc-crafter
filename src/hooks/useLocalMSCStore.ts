import type { MSC } from "../model/MSC";
import { resolveMSC } from "../github";
import { useEffect, useState } from "preact/hooks";
import { useOnlineStatus } from "./useOnlineStatus";
import { useGitHubAuth } from "./GitHubAuth";

type CachedMSC = MSC & {
    expiresAt: number;
}

const CACHE_LIVE_FOR_MS = 5 * 60000;

export function useMSC(mscNumber?: number, useCache = true): MSC|null|{error: string} {
    const [msc, setMSC] = useState<CachedMSC|null>(null);
    const isOnline = useOnlineStatus();
    const githubAuth = useGitHubAuth();

    useEffect(() => {
        if (!mscNumber || !githubAuth) {
            return;
        }

        if (!useCache) {
            // Load from cache
            const cachedItem = localStorage.getItem(`msccrafter.msc.${mscNumber}`);
            if (cachedItem) {
                const parsed = JSON.parse(cachedItem) as CachedMSC;
                if (parsed.expiresAt > Date.now() || !isOnline) {
                    setMSC(parsed);
                    return;
                }
                // Expired.
            } // Never cached.
        }

        resolveMSC(githubAuth.graphqlWithAuth, mscNumber).then((resultMsc) => {
            const v = {...resultMsc, expiresAt: Date.now() + CACHE_LIVE_FOR_MS } as CachedMSC;
            localStorage.setItem(`msccrafter.msc.${mscNumber}`, JSON.stringify(v));
            setMSC(v);
        }).catch((ex) => {
            console.error("Failed to load MSC", ex);
        });
    }, [githubAuth, mscNumber, isOnline]);

    if (!mscNumber) {
        return null;
    }
    
    return msc;
}