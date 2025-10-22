import styled from "styled-components";
import { MSCSearch } from "./MSCSearch";
import { AuthButton } from "./AuthButton";
import Logo from "./logo.png";

const Container = styled.header`
  font-size: 24pt;
  width: 100%;
  max-width: 66vw;
  margin: 0 auto;
  display: flex;
  flex-direction: row;
  width: 100%;
  gap: 1em;
  flex: 3;
  justify-content: space-between;
  @media screen and (max-width: 1366px) {
    max-width: none;
  }
  @media screen and (max-width: 800px) {
    flex-direction: column;
    text-align: center;
    gap: 0.1em;
  }
`;

const Left = styled.span`
  flex: 1;
  max-width: fit-content;
`;
const Right = styled.span`
  font-size: 0.5em;
`;

const AppLogo = styled.img`
  width: 2.5em;
  margin-right: 1em;

  @media (prefers-color-scheme: dark) {
    filter: invert(80%);
  }
`;
const AppName = styled.a`
  font-weight: 600;
  font-size: 1em;
  width: fit-content;
  flex: 1;
  margin-right: 1em;
  text-decoration: none;
  &:visited {
    color: var(--mc-color-text-fg);
  }
  white-space: nowrap;
`;

export function TopBar() {
  return (
    <Container>
      <Left>
        <AppName href="#">
          <AppLogo src={Logo} />
          MSC Crafter
        </AppName>
      </Left>
      <Left>
        <MSCSearch />
      </Left>
      <Right>
        <AuthButton />
      </Right>
    </Container>
  );
}
