import { useHash } from "@mantine/hooks";

export function useAppHash(): number | null {
  const [hash] = useHash();
  if (!hash.startsWith("#msc/")) {
    return null;
  }
  const newNum = parseInt(hash.slice("#msc/".length).split("/", 2)[0]);
  if (!isNaN(newNum)) {
    return newNum;
  }
  return null;
}
