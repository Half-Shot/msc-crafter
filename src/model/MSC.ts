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

export type ProposedState =
  | MSCState.ProposedClose
  | MSCState.ProposedFinalCommentPeriod;

export interface Comment {
  author: {
    githubUsername: string;
  };
  body: {
    markdown: string;
  };
  created: Date;
  updated?: Date;
}

export interface ProposalState {
  githubUsername: string;
  state: boolean;
}

interface RootMSC {
  prNumber: number;
  created: Date;
  updated: Date;
  state: MSCState;
  kind: string[];
  title: string;
  url: string;
  reactions: Record<string, number>;
  prBody: {
    markdown: string;
  };
  author: {
    githubUsername: string;
  };
  requires: MSC[];
  dependents: MSC[];
  mentionedMSCs: number[];
  body: {
    markdown: string | null;
  };
  comments: Comment[];
  threads: {
    comments: [Comment] & Comment[];
    resolved: boolean;
  }[];
  implementations: {
    url: string;
    title: string;
    logo?: string;
  }[];
  proposalState?: Record<string, boolean>;
}

export interface OpenMSC extends RootMSC {
  state: Exclude<MSCState.Closed, MSCState>;
}

export interface ClosedMSC extends RootMSC {
  state: MSCState.Closed;
  closingComment?: Comment;
}

export type MSC = OpenMSC | ClosedMSC;
