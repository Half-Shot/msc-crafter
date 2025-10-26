import type { PropsWithChildren } from "preact/compat";
import styled from "styled-components";
import RelativeTime from "./RelativeTime";

const Username = styled.span`
  font-weight: 600;
`;
const Container = styled.span`
  display: flex;
  gap: 0.2em;
`;

export function Author({
  username,
  createdAt,
  updatedAt,
}: PropsWithChildren<{
  username: string;
  createdAt?: Date;
  updatedAt?: Date;
}>) {
  return (
    <Container>
      <Username>{username}</Username>
      <span>said</span>
      {createdAt && <RelativeTime>{createdAt}</RelativeTime>}
      {updatedAt && (
        <span>
          (Updated: <RelativeTime>{updatedAt}</RelativeTime>)
        </span>
      )}
    </Container>
  );
}
