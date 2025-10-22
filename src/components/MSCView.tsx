import styled from "styled-components";
import { MSCState, type ClosedMSC } from "../model/MSC";
import { StateBadge } from "./StateBadge";
import { useMarkdown } from "../hooks/useMarkdown";
import { FollowBlock } from "./FollowBlock";
import { MemorisedDetails } from "./MemorisedDetails";
import { CommentView } from "./CommentView";
import { VoteBlock } from "./VoteBlock";
import { humanDuration } from "../utils/time";
import { ProposalBody } from "./ProposalBody";
import { useCurrentMSC } from "../hooks/CurrentMSCContext";
import { MentionedMSCs } from "./MentionedMSCs";
import { useRef } from "preact/hooks";
import { TableOfContents } from "./TableOfContents";

const Title = styled.h1`
  font-size: 24px;
`;
const WidgetContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 2em;
  margin-bottom: 1em;
  align-items: first baseline;
`;

const MSCBody = styled.section`
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

export function MSCView() {
  const { msc } = useCurrentMSC();
  const prBody = useMarkdown({ stripRenderedLink: true }, msc.prBody.markdown);
  const closingComment = (msc as ClosedMSC).closingComment;
  const proposalBodyRef = useRef<HTMLElement>(null);

  return (
    <Container>
      <header>
        <WidgetContainer>
          <Title>{msc.title}</Title>
          <StateBadge state={msc.state} />
        </WidgetContainer>
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
      {prBody ? (
        <MemorisedDetails
          storageKey={`msccrafter.pullrequestbodyopen.${msc.prNumber}`}
          defaultValue={msc.state !== MSCState.Closed}
        >
          <summary>Pull request body</summary>
          <MSCBody dangerouslySetInnerHTML={{ __html: prBody }} />
        </MemorisedDetails>
      ) : (
        <p>No Pull Request body provided</p>
      )}

      <ColumnContainer>
        <LeftColumn>
          <a href={msc.url} target="_blank">
            View on GitHub
          </a>
          <MentionedMSCs />
          <h2>Implementations</h2>
          <p>Implementations matching is experimental, some may be missing.</p>
          <ul>
            {msc.implementations?.map((impl) => (
              <li key={impl.url}>
                <a href={impl.url} target="_blank">
                  {impl.title}
                </a>
              </li>
            ))}
          </ul>
          {msc.proposalState && <VoteBlock votes={msc.proposalState} />}
          <FollowBlock>
            <TableOfContents element={proposalBodyRef} />
          </FollowBlock>
        </LeftColumn>
        <RightColumn>
          <h2 style={{ marginTop: 0 }}>Proposal</h2>
          {msc.body && <ProposalBody ref={proposalBodyRef} />}
        </RightColumn>
      </ColumnContainer>
    </Container>
  );
}
