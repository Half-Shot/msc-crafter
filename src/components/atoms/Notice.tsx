import type { PropsWithChildren } from "preact/compat";
import styled from "styled-components";

const Container = styled.div`
  border: 1px solid;
  width: fit-content;
  margin-top: 2em;
  margin-left: auto;
  margin-right: auto;
  color: var(--mc-color-error);

  &.error {
    background-color: var(--mc-color-bg-error);
    border-color: var(--mc-color-error);
    border-radius: 4px;
    padding: 1em 1.5em;
  }

  h3 {
    color: var(--mc-color-error);
    padding: 0;
    margin: 0;
    margin-bottom: 1em;
  }
`;

export function Notice({
  heading,
  children,
  kind,
}: PropsWithChildren<{ heading: string; kind: "error" }>) {
  return (
    <Container className={kind}>
      <h3>{heading}</h3>
      {children}
    </Container>
  );
}
