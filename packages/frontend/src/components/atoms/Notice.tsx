import type { PropsWithChildren } from "preact/compat";
import styled from "styled-components";

const Container = styled.div`
  border: 1px solid;
  width: fit-content;
  margin-top: 2em;
  margin-left: auto;
  margin-right: auto;
  padding: 1em 1.5em;
  border-radius: var(--mc-border-radius);
  max-width: 40em;

  &.error {
    color: var(--mc-color-error);
    background-color: var(--mc-color-bg-error);
    h3 {
      color: var(--mc-color-error);
    }
  }

  &.notice {
    color: var(--mc-color-notice);
    background-color: var(--mc-color-bg-notice);
    h3 {
      color: var(--mc-color-notice);
    }
  }

  h3 {
    padding: 0;
    margin: 0;
    margin-bottom: 1em;
  }
`;

export function Notice({
  heading,
  children,
  kind,
}: PropsWithChildren<{ heading: string; kind: "error" | "notice" }>) {
  return (
    <Container className={kind}>
      <h3>{heading}</h3>
      {children}
    </Container>
  );
}
