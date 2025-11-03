import type { PropsWithChildren } from "preact/compat";
import styled from "styled-components";

const Username = styled.a`
  font-weight: 600;
`;

const UsernameNoLink = styled.span`
  font-weight: 600;
`;

const Container = styled.span`
  display: flex;
  flex-direction: row;
  gap: 0.6em;
  align-items: first baseline;
  align-items: center;
`;

const Avatar = styled.img`
  display: flex;
  width: 2em;
  border-radius: 16px;
`;

const InnerContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 0.3em;
  align-items: first baseline;
  align-items: center;
  padding: 0.25em 0;
  border-radius: var(--mc-border-radius);
`;

export function Author({
  username,
  avatarUrl,
  children,
  linkify = false,
}: PropsWithChildren<{
  username: string;
  avatarUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
  linkify?: boolean;
}>) {
  const UsernameContainer = linkify ? Username : UsernameNoLink;
  return (
    <Container>
      {children}
      <InnerContainer>
        {avatarUrl && <Avatar src={avatarUrl} />}
        <UsernameContainer
          target="_blank"
          href={`https://github.com/${username}`}
        >
          {username}
        </UsernameContainer>
      </InnerContainer>
    </Container>
  );
}
