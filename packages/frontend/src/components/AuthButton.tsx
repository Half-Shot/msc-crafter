import { useCallback, useState } from "preact/hooks";
import { useGitHubAuth } from "../hooks/GitHubAuth";
import type { MouseEventHandler } from "preact";
import styled from "styled-components";

const LoggedInContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

const Button = styled.button`
  margin-left: 1em;
  width: fit-content;
`;


export function AuthButton() {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const githubAuth = useGitHubAuth();

  const onLoginClick = useCallback<MouseEventHandler<HTMLButtonElement>>(
    (ev) => {
      ev.preventDefault();
      if (
        !githubAuth ||
        "getLoginURL" in githubAuth === false
      ) {
        return;
      }
      setError(null);
      setBusy(true);
      githubAuth
        .getLoginURL()
        .then((url) => {
          window.location.replace(url);
        })
        .catch((ex) => {
          setError(ex.message);
        })
        .finally(() => {
          setBusy(false);
        });
    },
    [githubAuth],
  );

  if (!githubAuth) {
    return null;
  } else if ("viewer" in githubAuth) {
    return (
      <LoggedInContainer>
        <span>Logged in as {githubAuth.viewer.login}</span>
        <Button onClick={() => githubAuth.logout()}>Logout</Button>
      </LoggedInContainer>
    );
  }

  return (
    <Button onClick={onLoginClick} disabled={busy}>{busy ? "Working on it" : "Login to GitHub"}</Button>
  );
}
