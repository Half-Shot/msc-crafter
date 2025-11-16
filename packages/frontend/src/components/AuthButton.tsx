import { useCallback, useState } from "preact/hooks";
import { useGitHubAuth } from "../hooks/GitHubAuth";
import type { MouseEventHandler } from "preact";
import styled from "styled-components";
import { Author } from "./atoms/Author";
import { Button } from "./atoms/Button";

const LoggedInContainer = styled.div`
  display: flex;
  gap: 1em;
  flex-direction: row;
`;

export function AuthButton() {
  const [busy, setBusy] = useState(false);
  const githubAuth = useGitHubAuth();

  const onLoginClick = useCallback<MouseEventHandler<HTMLButtonElement>>(
    (ev) => {
      ev.preventDefault();
      if (!githubAuth || "getLoginURL" in githubAuth === false) {
        return;
      }
      setBusy(true);
      githubAuth
        .getLoginURL()
        .then((url) => {
          window.location.replace(url);
        })
        .catch((ex) => {
          // TODO: Log this to the user somehow.
          console.error("Failed to login:", ex.message);
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
        <Author
          username={githubAuth.viewer.login}
          avatarUrl={githubAuth.viewer.avatarUrl}
        >
          Logged in as
        </Author>
        <Button onClick={() => githubAuth.logout()}>Logout</Button>
      </LoggedInContainer>
    );
  }

  return (
    <Button onClick={onLoginClick} disabled={busy}>
      {busy ? "Working on it" : "Login to GitHub"}
    </Button>
  );
}
