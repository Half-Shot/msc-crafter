import { useCallback, useRef, useState } from "preact/hooks";
import { useGitHubAuth } from "../hooks/GitHubAuth";
import type { SubmitEventHandler } from "preact";
import styled from "styled-components";

const LoggedInContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const Button = styled.button`
  width: fit-content;
`;

export function AuthButton() {
  const tokenInput = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [showTokenForm, setShowTokenForm] = useState(false);
  const githubAuth = useGitHubAuth();

  const onSubmitForm = useCallback<SubmitEventHandler<HTMLFormElement>>(
    (ev) => {
      ev.preventDefault();
      if (
        !githubAuth ||
        "checkAndStoreToken" in githubAuth === false ||
        !tokenInput.current
      ) {
        return;
      }
      setError(null);
      setBusy(true);
      githubAuth
        .checkAndStoreToken(tokenInput.current?.value)
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

  if (showTokenForm) {
    return (
      <form onSubmit={onSubmitForm}>
        {error && <p>Error: {error}</p>}
        <input
          disabled={busy}
          ref={tokenInput}
          type="password"
          placeholder="GitHub PAT"
        />
        <Button disabled={busy}>Store token</Button>
      </form>
    );
  }
  return (
    <Button onClick={() => setShowTokenForm(true)}>Login to GitHub</Button>
  );
}
