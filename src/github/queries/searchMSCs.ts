export interface SearchMCSCsResponse {
  search: {
    nodes: [
      {
        __typename: "PullRequest" | "Issue";
        title: string;
        number: number;
        author: {
          login: string;
        };
      },
    ];
  };
}
