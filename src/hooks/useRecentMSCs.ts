import { useCallback } from "preact/hooks";
import { useLocalStorage, useSessionStorage } from "@mantine/hooks";

type RecentMSC = { title: string; hash: string; date: number };

export function useRecentMSCs(): [
  RecentMSC[],
  (msc: { title: string; hash: string }) => void,
] {
  const [recentMSCs, setRecentMSCs] = useLocalStorage<RecentMSC[]>({
    key: "msccrafter.recents",
    defaultValue: [],
  });
  const [lastRecent, setLastRecent] = useSessionStorage({
    key: "msccrafter.last_recent",
  });

  const addRecent = useCallback(
    (msc: { title: string; hash: string }) => {
      if (msc.hash === lastRecent) {
        return;
      }
      setLastRecent(msc.hash);
      setRecentMSCs((existingSet) => {
        const cloneSet = [...existingSet];
        let existing = cloneSet.find((m) => m.hash === msc.hash);
        if (!existing) {
          cloneSet.push({
            ...msc,
            date: Date.now(),
          });
        } else {
          existing.date = Date.now();
        }
        return cloneSet;
      });
    },
    [lastRecent],
  );

  return [recentMSCs.sort((a, b) => b.date - a.date), addRecent];
}
