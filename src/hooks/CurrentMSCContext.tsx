import { useContext, useState, type StateUpdater } from "preact/hooks";
import { createContext } from "preact";
import type { Dispatch, PropsWithChildren } from "preact/compat";
import type { MSC } from "../model/MSC";

type ProposalHeading = {
  name: string;
  subheadings: ProposalHeading[];
  hash: string;
};

type CurrentState = null | {
  msc: MSC;
  headings: ProposalHeading[];
  setHeadings: Dispatch<StateUpdater<ProposalHeading[]>>;
};
export const CurrentMSCContext = createContext<CurrentState>(null);
export const useCurrentMSC = () => useContext(CurrentMSCContext)!;

export function CurrentMSCContextProvider({
  msc,
  children,
}: PropsWithChildren<{ msc: MSC }>) {
  const [headings, setHeadings] = useState<ProposalHeading[]>([]);
  return (
    <CurrentMSCContext.Provider value={{ msc, headings, setHeadings }}>
      {children}
    </CurrentMSCContext.Provider>
  );
}
