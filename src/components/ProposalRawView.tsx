import styled from "styled-components";
import { useCurrentMSC } from "../hooks/CurrentMSCContext";
import Markdown from "react-markdown";
import "highlight.js/styles/tokyo-night-dark.min.css";
import { useMemo, type PropsWithChildren } from "preact/compat";
import type { Thread } from "../model/MSC";
import { MemorisedDetails } from "./MemorisedDetails";
import highlightjs from "highlight.js";

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

const Container = styled.article`
  display: flex;
  flex-direction: column;
  gap: 0.25em;
  font-family: monospace;
  font-size: 1.2em;
  overflow-y: scroll;
  background: var(--mc-color-bg-texteditor);
`;

const LineNumber = styled.span`
  font: monospace;
  text-align: right;
  user-select: none;
`;
const CodeLine = styled.code`
  white-space-collapse: preserve;
  display: flex;
  gap: 1em;
  text-align: left;
`;

const Line = styled.div`
  display: flex;
  flex-direction: row;
  gap: 0.5em;
`;

// TODO: We should use starrynight.

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

export const ProposalRawView = (props: { showThreads: boolean }) => {
  const { msc } = useCurrentMSC();

  const highlightedCode = useMemo(
    () =>
      msc.body.markdown &&
      highlightjs.highlight(msc.body.markdown, { language: "markdown" }),
    [msc.body.markdown],
  );

  if (!highlightedCode) {
    return;
  }

  return (
    <Container>
      <pre dangerouslySetInnerHTML={{ __html: highlightedCode.value }} />
    </Container>
  );
};
