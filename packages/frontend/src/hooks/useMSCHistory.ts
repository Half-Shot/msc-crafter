import { useEffect, useState } from "preact/hooks";
import { useCurrentMSC } from "./CurrentMSCContext";
import { resolveMSCHistory } from "../github/resolveMSCHistory";
import { useGitHubAuth } from "./GitHubAuth";
import type { CommitHistory } from "../models/history";

export function useMSCHistory(): {
  history: CommitHistory[];
  paginateBackwards?: () => void;
} {
  const { msc } = useCurrentMSC();
  const auth = useGitHubAuth();
  const [currentHistory, setCurrentHistory] = useState<CommitHistory[]>([]);
  const [nextToken, setNextToken] = useState<string | null | undefined>(
    undefined,
  );
  const [currentToken, setCurrentToken] = useState<string | undefined>();
  useEffect(() => {
    if (nextToken !== undefined) {
      // Only execute if we need more results.
      return;
    }
    if (auth && "graphqlWithAuth" in auth) {
      resolveMSCHistory(auth.graphqlWithAuth, msc.prNumber, currentToken)
        .then(({ history, token }) => {
          setCurrentHistory((existing) => [...existing, ...history]);
          setNextToken(token);
        })
        .catch((ex) => {
          console.warn("Failed to get MSC history", ex);
        });
    }
  }, [msc, auth, currentToken, nextToken]);

  return {
    history: currentHistory,
    paginateBackwards: nextToken
      ? () => {
          setCurrentToken(nextToken);
          setNextToken(undefined);
        }
      : undefined,
  };
}
