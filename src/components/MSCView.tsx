import styled from "styled-components";
import { type ClosedMSC, type MSC } from "../model/MSC";
import { StateBadge } from "./StateBadge";
import { useMarkdown } from "../hooks/useMarkdown";
import { useProposalText } from "../hooks/useProposalText";
import { MSCLink } from "./MSCLink";
import { FollowBlock } from "./FollowBlock";
import { MemorisedDetails } from "./MemorisedDetails";
import { useLocalMSCCache } from "../hooks/useLocalMSCCache";
import { CommentView } from "./CommentView";
import { VoteBlock } from "./VoteBlock";
import { humanDuration } from "../utils/time";
import { useState } from "preact/hooks";

const Title = styled.h1`
  font-size: 24px;
`;
const WidgetContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 2em;
  margin-bottom: 2em;
`;

const MSCBody = styled.section`
  font-size: 14px;
  padding-left: 2em;
  border-left: 4px solid green;
`;
const ProposalBody = styled.article`
  font-size: 14px;
  padding-left: 2em;
  border-left: 4px solid #f4c331ff;
  text-wrap: wrap;
  max-width: 40vw;
  pre {
    max-width: 100%;
    overflow: scroll;
  }
  table {
    border: 1px solid black;
    margin: 2em auto;

    thead {
      background-color: rgba(119, 119, 119, 1);
      color: rgba(12, 12, 12, 1);
    }

    th {
      padding: 0.5em;
    }
    td {
      padding: 0.5em;
    }
  }
`;

const Container = styled.div`
  max-width: 1280px;
  margin: auto;
`;
const Column = styled.div``;

const ColumnContainer = styled.div`
  display: flex;
  gap: 1em;
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

export function MSCView({ msc }: { msc: MSC }) {
  const prBody = useMarkdown({ stripRenderedLink: true }, msc.prBody.markdown);
  const proposalText = useProposalText(msc.body.markdown ?? undefined);
  const localMSCs = useLocalMSCCache();

  // Experimental, requires local caching
  const mentioningMSCs = localMSCs.filter((m) =>
    m.mentionedMSCs.includes(msc.prNumber),
  );
  const closingComment = (msc as ClosedMSC).closingComment;

  return (
    <Container>
      <header>
        <Title>
          {msc.title} <StateBadge state={msc.state} />
        </Title>
        <WidgetContainer>
          <span>
            <a
              target="_blank"
              href={`https://github.com/${msc.author.githubUsername}`}
            >
              Written by {msc.author.githubUsername}
            </a>
          </span>
          <a target="_blank" href={msc.url}>
            Link to GitHub PR
          </a>
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
      {prBody && (
        <MemorisedDetails
          key={`msccrafter.pullrequestbodyopen.${msc.prNumber}`}
        >
          <summary>Pull request body</summary>
          <MSCBody dangerouslySetInnerHTML={{ __html: prBody }} />
        </MemorisedDetails>
      )}
      <ColumnContainer>
        <Column style={{ "minWidth": "25%", "maxWidth": "25%"}}>
          <h2>Related MSCs</h2>
          <ul>
            {msc.mentionedMSCs?.map((mscNumber) => (
              <li key={mscNumber}>
                <MSCLink kind="mention" mscNumber={mscNumber} />
              </li>
            ))}
            {mentioningMSCs?.map((msc) => (
              <li key={msc.prNumber}>
                <MSCLink kind="mentioned by" mscNumber={msc.prNumber} />
              </li>
            ))}
          </ul>
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
          {proposalText && (
            <FollowBlock>
              <h2>Table of contents</h2>
              <ul>
                {proposalText.headings.map((heading) => (
                  <li key={heading.hash}>
                    <a href={"#" + heading.hash}>{heading.name}</a>
                  </li>
                ))}
              </ul>
            </FollowBlock>
          )}
        </Column>
        <Column>
          <h2>Proposal</h2>
          {proposalText && (
            <ProposalBody
              dangerouslySetInnerHTML={{ __html: proposalText.html }}
            />
          )}
        </Column>
      </ColumnContainer>
    </Container>
  );
}
