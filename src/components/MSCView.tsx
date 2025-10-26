import styled from "styled-components";
import { type ClosedMSC } from "../model/MSC";
import { StateBadge } from "./StateBadge";
import { VoteBlock } from "./VoteBlock";
import { humanDuration } from "../time";
import { useCurrentMSC } from "../hooks/CurrentMSCContext";
import { MentionedMSCs } from "./MentionedMSCs";
import { useRef, useState } from "preact/hooks";
import { TableOfContents } from "./TableOfContents";
import { ContentBlock, ContentBlockWithHeading } from "./atoms/ContentBlock";
import { ToggleButtonRow } from "./atoms/ToggleButtonRow";
import { lazy, Suspense } from "preact/compat";

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
  max-width: 1280px;
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

const FormattedTime = styled.time`
  text-decoration: underline dashed;
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

enum ProposalView {
  Rendered = "Rendered",
  Threads = "Threads",
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
            Created:{" "}
            <FormattedTime
              title={msc.created.toLocaleString()}
              dateTime={msc.created.toISOString()}
            >
              {humanDuration(msc.created)}
            </FormattedTime>
          </span>
          <span>
            Last updated:{" "}
            <FormattedTime
              title={msc.updated.toLocaleString()}
              dateTime={msc.updated.toISOString()}
            >
              {humanDuration(msc.updated)}
            </FormattedTime>
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
            <p>
              Implementations matching is experimental, some may be missing.
            </p>
            <ul>
              {msc.implementations?.map((impl) => (
                <li key={impl.url}>
                  <a href={impl.url} target="_blank">
                    {impl.title}
                  </a>
                </li>
              ))}
            </ul>
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
                  showThreads={currentProposalView === ProposalView.Threads}
                />
              )}
            </Suspense>
          </ContentBlockWithHeading>
        </RightColumn>
      </ColumnContainer>
    </Container>
  );
}
