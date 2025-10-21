import { useSessionStorage } from "@mantine/hooks";
import type { DetailsHTMLAttributes } from "preact";
import type { PropsWithChildren } from "preact/compat";

export function MemorisedDetails({
  key,
  children,
  defaultValue = true,
}: PropsWithChildren<{
  key: string;
  defaultValue: boolean,
}>): DetailsHTMLAttributes<HTMLDetailsElement> {
  const [open, setOpen] = useSessionStorage({ key, defaultValue });
  return (
    <details open={open} onToggle={(ev) => setOpen(ev.newState === "open")}>
      {children}
    </details>
  );
}
