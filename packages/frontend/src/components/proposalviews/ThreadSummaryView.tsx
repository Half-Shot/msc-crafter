import { useMemo } from "preact/hooks";
import { useCurrentMSC } from "../../hooks/CurrentMSCContext";
import type { Thread } from "../../models/MSC";
import { CommentThread } from "./commentThread";
import styled from "styled-components";
import { RawViewWithBody } from "../RawView";

const ThreadList = styled.ol`
  margin-top: 2em;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 2em;
`;

const ThreadContainer = styled.div``;

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
        // TODO: Not a safe key
        <ThreadContainer key={thread.comments[0].created.toISOString()}>
          {thread.diffHunk && <RawViewWithBody body={thread.diffHunk} />}
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
