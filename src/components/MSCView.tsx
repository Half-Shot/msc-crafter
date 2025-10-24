import styled from "styled-components";
import { MSCState, type ClosedMSC } from "../model/MSC";
import { StateBadge } from "./StateBadge";
import { useMarkdown } from "../hooks/useMarkdown";
import { FollowBlock } from "./FollowBlock";
import { MemorisedDetails } from "./MemorisedDetails";
import { CommentView } from "./CommentView";
import { VoteBlock } from "./VoteBlock";
import { humanDuration } from "../time";
import { ProposalBody } from "./ProposalBody";
import { useCurrentMSC } from "../hooks/CurrentMSCContext";
import { MentionedMSCs } from "./MentionedMSCs";
import { useRef, useState } from "preact/hooks";
import { TableOfContents } from "./TableOfContents";
import { ProposalRawView } from "./ProposalRawView";
import { ContentBlock } from "./atoms/ContentBlock";
import { ToggleButtonRow } from "./atoms/ToggleButtonRow";

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

const PullRequestBody = styled.section`
  font-size: 14px;
  padding-left: 2em;
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

enum ProposalView {
  Rendered = "Rendered",
  Threads = "Threads",
  Plain = "Plain",
}

export function MSCView() {
  const { msc } = useCurrentMSC();
  const [currentProposalView, setProposalView] = useState<ProposalView>(
    ProposalView.Rendered,
  );

  const prBody = useMarkdown({ stripRenderedLink: true }, msc.prBody.markdown);
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
      <ContentBlock>
        {prBody ? (
          <MemorisedDetails
            storageKey={`msccrafter.pullrequestbodyopen.${msc.prNumber}`}
            defaultValue={msc.state !== MSCState.Closed}
          >
            <summary>Pull request body</summary>
            <PullRequestBody dangerouslySetInnerHTML={{ __html: prBody }} />
          </MemorisedDetails>
        ) : (
          <p>No Pull Request body provided</p>
        )}
      </ContentBlock>
      <ColumnContainer>
        <LeftColumn>
          <ContentBlock>
            <a href={msc.url} target="_blank">
              View on GitHub
            </a>
            <ToggleButtonRow
              values={Object.values(ProposalView)}
              value={currentProposalView}
              onChange={setProposalView}
            />
          </ContentBlock>
          <MentionedMSCs />
          <ContentBlock>
            <h2>Implementations</h2>
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
          </ContentBlock>
          {msc.proposalState && <VoteBlock votes={msc.proposalState} />}
          {currentProposalView === ProposalView.Rendered && (
            <TableOfContents element={proposalBodyRef} />
          )}
        </LeftColumn>
        <RightColumn>
          <ContentBlock>
            {currentProposalView === ProposalView.Rendered && (
              <ProposalBody ref={proposalBodyRef} />
            )}
            {currentProposalView === ProposalView.Threads && (
              <ProposalRawView showThreads={true} />
            )}
            {currentProposalView === ProposalView.Plain && (
              <ProposalRawView showThreads={false} />
            )}
          </ContentBlock>
        </RightColumn>
      </ColumnContainer>
    </Container>
  );
}
