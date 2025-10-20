import styled from "styled-components";
import { MSCState } from "../model/MSC";

export const StateBadgeContainer = styled.span`
    border: 3px solid  #525252ff;
    border-radius: 12px;
    color: #ffffffe0;
    background-color:  #525252cf;
    padding: 8px;
    font-size: 0.8rem;

    &.closed {
        border-color: rgba(137, 0, 0, 0.81);
        background-color: rgba(137, 0, 0, 0.81);
    }

    &.merged {
        border-color: rgba(138, 138, 138, 0.81);
        background-color: rgba(89, 0, 137, 0.81);
    }

    &.open {
        color: rgba(41, 41, 41);
        border-color: rgba(80, 212, 53, 1);
        background-color: rgba(80, 212, 53, 0.81);
    }

    &.p-fcp {
        color: rgba(41, 41, 41);
        border-style: dashed;
        border-color: rgba(212, 146, 53, 1);
        background-color: rgba(212, 146, 53, 0.81);
    }
    &.p-fcp {
        color: rgba(41, 41, 41);
        border-color: rgba(212, 146, 53, 1);
        background-color: rgba(212, 146, 53, 0.81);
    }
`

export const StateBadge = ({state}: {state: MSCState}) => {
    let text: string;
    let className: string|undefined;

    switch (state) {
        case MSCState.Closed:
            text = "Closed";
            className = "closed";
            break;
        case MSCState.FinalCommentPeriod:
            text = "FCP";
            className = "fcp";
            break;
        case MSCState.Merged:
            text = "Merged";
            className = "merged";
            break;
        case MSCState.Draft:
            text = "Draft";
            className = "draft";
            break;
        case MSCState.Open:
            text = "Open";
            className = "open";
            break;
        case MSCState.ProposedClose:
            text = "Proposed Close";
            className = "p-close";
            break;
        case MSCState.ProposedFinalCommentPeriod:
            text = "Proposed FCP";
            className = "p-fcp";
            break;
        case MSCState.ProposedMerge:
            text = "Ready to merge";
            className = "ready";
            break;
        default:
            text = "Unknown";
            break;
    }

        
    return <StateBadgeContainer className={className}>
        {text}
    </StateBadgeContainer>
}