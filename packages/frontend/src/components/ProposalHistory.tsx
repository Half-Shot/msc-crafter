import styled from "styled-components";
import { useMSCHistory } from "../hooks/useMSCHistory";
import { ContentBlockWithHeading } from "./atoms/ContentBlock";
import { useEffect, useMemo } from "preact/hooks";
import type { CommitHistory } from "../models/history";
import RelativeTime from "./atoms/RelativeTime";
import {
  GoCheckCircle,
  GoCheckCircleFill,
  GoChevronDown,
  GoLinkExternal,
  GoNorthStar,
  GoSmiley,
} from "react-icons/go";
import { useCurrentMSC } from "../hooks/CurrentMSCContext";
import { useLocalStorage } from "@mantine/hooks";
import { Button } from "./atoms/Button";

const Additions = styled.span`
  color: green;
  padding: 0 0.25em;
`;
const Deletions = styled.span`
  color: red;
  padding: 0 0.25em;
`;

const ChangesContainerDiv = styled.span`
  display: flex;
  flex-direction: row;
`;

const Message = styled.span`
  font-weight: 400;
  font-size: 1.1em;
`;

const AdditionalDetails = styled.div`
  font-size: 1em;
  display: flex;
  flex-direction: row;
  gap: 0.25em;
`;

const CommitListItem = styled.li`
  list-style: none;
  display: flex;
  flex-direction: row;
  border-radius: var(--mc-border-radius);
  border: 2px solid var(--mc-color-block-border);
  overflow: clip;
  border-top: 0;
  border-radius: 0;
  align-items: center;

  &.unread {
    border-color: var(--mc-color-highlight);
  }

  > div:nth-child(1) {
    padding: 0.5em;
    flex: 1;
  }

  > a {
    font-size: 1.5em;
    margin: 0.5em;
    width: 1.5em;
    height: 1.5em;
    border: 0;
    background: 0;
  }

  &:nth-child(1) {
    border-radius: var(--mc-border-radius) var(--mc-border-radius) 0em 0em;
    border-top: 2px solid var(--mc-color-block-border);
    &.unread {
      border-top: 2px solid var(--mc-color-highlight);
    }
  }
  &:last-child {
    border-radius: 0em 0em var(--mc-border-radius) var(--mc-border-radius);
    border-bottom: 2px solid var(--mc-color-block-border);
    &.unread {
      border-bottom: 2px solid var(--mc-color-highlight);
    }
  }
`;

const GroupListItem = styled.li`
  list-style: none;
  padding-left: 0.5em;
  border-left: var(--mc-color-block-border) 1px solid;

  margin-bottom: 2em;

  > ol {
    margin: 0;
    padding: 0.25em;
  }

  h2 {
    margin: 0;
    margin-bottom: 0.25em;
    font-size: 1em;
    font-weight: 400;
  }
`;

// Things we want to do:
// Gather updates based on close-together-ness

const GROUP_COMMIT_IF_WITIHN = 24 * 60 * 60000;

function ChangesContainer({
  additions,
  deletions,
}: {
  additions: number;
  deletions: number;
}) {
  return (
    <ChangesContainerDiv>
      <Additions title="Additions">{additions}</Additions>
      <Deletions title="Removals">{deletions}</Deletions>
    </ChangesContainerDiv>
  );
}

function CommitItem({
  commit,
  hasBeenRead,
}: {
  commit: CommitHistory;
  hasBeenRead: boolean;
}) {
  return (
    <CommitListItem
      key={commit.url}
      className={hasBeenRead ? "read" : "unread"}
    >
      <div>
        <Message>
          {" "}
          {!hasBeenRead ? <GoNorthStar title="New changes" /> : null}{" "}
          {commit.message}
        </Message>
        <AdditionalDetails>
          Commited <RelativeTime>{commit.authoredDate}</RelativeTime>
          <ChangesContainer {...commit} />
        </AdditionalDetails>
      </div>
      <a href={commit.url} target="_blank" rel="noreferrer">
        <GoLinkExternal />
      </a>
    </CommitListItem>
  );
}

export function ProposalHistory() {
  const { msc } = useCurrentMSC();
  const { history, paginateBackwards } = useMSCHistory();
  const [readUpTo, setReadUpTo] = useLocalStorage<number | null>({
    key: `msccrafter.${msc.prNumber}.read_up_to`,
    defaultValue: null,
  });

  useEffect(() => {
    if (!history.length) {
      return;
    }
    // If we've never read this proposal before, set the read head as now.
    if (readUpTo === null) {
      setReadUpTo(history[0].authoredDate.getTime());
    }
  }, [history]);

  const gatheredHistory = useMemo(() => {
    if (!history.length) {
      return [];
    }
    let currentItems: CommitHistory[] = [];
    let currentTs = history[0].authoredDate.getTime();
    const set: {
      date: Date;
      items: CommitHistory[];
      additions: number;
      deletions: number;
    }[] = [];
    for (const commit of history) {
      if (
        Math.abs(currentTs - commit.authoredDate.getTime()) <
        GROUP_COMMIT_IF_WITIHN
      ) {
        currentItems.push(commit);
      } else {
        set.push({
          date: new Date(currentTs),
          items: currentItems,
          additions: currentItems
            .map((a) => a.additions)
            .reduce((a, b) => a + b),
          deletions: currentItems
            .map((a) => a.deletions)
            .reduce((a, b) => a + b),
        });
        currentTs = commit.authoredDate.getTime();
        currentItems = [commit];
      }
    }
    set.push({
      date: new Date(currentTs),
      items: currentItems,
      additions: currentItems.map((a) => a.additions).reduce((a, b) => a + b),
      deletions: currentItems.map((a) => a.deletions).reduce((a, b) => a + b),
    });
    return set;
  }, [history]);

  const firstCommitTime = history[0]?.authoredDate.getTime();
  const canMarkAsRead =
    readUpTo && firstCommitTime && firstCommitTime > readUpTo;

  return (
    <ContentBlockWithHeading heading="History">
      {canMarkAsRead && (
        <Button
          icon={GoCheckCircle}
          onClick={() => setReadUpTo(firstCommitTime)}
        >
          Mark all as read
        </Button>
      )}
      {!canMarkAsRead && (
        <Button disabled icon={GoCheckCircleFill}>
          You are up to date
        </Button>
      )}
      {gatheredHistory.map((section) => (
        <GroupListItem key={section.date.getTime()}>
          <h2>Commits on {section.date.toLocaleDateString()}</h2>
          <ol>
            {section.items.map((c) => (
              <CommitItem
                key={c.url}
                commit={c}
                hasBeenRead={
                  !!(readUpTo && c.authoredDate.getTime() <= readUpTo)
                }
              />
            ))}
          </ol>
        </GroupListItem>
      ))}
      {paginateBackwards && (
        <Button icon={GoChevronDown} onClick={paginateBackwards}>
          See earlier
        </Button>
      )}
      {!paginateBackwards && (
        <Button icon={GoSmiley} disabled>
          There is no more
        </Button>
      )}
    </ContentBlockWithHeading>
  );
}
