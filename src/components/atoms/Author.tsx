import type { PropsWithChildren } from "preact/compat";
import styled from "styled-components";

const Username = styled.span`
  font-weight: 600;
`;
const Container = styled.span`
  display: flex;
  gap: 0.5em;
`;

export function Author({ username }: PropsWithChildren<{ username: string }>) {
  return (
    <Container>
      <Username>{username}</Username>
      <span>said</span>
    </Container>
  );
}
