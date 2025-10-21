import { useHash } from "@mantine/hooks";
import { useEffect, useState } from "preact/hooks";

export function useAppHash(): number | null {
  const [currentMSCNumber, setCurrentMSCNumber] = useState<number | null>(null);
  const [hash] = useHash();
  useEffect(() => {
    if (!hash.startsWith("#msc/")) {
      console.log("Foo");
      setCurrentMSCNumber(null);
    }
    let newNum = parseInt(hash.slice("#msc/".length).split("/", 2)[0]);
    if (newNum === currentMSCNumber) {
      return;
    }
    if (!isNaN(newNum)) {
      console.log("setNumber");
      setCurrentMSCNumber(newNum);
    }
  }, [hash]);
  console.log("Number changed");
  return currentMSCNumber;
}
