import { graphql as GraphQL } from "@octokit/graphql";
import resolveMSCHistoryQuery from "../github/queries/resolveMSCHistory.gql?raw";
import type { ResolveMSCHistoryResponse } from "./queries/resolveMSCHistory";
import type { CommitHistory } from "../models/history";

export async function loadCommitHistory(
  commit: ResolveMSCHistoryResponse["repository"]["pullRequest"]["commits"]["nodes"][0]["commit"],
): Promise<string | null> {
  const req = await fetch(`${commit.url}.diff`);
  if (!req.ok) {
    throw Error("Failed to fetch proposal body");
  }
  return await req.text();
}

/**
 * Get a MSC from GitHub.
 * @param graphql The authenticated graphql instance.
 * @param mscNumber The MSC to request
 * @param fullRender Whether to return a full MSC response, or skip details that would require more requests.
 * @returns
 */
export async function resolveMSCHistory(
  graphql: typeof GraphQL,
  mscNumber: number,
  pagintionToken?: string,
): Promise<{ history: CommitHistory[]; token?: string }> {
  const { repository } = await graphql<ResolveMSCHistoryResponse>(
    resolveMSCHistoryQuery,
    {
      num: mscNumber,
      cursor: pagintionToken,
    },
  );
  const commits = repository.pullRequest.commits;

  const history: CommitHistory[] = commits.nodes.reverse().map((c) => ({
    authoredDate: new Date(c.commit.authoredDate),
    author: {
      gitName: c.commit.author.name,
      username: c.commit.author.user?.login ?? undefined,
    },
    additions: c.commit.additions,
    deletions: c.commit.deletions,
    url: c.commit.url,
    message: c.commit.messageHeadline,
  }));

  return {
    history,
    token: commits.pageInfo.hasPreviousPage
      ? commits.pageInfo.startCursor
      : undefined,
  };
}
