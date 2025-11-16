import styled from "styled-components";

import { useState } from "preact/compat";
import type { Thread } from "../../models/MSC";
import { ContentBlockWithHeading } from "../atoms/ContentBlock";
import Markdown from "../atoms/Markdown";
import { CommentAuthor } from "../atoms/CommentAuthor";
import { GoChevronDown, GoChevronUp } from "react-icons/go";
import classNames from "classnames";

const ThreadContainer = styled(ContentBlockWithHeading)`
  margin-top: 0;
  width: fit-content;
  > span {
    font-size: 0.8em;
  }
  &.withLineNumbers {
    margin-left: 2em;
  }
`;

const ThreadComment = styled.div`
  border-radius: 0.5em;
  margin-top: 0.25em;
  padding: 0 1em;
`;

const ThreadTitle = styled.span`
  display: flex;
  gap: 0.5em;
`;

const ThreadPreview = styled.span`
  font-family: var(--mc-font-monospace);
  background: var(--mc-color-bg);
  padding-left: 0.2em;
  border-radius: 0.5em;
`;

const ThreadCommentContent = styled.div`
  padding-left: 2em;
`;

export function CommentThread({
  thread,
  withLineNumbers = true,
}: {
  thread: Thread;
  withLineNumbers?: boolean;
}) {
  const preview = thread.comments[0].body.markdown
    .trimStart()
    // Filter out ```suggestion
    .split("\n")
    .filter((l) => !l.startsWith("```"))[0]
    .slice(0, 64);
  const [isOpen, setOpen] = useState(false);

  return (
    <ThreadContainer
      className={classNames(withLineNumbers && "withLineNumbers")}
      padding={false}
      heading={
        <ThreadTitle>
          <button onClick={() => setOpen((o) => !o)}>
            {isOpen ? <GoChevronUp size={16} /> : <GoChevronDown size={16} />}
          </button>
          <ThreadPreview>{preview}...</ThreadPreview>
          {thread.resolved && !thread.outdated && <span>(Resolved)</span>}
          {thread.outdated && <span>(Outdated)</span>}
        </ThreadTitle>
      }
    >
      {isOpen &&
        thread.comments.map((c) => (
          <ThreadComment>
            <CommentAuthor
              username={c.author.githubUsername}
              createdAt={c.created}
              updatedAt={c.updated}
            >
              said
            </CommentAuthor>
            <ThreadCommentContent>
              <Markdown>{c.body.markdown}</Markdown>
            </ThreadCommentContent>
          </ThreadComment>
        ))}
    </ThreadContainer>
  );
}
