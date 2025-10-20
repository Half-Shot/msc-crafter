import styled from "styled-components";
import { MSCState, type ClosedMSC, type MSC } from "../model/MSC";
import { StateBadge } from "./StateBadge";
import { useMarkdown } from "../hooks/useMarkdown";
import { useProposalText } from "../hooks/useProposalText";
import { MSCLink } from "./MSCLink";
import { FollowBlock } from "./FollowBlock";
import { MemorisedDetails } from "./MemorisedDetails";
import { useLocalMSCCache } from "../hooks/useLocalMSCCache";
import { CommentView } from "./CommentView";

const Title = styled.h1`
    font-size: 24px;
`

const MSCBody = styled.section`
    font-size: 14px;
    padding-left: 2em;
    border-left: 4px solid green;
`
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
`

const Container = styled.div`
    max-width: 1280px;
    margin: auto;
`
const Column = styled.div`
`

const ColumnContainer = styled.div`
    display: flex;
`



export function MSCView({msc}: {msc: MSC}) {
    const prBody = useMarkdown({stripRenderedLink: true}, msc.prBody.markdown);
    const proposalText = useProposalText(msc.body.markdown ?? undefined);
    const localMSCs = useLocalMSCCache();

    // Experimental, requires local caching
    const mentioningMSCs = localMSCs.filter((m) => m.mentionedMSCs.includes(msc.prNumber));

    return <Container>
        <header>
            <Title>{msc.title} <StateBadge state={msc.state} /></Title>
            <p>
                Author:<a target="_blank" href={`https://github.com/${msc.author.githubUsername}`}>{msc.author.githubUsername}</a>
            </p>
            <p>
                <a target="_blank" href={msc.url}>Link</a>
            </p>
            {(msc as ClosedMSC).closingComment && <CommentView comment={(msc as ClosedMSC).closingComment} kind="closed"/>}
        </header>
        {prBody && <MemorisedDetails key={`msccrafter.pullrequestbodyopen.${msc.prNumber}`}>
            <summary>Pull request body</summary>
            <MSCBody dangerouslySetInnerHTML={{__html: prBody}} />
        </MemorisedDetails>}
        <ColumnContainer>
            <Column style={{"min-width": "25%"}}>
                <h2>Related MSCs</h2>
                <ol>
                    {
                        msc.mentionedMSCs?.map(mscNumber => <li key={mscNumber}>
                            <MSCLink kind="mention" mscNumber={mscNumber} />
                        </li>)
                    }
                    {
                        mentioningMSCs?.map(msc => <li key={msc.prNumber}>
                            <MSCLink kind="mentioned by" mscNumber={msc.prNumber} />
                        </li>)
                    }
                </ol>
                {proposalText && <FollowBlock>
                <h2>Table of contents</h2>
                    {
                        proposalText.headings.map(heading => <li key={heading.hash}>
                            <a href={'#' + heading.hash}>{heading.name}</a>
                        </li>)
                    }
                </FollowBlock>}
            </Column>
            <Column>
                <h2>Proposal</h2>
                {proposalText && <ProposalBody dangerouslySetInnerHTML={{__html: proposalText.html}} />}
            </Column>
        </ColumnContainer>
    </Container>
}