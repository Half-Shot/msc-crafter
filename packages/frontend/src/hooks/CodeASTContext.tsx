import { useContext, useEffect } from "preact/hooks";
import { createContext } from "preact";
import type { PropsWithChildren } from "preact/compat";
import { useCodeAST } from "./useCodeAST";
import type { Root } from "hast";

type CurrentState = null | {
  tree: Root|null;
  renderTree: () => void,
};
export const CodeASTContext = createContext<CurrentState>({tree: null, renderTree: () => {}});
export const useCodeASTContext = () => { 
  const ctx = useContext(CodeASTContext);
  useEffect(() => {
    if (!ctx?.tree) {
      ctx?.renderTree()
    }
  }, []);
  return ctx?.tree ?? null;
}

export function CodeASTContextProvider({
  body,
  children,
}: PropsWithChildren<{ body: string|null }>) {
  const [tree, renderTree] = useCodeAST(body);
  return (
    <CodeASTContext.Provider value={{ tree, renderTree }}>
      {children}
    </CodeASTContext.Provider>
  );
}
