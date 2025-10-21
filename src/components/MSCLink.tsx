import { useMSC } from "../hooks/useLocalMSCStore";

export function MSCLink({
  mscNumber,
  kind,
}: {
  mscNumber: number;
  kind: string;
}) {
  const msc = useMSC(mscNumber, true, false);
  return (
    <>
      <a href={`#msc/${mscNumber}`}>
        {(msc && "error" in msc === false && msc.title) || `MSC${mscNumber}`}
      </a>
      <span>({kind})</span>
    </>
  );
}
