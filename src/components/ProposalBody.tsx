import styled from "styled-components";
import { useCurrentMSC } from "../hooks/CurrentMSCContext";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { forwardRef, type PropsWithChildren } from "preact/compat";
import rehypeRaw from "rehype-raw";

const Container = styled.article`
  font-size: 14px;
  @media screen and (max-width: 800px) {
    border-left: none;
    padding-left: 0;
  }
  text-wrap: wrap;
  pre {
    max-width: 100%;
    overflow: scroll;
  }
  table {
    border: 1px solid black;
    margin: 2em auto;

    thead {
      background-color: rgba(119, 119, 119, 1);
      color: rgba(12, 12, 12, 1);
    }

    th {
      padding: 0.5em;
    }
    td {
      padding: 0.5em;
    }
  }
`;

export function Heading({
  type,
  children,
}: PropsWithChildren<{ type: "h1" | "h2" | "h3" }>) {
  const hash = window.location.hash;
  const hashPrefix = hash.slice("#".length).split("/", 3).slice(0, 2).join("/");
  const hashID =
    typeof children === "string"
      ? `${hashPrefix}/${children.toLowerCase().replaceAll(/\s/g, "-")}`
      : undefined;

  if (!hash) {
    return;
  }

  switch (type) {
    case "h1":
      return <h1 id={hashID}>{children}</h1>;
    case "h2":
      return <h2 id={hashID}>{children}</h2>;
    case "h3":
      return <h3 id={hashID}>{children}</h3>;
  }
}

const ProposalBody = forwardRef<HTMLElement>((_props, ref) => {
  const { msc } = useCurrentMSC();

  if (!msc.body.markdown) {
    return;
  }

  return (
    <Container ref={ref}>
      <Markdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        skipHtml={false}
        components={{
          h1: ({ children }) => <Heading type="h1">{children}</Heading>,
          h2: ({ children }) => <Heading type="h2">{children}</Heading>,
          h3: ({ children }) => <Heading type="h3">{children}</Heading>,
        }}
      >
        {msc.body.markdown}
      </Markdown>
    </Container>
  );
});

export default ProposalBody;