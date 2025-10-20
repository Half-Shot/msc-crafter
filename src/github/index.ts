import { MSCState, type ClosedMSC, type MSC } from "../model/MSC";
import { graphql as GraphQL } from "@octokit/graphql";
import resolveMSCQuery from "../github/queries/resolveMSC.gql?raw";
import viewerInfoQuery from "../github/queries/viewerInfo.gql?raw";
import type { ResolveMSCResponse, ResolveMSCResponseComment } from "./queries/resolveMSC";
import type { ViewerInfoResponse } from "./queries/viewerInfo";

function determineMSCState(pullRequest: ResolveMSCResponse["repository"]["pullRequest"]): MSCState {
    if (pullRequest.state === "CLOSED") {
        return MSCState.Closed;
    } else if (pullRequest.state === "MERGED") {
        return MSCState.Merged;
    } else if (pullRequest.isDraft) {
        return MSCState.Draft;
    }

    if (pullRequest.labels.nodes.some(s => s.name === 'finished-final-comment-period')) {
        return MSCState.ProposedMerge;
    }    

    if (pullRequest.labels.nodes.some(s => s.name === 'final-comment-period')) {
        return MSCState.FinalCommentPeriod;
    }
  
    if (pullRequest.labels.nodes.some(s => s.name === 'proposed-final-comment-period')) {
        return MSCState.ProposedFinalCommentPeriod;
    }
    return MSCState.Open;
}

async function loadProposal(pullRequest: ResolveMSCResponse["repository"]["pullRequest"]): Promise<string|null> {
    const filePath = pullRequest.files.nodes[0].path;
    if (!filePath.match(/^proposals\/.+\.md$/)) {
        return null;
    }
    const branch = pullRequest.state === "MERGED" ? 'main' :  pullRequest.headRef?.name;
    if (!branch) {
        return null;
    }
    const req = await fetch(`https://raw.githubusercontent.com/${pullRequest.headRepository.nameWithOwner}/${branch}/${filePath}`);
    if (!req.ok) {
        throw Error('Failed to fetch proposal body');
    }
    return await req.text();
}

export async function resolveMSC(graphql: typeof GraphQL, mscNumber: number): Promise<MSC> {
    const {repository} = await graphql<ResolveMSCResponse>(resolveMSCQuery, { num: mscNumber });
    const proposalText = await loadProposal(repository.pullRequest);

    // Mentioned MSCs
    const mentionedProposals = new Set(proposalText?.match(/MSC\s?\d+/gi)?.map(s => parseInt(s.slice(3))) ?? []);
    repository.pullRequest.body?.match(/MSC\s?\d+/gi)?.map(s => parseInt(s.slice(3))).forEach(s => mentionedProposals.add(s));
    mentionedProposals.delete(mscNumber);
    const state = determineMSCState(repository.pullRequest);

    const msc = {
        prNumber: mscNumber,
        created: new Date(repository.pullRequest.createdAt),
        updated: new Date(repository.pullRequest.lastEditedAt),
        title: repository.pullRequest.title,
        state,
        url: repository.pullRequest.url,
        reactions: {},
        prBody: {
            markdown: repository.pullRequest.body,
        },
        author: {
            githubUsername: repository.pullRequest.author.login,
        },
        requires: [],
        dependents: [],
        body: {
            markdown: proposalText,
        },
        comments: [],
        threads: [],
        proposalState: {
            [MSCState.FinalCommentPeriod]: [],
            [MSCState.Merged]: [],
            [MSCState.Closed]: []
        },
        relatedEndpoints: [],
        mentionedMSCs: [...mentionedProposals],
    } as MSC;


    // Get closing comment
    if (state === MSCState.Closed) {
        // No GQL api for this, which sucks.
        const closedAtDate = new Date(repository.pullRequest.closedAt);
        let closestComment: ResolveMSCResponseComment|undefined;
        let currentTimeDiff = Number.MAX_SAFE_INTEGER;
        for (const comment of repository.pullRequest.comments.nodes) {
            const timeDiff = Math.abs(new Date(comment.createdAt).getTime() - closedAtDate.getTime());
            if (timeDiff < currentTimeDiff) {
                currentTimeDiff = timeDiff;
                closestComment = comment;
            }
            console.log(currentTimeDiff, closestComment);
        }
        return {
            ...msc,
            state: MSCState.Closed,
            closingComment: closestComment && {
                author: {
                    githubUsername: closestComment.author.login,
                },
                body: {
                    markdown: closestComment.body,
                },
                created: new Date(closestComment.createdAt),
            }
        } as ClosedMSC;
    }
    return msc;
}


export async function viewerInfo(graphql: typeof GraphQL): Promise<ViewerInfoResponse["viewer"]> {
    const {viewer} = await graphql<ViewerInfoResponse>(viewerInfoQuery);
    return viewer;
}