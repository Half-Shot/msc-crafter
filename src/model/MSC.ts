export enum MSCState {
    Draft,
    Open,
    ProposedFinalCommentPeriod,
    FinalCommentPeriod,
    ProposedMerge,
    Merged,
    ProposedClose,
    Closed,
    Unknown,
}

export interface Comment {
    author: {
        githubUsername: string;
    },
    body: {
        markdown: string;
        html: string;
    },
    created: Date;
    updated: Date;
}

export interface ProposalState {
    githubUsername: string;
    state: boolean;
}

export interface SpecEndpoint {
    new: boolean;
    relatedSpecUrl: string;
    name: string;
    body: string;
}


export interface MSC {
    prNumber: number;
    created: Date;
    updated: Date;
    title: string;
    state: MSCState;
    url: string;
    reactions: Record<string, number>;
    prBody: {
        markdown: string;
    },
    author: {
        githubUsername: string;
    };
    requires: MSC[];
    dependents: MSC[];
    mentionedMSCs: number[];
    body: {
        markdown: string|null;
    },
    comments: Comment[];
    threads: {
        comments: [Comment]&Comment[],
        resolved: boolean;
    }[];
    proposalState: {
        [MSCState.FinalCommentPeriod]: ProposalState[],
        [MSCState.Merged]: ProposalState[],
        [MSCState.Closed]: ProposalState[],
    };
    relatedEndpoints: SpecEndpoint[],
}