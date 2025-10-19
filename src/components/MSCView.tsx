import styled from "styled-components";
import type { MSC } from "../model/MSC";
import { StateBadge } from "./StateBadge";
import { useMarkdown } from "../hooks/useMarkdown";
import { useProposalText } from "../hooks/useProposalText";
import { MSCLink } from "./MSCLink";

const Title = styled.h1`
    font-size: 24px;
`

const MSCBody = styled.section`
    font-size: 12px;
    padding-left: 2em;
    border-left: 4px solid green;
`
const ProposalBody = styled.article`
    font-size: 12px;
    padding-left: 2em;
    border-left: 4px solid #f4c331ff;
    text-wrap: wrap;
    max-width: 80vw;
    line-break: anywhere;
    word-break: break-all;

    pre {
       max-width: 100%;
       overflow: scroll;
    }
`

export function MSCView({msc}: {msc: MSC}) {
    const prBody = useMarkdown({stripRenderedLink: true}, msc.prBody.markdown);
    const proposalText = useProposalText(msc.body.markdown ?? undefined);

    // Experimental, requires local caching
    const mentioningMSCs = Object.entries(localStorage).filter(([k]) => k.startsWith('msccrafter.msc.')).map(([, v]) => (JSON.parse(v) as MSC)).filter((m) => m.mentionedMSCs.includes(msc.prNumber))

    console.log(mentioningMSCs);

    return <div>
        <header>
            <Title>{msc.title} <StateBadge state={msc.state} /></Title>
            <p>
                Author:<a target="_blank" href={`https://github.com/${msc.author.githubUsername}`}>{msc.author.githubUsername}</a>
            </p>
            <p>
                <a target="_blank" href={msc.url}>Link</a>
            </p>
        </header>
        {prBody && <MSCBody dangerouslySetInnerHTML={{__html: prBody}} />}
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
        <h2>Proposal</h2>
        {proposalText && <ol>
            {
                proposalText.headings.map(heading => <li key={heading.hash}>
                    <a href={'#' + heading.hash}>{heading.name}</a>
                </li>)
            }
        </ol>}
        {proposalText && <ProposalBody dangerouslySetInnerHTML={{__html: proposalText.html}} />}
    </div>
}