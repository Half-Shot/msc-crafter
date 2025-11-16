import styled from "styled-components";
import { type ClosedMSC } from "../models/MSC";
import { StateBadge } from "./StateBadge";
import { VoteBlock } from "./VoteBlock";
import { useCurrentMSC } from "../hooks/CurrentMSCContext";
import { MentionedMSCs } from "./MentionedMSCs";
import { useRef, useState } from "preact/hooks";
import { TableOfContents } from "./TableOfContents";
import { ContentBlock, ContentBlockWithHeading } from "./atoms/ContentBlock";
import { ToggleButtonRow } from "./atoms/ToggleButtonRow";
import { lazy, Suspense } from "preact/compat";
import RelativeTime from "./atoms/RelativeTime";
import { GoCommentDiscussion, GoFileBinary, GoLinkExternal, GoNote } from "react-icons/go";
import { Author } from "./atoms/Author";
import { ProposalHistory } from "./ProposalHistory";
import { ThreadSummaryView } from "./proposalviews/ThreadSummaryView";
import { CodeASTContextProvider } from "../hooks/CodeASTContext";
import { Badge } from "./atoms/Badge";

const ProposalBody = lazy(() => import("./ProposalBody"));
const ProposalRawView = lazy(() => import("./proposalviews/ProposalRawView"));
const PullRequestBody = lazy(() => import("./PullRequestBody"));
const CommentView = lazy(() => import("./CommentView"));

const Title = styled.h1`
  font-size: 24px;
`;

const TitleBlock = styled.div`
  display: flex;
  align-items: first baseline;
  gap: 2em;
`;

const WidgetContainer = styled(ContentBlock)`
  display: flex;
  flex-direction: row;
  gap: 2em;
  margin-bottom: 1em;
  align-items: first baseline;
`;

const Container = styled.div`
  max-width: 66vw;
  @media screen and (max-width: 1366px) {
    max-width: none;
  }
  margin: auto;
`;
const LeftColumn = styled.div`
  width: 25%;
  @media screen and (max-width: 800px) {
    width: 100%;
  }
`;
const RightColumn = styled.div`
  width: 75%;
  @media screen and (max-width: 800px) {
    width: 100%;
  }
`;

const ColumnContainer = styled.div`
  display: flex;
  gap: 1em;
  margin-top: 2em;
  flex-direction: row;

  @media screen and (max-width: 800px) {
    flex-direction: column;
  }
`;

const KindBadge = styled(Badge)`
  border: 1px solid rgba(38, 135, 150);
  color: #222222e0;
  background-color: #59cce0cf;
`;

const BetaBadge = styled(Badge)`
  border: 1px dotted var(--mc-color-notice);
  color: var(--mc-color-notice);
  background-color: var(--mc-color-bg-notice);
`;

const ProposalBlockHeading = styled.div`
  display: flex;
  align-items: first baseline;
  justify-content: space-between;
`;

const Disclaimer = styled.p`
  font-size: 0.8em;
`;

enum ProposalView {
  Rendered = "Rendered",
  Threads = "All Threads",
  OpenThreads = "Open Threads",
  OutdatedThreads = "Outdated Threads",
  Plain = "Plain",
}

export default function MSCView() {
  const { msc } = useCurrentMSC();
  const [currentProposalView, setProposalView] = useState<ProposalView>(
    ProposalView.Rendered,
  );

  const closingComment = (msc as ClosedMSC).closingComment;
  const proposalBodyRef = useRef<HTMLElement>(null);

  return (
    <Container>
      <header>
        <TitleBlock>
          <Title>{msc.title}</Title>
          <StateBadge state={msc.state} />
        </TitleBlock>
        <WidgetContainer>
          <span>
            <Author
              linkify
              username={msc.author.githubUsername}
              avatarUrl={msc.author.avatarUrl}
            >
              Written by
            </Author>
          </span>
          <span>
            Created: <RelativeTime>{msc.created}</RelativeTime>
          </span>
          <span>
            Last updated: <RelativeTime>{msc.updated}</RelativeTime>
          </span>
          {msc.kind.map((k) => (
            <KindBadge key={k}>{k}</KindBadge>
          ))}
        </WidgetContainer>
        {closingComment && (
          <CommentView comment={closingComment} kind="closed" />
        )}
      </header>
      {msc.body && <PullRequestBody msc={msc} />}
      <ColumnContainer>
        <LeftColumn>
          <ContentBlock>
            <a href={msc.url} target="_blank" rel="noreferrer">
              <GoLinkExternal /> View on GitHub 
            </a>
          </ContentBlock>
          <MentionedMSCs />
          <ContentBlockWithHeading heading="Implementations">
            <ul>
              {msc.implementations.map((impl) => (
                <li key={impl.url}>
                  <a href={impl.url} target="_blank" rel="noreferrer">
                    <GoLinkExternal /> {impl.title}
                  </a>
                </li>
              ))}
            </ul>
            <p>
              {!msc.implementations.length && <p>No linked implementations</p>}
            </p>
            <Disclaimer>Implementations matching is experimental.</Disclaimer>
          </ContentBlockWithHeading>
          {msc.proposalState && <VoteBlock votes={msc.proposalState} />}
          {currentProposalView === ProposalView.Rendered && (
            <TableOfContents element={proposalBodyRef} />
          )}
          <ProposalHistory />
        </LeftColumn>
        <RightColumn>
          <ContentBlockWithHeading
            heading={
              <ProposalBlockHeading>
                <span>Proposal</span>{" "}
                <ToggleButtonRow
                  values={Object.values(ProposalView)}
                  value={currentProposalView}
                  onChange={setProposalView}
                  labels={{
                    [ProposalView.Rendered]: (
                      <span>
                        <GoNote size={16} />
                        Rendered
                      </span>
                    ),
                    [ProposalView.Plain]: (
                      <span>
                        <GoFileBinary size={16} />
                        Plain
                      </span>
                    ),
                    [ProposalView.OpenThreads]: (
                      <span>
                        <GoCommentDiscussion />
                        {
                          msc.threads.filter((t) => !t.resolved && !t.outdated)
                            .length
                        }{" "}
                        Open
                      </span>
                    ),
                    [ProposalView.Threads]: (
                      <span>
                        <GoCommentDiscussion title="Threads" />
                        {msc.threads.filter((t) => !t.outdated).length} All
                      </span>
                    ),
                    [ProposalView.OutdatedThreads]: (
                      <span>
                        <GoCommentDiscussion />
                        {
                          msc.threads.filter((t) => t.outdated).length
                        } Outdated <BetaBadge>Beta</BetaBadge>
                      </span>
                    ),
                  }}
                />
              </ProposalBlockHeading>
            }
            padding={currentProposalView === ProposalView.Rendered}
          >
            <Suspense fallback={false}>
              <CodeASTContextProvider body={msc.body.markdown}>
                {currentProposalView === ProposalView.Rendered && (
                  <ProposalBody ref={proposalBodyRef} />
                )}
                {currentProposalView === ProposalView.OutdatedThreads && (
                  <ThreadSummaryView filter={(t) => t.outdated} />
                )}
                {currentProposalView === ProposalView.OpenThreads && (
                  <ProposalRawView showThreads onlyOpenThreads />
                )}
                {currentProposalView === ProposalView.Threads && (
                  <ProposalRawView showThreads />
                )}
                {currentProposalView === ProposalView.Plain && (
                  <ProposalRawView showThreads={false} />
                )}
              </CodeASTContextProvider>
            </Suspense>
          </ContentBlockWithHeading>
        </RightColumn>
      </ColumnContainer>
    </Container>
  );
}
