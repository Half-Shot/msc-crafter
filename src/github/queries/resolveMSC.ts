export interface ResolveMSCResponseComment {
  id: string;
  author: {
    avatarUrl: string;
    login: string;
  };
  body: string;
  createdAt: string;
  updatedAt: string;
  minimizedReason: null;
}

export interface ResolveMSCResponse {
  repository: {
    pullRequest: {
      id: string;
      title: string;
      state: "OPEN" | "CLOSED" | "MERGED";
      lastEditedAt: string;
      createdAt: string;
      closedAt: string;
      isDraft: boolean;
      files: {
        nodes: {
          path: string;
        }[];
      };
      headRef: {
        name: string;
      };
      headRepository: {
        nameWithOwner: string;
      };
      commits: {
        nodes: [
          {
            commit: {
              authoredDate: string;
            };
          },
        ];
      };
      labels: {
        nodes: {
          id: string;
          name: string;
          color: string;
          description: null;
        }[];
      };
      url: string;
      author: {
        avatarUrl: string;
        login: string;
      };
      body: string;
    };
  };
}

export interface ResolveMSCCommentsResponse {
  repository: {
    pullRequest: {
      comments: {
        totalCount: number;
        pageInfo: {
          hasNextPage: boolean;
        };
        nodes: ResolveMSCResponseComment[];
      };
    };
  };
}

export interface ResolveMSCReviewThreadsResponse {
  repository: {
    pullRequest: {
      latestReviews: {
        nodes: {
          id: string;
          author: {
            login: string;
            avatarUrl: string;
          };
          state: "COMMENTED" | "CHANGES_REQUESTED" | "APPROVED";
          body: string;
        }[];
      };
      reviewThreads: {
        nodes: {
          line: number;
          startLine: number;
          originalLine: number;
          isResolved: boolean;
          id: string;
          comments: {
            nodes: ResolveMSCResponseComment[];
          };
        }[];
      };
    };
  };
}
