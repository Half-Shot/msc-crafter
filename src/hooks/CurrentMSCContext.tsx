import { useContext } from "preact/hooks";
import { createContext } from "preact";
import type { PropsWithChildren } from "preact/compat";
import type { MSC } from "../model/MSC";

type CurrentState = null | {
  msc: MSC;
};
export const CurrentMSCContext = createContext<CurrentState>(null);
export const useCurrentMSC = () => useContext(CurrentMSCContext)!;

export function CurrentMSCContextProvider({
  msc,
  children,
}: PropsWithChildren<{ msc: MSC }>) {
  return (
    <CurrentMSCContext.Provider value={{ msc }}>
      {children}
    </CurrentMSCContext.Provider>
  );
}
