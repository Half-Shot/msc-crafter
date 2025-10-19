import { useWindowEvent } from "@mantine/hooks";
import { useState } from "preact/hooks";

export function useOnlineStatus(): boolean {
    const [isOnline, setOnline] = useState(navigator.onLine);
    useWindowEvent("offline", () => setOnline(false));
    useWindowEvent("online", () => setOnline(true));
    return isOnline;
}