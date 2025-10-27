import styled from "styled-components";
import { type ClosedMSC } from "../model/MSC";
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
import { GoCommentDiscussion, GoFileBinary, GoNote } from "react-icons/go";

const ProposalBody = lazy(() => import("./ProposalBody"));
const ProposalRawView = lazy(() => import("./ProposalRawView"));
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

const KindBadge = styled.div`
  border: 1px solid rgba(38, 135, 150);
  border-radius: 2em;
  color: #222222e0;
  background-color: #59cce0cf;
  padding: 0.25em 1em;
  font-size: 1rem;
  font-weight: 600;
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
            Written by
            <a
              style={{ marginLeft: "0.5em" }}
              target="_blank"
              href={`https://github.com/${msc.author.githubUsername}`}
            >
              {msc.author.githubUsername}
            </a>
          </span>
          <span>
            Created: <RelativeTime>{msc.created}</RelativeTime>
          </span>
          <span>
            Last updated: <RelativeTime>{msc.updated}</RelativeTime>
          </span>
          {msc.kind.map((k) => (
            <KindBadge>{k}</KindBadge>
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
            <a href={msc.url} target="_blank">
              View on GitHub
            </a>
          </ContentBlock>
          <MentionedMSCs />
          <ContentBlockWithHeading heading="Implementations">
            <ul>
              {msc.implementations.map((impl) => (
                <li key={impl.url}>
                  <a href={impl.url} target="_blank">
                    {impl.title}
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
                        {msc.threads.filter((t) => !t.resolved).length} Open
                        Threads
                      </span>
                    ),
                    [ProposalView.Threads]: (
                      <span>
                        <GoCommentDiscussion title="Threads" />
                        {msc.threads.length} Threads
                      </span>
                    ),
                  }}
                />
              </ProposalBlockHeading>
            }
            padding={currentProposalView === ProposalView.Rendered}
          >
            <Suspense fallback={false}>
              {currentProposalView === ProposalView.Rendered ? (
                <ProposalBody ref={proposalBodyRef} />
              ) : (
                <ProposalRawView
                  showThreads={
                    currentProposalView === ProposalView.Threads ||
                    currentProposalView === ProposalView.OpenThreads
                  }
                  onlyOpenThreads={
                    currentProposalView === ProposalView.OpenThreads
                  }
                />
              )}
            </Suspense>
          </ContentBlockWithHeading>
        </RightColumn>
      </ColumnContainer>
    </Container>
  );
}
