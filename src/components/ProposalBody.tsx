import styled from "styled-components";
import { useCurrentMSC } from "../hooks/CurrentMSCContext";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/tokyo-night-dark.min.css";
import { forwardRef, type PropsWithChildren } from "preact/compat";
import rehypeRaw from "rehype-raw";
import type { Thread } from "../model/MSC";
import { MemorisedDetails } from "./MemorisedDetails";

const Container = styled.article`
  font-size: 14px;
  padding-left: 2em;
  border-left: 4px solid var(--mc-color-highlight);
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

const CommentThreadContainer = styled.div`
  padding-left: 2em;
  border: 1px solid #947a2dff;
  border-left: 4px solid #947a2dff;
`;

const SingleCommentContainer = styled.div`
  margin-left: 1em;
  border: 1px solid #2d6b94ff;
  border-left: 4px solid #2d6b94ff;
`;

const CommentedLine = styled.summary`
  text-decoration: underline dotted;
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

export function CommentThread({
  thread,
  children,
}: PropsWithChildren<{ thread: Thread }>) {
  return (
    <MemorisedDetails
      storageKey={`msccrafter.msc.comment-${thread.line}`}
      defaultValue={false}
    >
      <CommentedLine>{children}</CommentedLine>
      <CommentThreadContainer>
        <summary>Comment on line {thread.line}</summary>
        {thread.comments.map((c) => (
          <SingleCommentContainer>
            <span>{c.author.githubUsername} said</span>
            <Markdown>{c.body.markdown}</Markdown>
          </SingleCommentContainer>
        ))}
      </CommentThreadContainer>
    </MemorisedDetails>
  );
}

export const ProposalBody= forwardRef<HTMLElement>((_props, ref) => {
  const { msc } = useCurrentMSC();

  if (!msc.body.markdown) {
    return;
  }

  const lines = msc.body.markdown.split("\n");
  for (let tId = 0; tId < msc.threads.length; tId++) {
    const thread = msc.threads[tId];
    lines[thread.line - 1] =
      `<div x-thread-anchor="${tId}">` + lines[thread.line - 1] + `</div>`;
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
          div: (el) => {
            if (el["x-thread-anchor"]) {
              return (
                <CommentThread
                  thread={msc.threads[parseInt(el["x-thread-anchor"])]}
                >
                  {el.children}
                </CommentThread>
              );
            }
            return null;
          },
        }}
      >
        {lines.join("\n")}
      </Markdown>
    </Container>
  );
});
