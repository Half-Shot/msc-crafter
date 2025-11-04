export interface ResolveMSCHistoryResponse {
  repository: {
    pullRequest: {
      commits: {
        nodes: {
          commit: {
            authoredDate: string;
            additions: number;
            deletions: number;
            messageHeadline: string;
            url: string;
            author: {
              user: {
                login: string;
              } | null;
              name: string;
            };
          };
        }[];
        pageInfo: {
          hasPreviousPage: boolean;
          startCursor: string;
        };
      };
    };
  };
}
