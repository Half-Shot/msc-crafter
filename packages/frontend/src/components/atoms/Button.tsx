import type { ButtonHTMLAttributes } from "preact";
import type { IconType } from "react-icons/lib";
import styled from "styled-components";

const StyledButton = styled.button`
  font-size: 1.15em;
  border-radius: 0;
  border: 1px solid black;
  height: 100%;
  padding: 0.5em 0.75em;
`;

export function Button({
  icon: Icon,
  children,
  ...props
}: { icon?: IconType } & ButtonHTMLAttributes) {
  return (
    <StyledButton {...props}>
      {Icon && <Icon />}
      {children}
    </StyledButton>
  );
}
