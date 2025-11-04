export interface CommitHistory {
  authoredDate: Date;
  additions: number;
  deletions: number;
  message: string;
  url: string;
  author: {
    username?: string;
    gitName: string;
  };
}
