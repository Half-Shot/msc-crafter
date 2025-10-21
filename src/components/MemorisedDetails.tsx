import { useSessionStorage } from "@mantine/hooks";
import type { DetailsHTMLAttributes } from "preact";
import type { PropsWithChildren } from "preact/compat";

export function MemorisedDetails({
  key,
  children,
}: PropsWithChildren<{
  key: string;
}>): DetailsHTMLAttributes<HTMLDetailsElement> {
  const [open, setOpen] = useSessionStorage({ key, defaultValue: true });
  return (
    <details open={open} onToggle={(ev) => setOpen(ev.newState === "open")}>
      {children}
    </details>
  );
}
