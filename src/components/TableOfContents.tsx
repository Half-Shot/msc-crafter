import type { RefObject } from "preact";
import { useEffect, useState } from "preact/hooks";
import { ContentBlockWithHeading } from "./atoms/ContentBlock";
import styled from "styled-components";

const Container = styled(ContentBlockWithHeading)`
  max-width: 100%;
  li {
    list-style: none;
    a {
      text-decoration: none;
    }
  }

  ol {
    padding: 0;
  }
  .level-h1 {
    font-weight: 600;
  }

  .level-h2 {
    margin-left: 1em;
    font-weight: 400;
  }
  .level-h3 {
    margin-left: 2em;
    font-weight: 200;
  }
`;

export function TableOfContents({
  element,
}: {
  element: RefObject<HTMLElement>;
}) {
  const [headings, setHeadings] = useState<
    { hash: string; name: string; level: string }[]
  >([]);

  useEffect(() => {
    if (headings.length) {
      return;
    }
    const headers = [
      ...(element.current?.querySelectorAll("h1,h2,h3") ?? []),
    ] as HTMLHeadingElement[];
    setHeadings(
      [...headers].map((e) => ({
        name: e.innerText,
        hash: e.id,
        level: e.tagName.toLowerCase(),
      })),
    );
  });

  return (
    <Container heading="Table of contents">
      <ol>
        {headings.map((heading) => (
          <li key={heading.hash} className={"level-" + heading.level}>
            <a href={"#" + heading.hash}>{heading.name}</a>
          </li>
        ))}
      </ol>
    </Container>
  );
}
