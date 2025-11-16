import { useMemo } from "preact/hooks";
import { useCurrentMSC } from "../hooks/CurrentMSCContext";
import type { Thread } from "../models/MSC";
import { CommentThread } from "./proposalviews/commentThread";
import styled from "styled-components";

const ThreadList = styled.ol`
  margin-top: 2em;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 2em;
`;

const ThreadContainer = styled.div``;

const CodeSample = styled.pre``;

export function ThreadSummaryView({
  filter,
}: {
  filter: (thread: Thread) => boolean;
}) {
  const { msc } = useCurrentMSC();
  const threads = useMemo(
    () => msc.threads.filter(filter),
    [msc.threads, filter],
  );
  return (
    <ThreadList>
      {threads.map((thread) => (
        <ThreadContainer>
          <CodeSample>{thread.diffHunk}</CodeSample>
          <CommentThread
            key={thread.line}
            thread={thread}
            withLineNumbers={false}
          />
        </ThreadContainer>
      ))}
    </ThreadList>
  );
}
