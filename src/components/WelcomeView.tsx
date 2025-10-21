import styled from "styled-components";
import { useRecentMSCs } from "../hooks/useRecentMSCs";
import { useLocalMSCCache } from "../hooks/useLocalMSCCache";
import { useGitHubAuth } from "../hooks/GitHubAuth";
import { useMemo } from "preact/hooks";

const WelcomeContent = styled.main`
  font-size: 20px;
  display: flex;
  gap: 4em;
`;

const Column = styled.div`
  li {
    list-style: none;
  }
`;

export function WelcomeView() {
  const auth = useGitHubAuth();
  const [recentMSCs] = useRecentMSCs();
  const allMSCs = useLocalMSCCache();

  const yourMSCs = useMemo(() => {
    if (!auth || "viewer" in auth === false) {
      return;
    }
    return allMSCs.filter((m) => m.author.githubUsername === auth.viewer.login);
  }, [auth, allMSCs]);

  return (
    <WelcomeContent>
      <Column>
        <h2>Recently viewed MSCs</h2>
        <ul>
          {recentMSCs.map((m) => (
            <li key={m.hash}>
              <a href={m.hash}>{m.title}</a>
            </li>
          ))}
        </ul>
      </Column>
      <Column>
        <h2>Your MSCs</h2>
        {yourMSCs && (
          <ul>
            {yourMSCs.map((m) => (
              <li key={m.prNumber}>
                <a href={`#msc/${m.prNumber}`}>{m.title}</a>
              </li>
            ))}
          </ul>
        )}
        {!yourMSCs && <p> Login to view your MSCs.</p>}
      </Column>
    </WelcomeContent>
  );
}
