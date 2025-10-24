import classNames from "classnames";
import type { JSX, PropsWithChildren } from "preact/compat";
import styled from "styled-components";

export const ContentBlock = styled.div`
  margin-top: 1em;
  padding: var(--mc-block-padding);
  border-radius: var(--mc-border-radius);
  background: var(--mc-color-block-bg);
  border: 2px solid var(--mc-color-block-border);

  &.heading {
    padding: 0;
  }
`;

const ContentBlockContent = styled.div`
  &.padding {
    padding: var(--mc-block-padding);
  }
`;

const ContentBlockHeading = styled.span`
  width: calc(100% - var(--mc-block-padding));
  font-weight: 600;
  font-size: 1.25em;
  background: var(--mc-color-block-border);
  padding: 0.5em;
  display: block;
  border-radius: var(--mc-border-radius) var(--mc-border-radius) 0 0;
  border-bottom: 2px solid var(--mc-color-block-border);
`;

export function ContentBlockWithHeading({
  heading,
  children,
  className,
  padding = true,
}: PropsWithChildren<{
  heading: JSX.Element | string;
  className?: string;
  padding?: boolean;
}>) {
  return (
    <ContentBlock className={classNames("heading", className)}>
      <ContentBlockHeading>{heading}</ContentBlockHeading>
      <ContentBlockContent
        className={classNames(padding && !!children && "padding")}
      >
        {children}
      </ContentBlockContent>
    </ContentBlock>
  );
}
