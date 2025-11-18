import { useCallback, useRef, useState } from "preact/hooks";
import { AuthState, useGitHubAuth } from "../hooks/GitHubAuth";
import type { MouseEventHandler } from "preact";
import styled from "styled-components";
import { Author } from "./atoms/Author";
import { Button } from "./atoms/Button";

const LoggedInContainer = styled.div`
  display: flex;
  gap: 1em;
  flex-direction: row;
`;

const AuthMenuButton = styled.button`
  border: none;
  background: none;
  font-size: 1.15em;
  cursor: pointer;
`;

const UserMenu = styled.dialog`
  border: 1px solid red;
  position: absolute;
  margin: 0;
  margin-top: 3em;
  padding: var(--mc-block-padding);
  border-radius: var(--mc-border-radius);
  background: var(--mc-color-block-bg);
  border: 2px solid var(--mc-color-block-border);
`;

export function AuthMenu() {
  const [busy, setBusy] = useState(false);
  const githubAuth = useGitHubAuth();
  const menuRef = useRef<HTMLDialogElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const showModal = useCallback(() => {
    if (!menuRef.current || !buttonRef.current) {
      return;
    }
    // Ensure modal is below button
    const rect = buttonRef.current.getBoundingClientRect();
    menuRef.current.style.left = rect.left + "px";
    menuRef.current.style.top = rect.top + "px";
    menuRef.current.showModal();
  }, [menuRef]);

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

  if (githubAuth.state === AuthState.Loading) {
    return null;
  } else if (githubAuth.state === AuthState.LoggedIn) {
    return (
      <LoggedInContainer>
        <AuthMenuButton ref={buttonRef} onClick={() => showModal()}>
          <Author
            username={githubAuth.viewer.login}
            avatarUrl={githubAuth.viewer.avatarUrl}
          />
        </AuthMenuButton>
        <UserMenu closedBy="any" ref={menuRef}>
          <Button onClick={() => githubAuth.logout()}>Logout</Button>
        </UserMenu>
      </LoggedInContainer>
    );
  }

  return (
    <Button onClick={onLoginClick} disabled={busy}>
      {busy ? "Working on it" : "Login to GitHub"}
    </Button>
  );
}
