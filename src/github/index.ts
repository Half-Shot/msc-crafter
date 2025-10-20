import { MSCState, type ClosedMSC, type MSC, type ProposedState } from "../model/MSC";
import { graphql as GraphQL } from "@octokit/graphql";
import resolveMSCQuery from "../github/queries/resolveMSC.gql?raw";
import viewerInfoQuery from "../github/queries/viewerInfo.gql?raw";
import type { ResolveMSCResponse, ResolveMSCResponseComment } from "./queries/resolveMSC";
import type { ViewerInfoResponse } from "./queries/viewerInfo";
import { getImplementationsFromThreads } from "./implementationParser";

type ResolvedPR = ResolveMSCResponse["repository"]["pullRequest"];


function determineMSCState(pullRequest: ResolvedPR): MSCState {
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

async function loadProposal(pullRequest: ResolvedPR): Promise<string|null> {
    const filePath = pullRequest.files.nodes.find(f => f.path.match(/^proposals\/.+\.md$/))?.path;
    if (!filePath) {
        return null;
    }
    const branch = pullRequest.state === "MERGED" ? 'main' :  pullRequest.headRef?.name;
    const name = pullRequest.state === "MERGED" ? 'matrix-org/matrix-spec-proposals/refs/heads' :  pullRequest.headRepository.nameWithOwner;
    if (!branch) {
        return null;
    }
    const req = await fetch(`https://raw.githubusercontent.com/${name}/${branch}/${filePath}`);
    if (!req.ok) {
        throw Error('Failed to fetch proposal body');
    }
    return await req.text();
}

function getTickBoxState(pullRequest: ResolvedPR, expectedState: ProposedState): MSC["proposalState"]|undefined {
    // TODO: Paginate
    const comment = pullRequest.comments.nodes.find(c => {
        if (c.author.login !== "mscbot") {
            return false;
        }
        // \n\n- [ ] @clokep\n- [x] @dbkr\n- [x] @uhoreg\n- [x] @turt2live\n- [x] @ara4n\n- [ ] @anoadragon453\n- [ ] @richvdh\n- [ ] @tulir\n- [x] @erikjohnston\n- [ ] @KitsuneRal\n\n\nConcerns:\n\n
        switch (expectedState) {
            case MSCState.ProposedClose:
                return c.body.match(/Team member @(.+) has proposed to \*\*close\*\* this./)
            case MSCState.ProposedFinalCommentPeriod:
                return c.body.match(/Team member @(.+) has proposed to \*\*merge\*\* this./)
        }
    });
    if (!comment) {
        return undefined;
    }
    const results = comment?.body.matchAll(/- \[(x| )\] @(.+)/g);
    return Object.fromEntries([...results].map(([, checkedStr, username]) => [username, checkedStr === "x"]));
}

export async function resolveMSC(graphql: typeof GraphQL, mscNumber: number): Promise<MSC> {
    const {repository} = await graphql<ResolveMSCResponse>(resolveMSCQuery, { num: mscNumber });
    const proposalText = await loadProposal(repository.pullRequest);

    // Mentioned MSCs
    const mentionedProposals = new Set(proposalText?.match(/MSC\s?\d+/gi)?.map(s => parseInt(s.slice(3))) ?? []);
    repository.pullRequest.body?.match(/MSC\s?\d+/gi)?.map(s => parseInt(s.slice(3))).forEach(s => mentionedProposals.add(s));
    mentionedProposals.delete(mscNumber);
    const state = determineMSCState(repository.pullRequest);
    const kind = repository.pullRequest.labels.nodes.filter(l => l.name.startsWith('kind:')).map(l => l.name.slice('kind:'.length))

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
        relatedEndpoints: [],
        mentionedMSCs: [...mentionedProposals],
        proposalState: [MSCState.ProposedClose, MSCState.ProposedFinalCommentPeriod, MSCState.ProposedMerge].includes(state) && getTickBoxState(repository.pullRequest, state as ProposedState),
        implementations: getImplementationsFromThreads(repository.pullRequest, proposalText),
        kind,
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