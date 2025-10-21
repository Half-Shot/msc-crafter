import { useSessionStorage } from "@mantine/hooks";
import type { DetailsHTMLAttributes } from "preact";
import type { PropsWithChildren } from "preact/compat";

export function MemorisedDetails({
  storageKey,
  children,
  defaultValue: defaultOpen = true,
}: PropsWithChildren<{
  storageKey: string;
  defaultValue?: boolean;
}>): DetailsHTMLAttributes<HTMLDetailsElement> {
  const [open, setOpen] = useSessionStorage({
    key: storageKey,
    defaultValue: defaultOpen,
  });
  return (
    <details open={open} onToggle={(ev) => setOpen(ev.newState === "open")}>
      {children}
    </details>
  );
}
