import { graphql } from "@octokit/graphql";
import type { MSC } from "../model/MSC";
import { resolveMSC } from "../github";
import { useEffect, useMemo, useState } from "preact/hooks";
import { useDebouncedValue, useLocalStorage } from "@mantine/hooks";
import { useOnlineStatus } from "./useOnlineStatus";

type CachedMSC = MSC & {
    expiresAt: number;
}

const CACHE_LIVE_FOR_MS = 5 * 60000;

export function useMSC(mscNumber?: number): MSC|null|{error: string} {
    const [msc, setMSC] = useState<CachedMSC|null>(null);
    const isOnline = useOnlineStatus();
    const [gitHubToken] = useLocalStorage<string|null>({ key: 'msccrafter.token', defaultValue: null });
    const graphqlWithAuth = useMemo(() => {
        if (!gitHubToken) {
            return null;
        }
        return graphql.defaults({
        headers: {
            authorization: `token ${gitHubToken}`,
        },
        });
    }, [gitHubToken]);

    useEffect(() => {
        if (!mscNumber || !graphqlWithAuth || !isOnline) {
            return;
        }

        // Load from cache
        const cachedItem = localStorage.getItem(`msccrafter.msc.${mscNumber}`);
        if (cachedItem) {
            const parsed = JSON.parse(cachedItem) as CachedMSC;
            if (parsed.expiresAt > Date.now()) {
                setMSC(parsed);
                return;
            }
            // Expired.
        } // Never cached.

        resolveMSC(graphqlWithAuth, mscNumber).then((resultMsc) => {
            const v = {...resultMsc, expiresAt: Date.now() + CACHE_LIVE_FOR_MS } as CachedMSC;
            localStorage.setItem(`msccrafter.msc.${mscNumber}`, JSON.stringify(v));
            setMSC(v);
        }).catch((ex) => {
            console.error("Failed to load MSC", ex);
        });
    }, [graphqlWithAuth, mscNumber, isOnline]);

    if (!mscNumber) {
        return null;
    }
    
    return msc;
}